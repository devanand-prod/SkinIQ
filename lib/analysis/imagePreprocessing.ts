import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';

export interface RgbaImage {
  data: Uint8Array;
  width: number;
  height: number;
}

export interface LetterboxResult extends RgbaImage {
  /** Scale applied to the original image before padding. */
  scale: number;
  padLeft: number;
  padTop: number;
  originalWidth: number;
  originalHeight: number;
}

/**
 * Pure-JS base64 decoder — avoids pulling in a whole extra dependency (or
 * relying on a global atob/Buffer that isn't guaranteed present under
 * Hermes) just to turn expo-file-system's base64 string into bytes.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const byteLength = Math.floor((clean.length * 3) / 4) - (clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0);
  const bytes = new Uint8Array(byteLength);

  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup[clean.charCodeAt(i)];
    const b = lookup[clean.charCodeAt(i + 1)];
    const c = lookup[clean.charCodeAt(i + 2)];
    const d = lookup[clean.charCodeAt(i + 3)];

    if (p < byteLength) bytes[p++] = (a << 2) | (b >> 4);
    if (p < byteLength) bytes[p++] = ((b & 15) << 4) | (c >> 2);
    if (p < byteLength) bytes[p++] = ((c & 3) << 6) | d;
  }
  return bytes;
}

async function readJpegAsRgba(uri: string): Promise<RgbaImage> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bytes = base64ToUint8Array(base64);
  const decoded = jpeg.decode(bytes, { useTArray: true });
  return { data: decoded.data as Uint8Array, width: decoded.width, height: decoded.height };
}

export async function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  const result = await ImageManipulator.manipulateAsync(uri, [], {});
  return { width: result.width, height: result.height };
}

/**
 * Resize-short-side then center-crop to a square, matching the EfficientNet
 * preprocessing the skin-signals model expects. Returns a decoded
 * `inputSize` x `inputSize` RGBA buffer.
 */
export async function resizeAndCenterCrop(
  uri: string,
  inputSize: number,
  resizeShortSide: number
): Promise<RgbaImage> {
  const { width, height } = await getImageSize(uri);
  const scale = resizeShortSide / Math.min(width, height);
  const resizedWidth = Math.round(width * scale);
  const resizedHeight = Math.round(height * scale);
  const originX = Math.max(0, Math.round((resizedWidth - inputSize) / 2));
  const originY = Math.max(0, Math.round((resizedHeight - inputSize) / 2));

  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [
      { resize: { width: resizedWidth, height: resizedHeight } },
      { crop: { originX, originY, width: inputSize, height: inputSize } },
    ],
    { compress: 0.92, format: ImageManipulator.SaveFormat.JPEG }
  );

  return readJpegAsRgba(manipulated.uri);
}

/**
 * Standard YOLO letterbox: scale-to-fit (preserving aspect ratio) onto a
 * square canvas, padding the remainder with mid-gray. There's no
 * Canvas/ImageData API in React Native to composite this the way the web
 * prototype did — but since we already have to decode to a raw RGBA buffer
 * for tensor-packing anyway (via jpeg-js), the padding is done directly on
 * that buffer rather than via a GPU compositing step. expo-gl is still a
 * project dependency in case a future GPU-side path is worth it for
 * performance, but this pipeline doesn't need it — plain buffer copies at
 * 640x640 are cheap.
 */
export async function letterbox(uri: string, inputSize: number, padColor: { r: number; g: number; b: number }): Promise<LetterboxResult> {
  const { width, height } = await getImageSize(uri);
  const scale = Math.min(inputSize / width, inputSize / height);
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);
  const padLeft = Math.floor((inputSize - newWidth) / 2);
  const padTop = Math.floor((inputSize - newHeight) / 2);

  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: newWidth, height: newHeight } }],
    { compress: 0.92, format: ImageManipulator.SaveFormat.JPEG }
  );
  const { data: srcData, width: srcWidth, height: srcHeight } = await readJpegAsRgba(resized.uri);

  const padded = new Uint8Array(inputSize * inputSize * 4);
  for (let i = 0; i < inputSize * inputSize; i++) {
    padded[i * 4] = padColor.r;
    padded[i * 4 + 1] = padColor.g;
    padded[i * 4 + 2] = padColor.b;
    padded[i * 4 + 3] = 255;
  }

  for (let y = 0; y < srcHeight; y++) {
    const srcRowStart = y * srcWidth * 4;
    const dstRowStart = ((y + padTop) * inputSize + padLeft) * 4;
    padded.set(srcData.subarray(srcRowStart, srcRowStart + srcWidth * 4), dstRowStart);
  }

  return {
    data: padded,
    width: inputSize,
    height: inputSize,
    scale,
    padLeft,
    padTop,
    originalWidth: width,
    originalHeight: height,
  };
}

/**
 * Packs an RGBA buffer into a CHW (channel, height, width) Float32Array —
 * the layout onnxruntime expects for these two models. Pass `mean`/`std` to
 * ImageNet-normalize (skin-signals model); omit them for plain 0-1 scaling
 * (acne detector).
 */
export function rgbaToChwFloat32(
  image: RgbaImage,
  options?: { mean: [number, number, number]; std: [number, number, number] }
): Float32Array {
  const { data, width, height } = image;
  const size = width * height;
  const out = new Float32Array(3 * size);

  for (let i = 0; i < size; i++) {
    const r = data[i * 4] / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;

    if (options) {
      out[i] = (r - options.mean[0]) / options.std[0];
      out[size + i] = (g - options.mean[1]) / options.std[1];
      out[2 * size + i] = (b - options.mean[2]) / options.std[2];
    } else {
      out[i] = r;
      out[size + i] = g;
      out[2 * size + i] = b;
    }
  }

  return out;
}
