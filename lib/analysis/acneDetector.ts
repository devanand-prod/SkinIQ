import { Tensor } from 'onnxruntime-react-native';

import { ACNE_DETECTOR_CONFIG, ACNE_DETECTOR_MODEL_ASSET } from '../../constants/models';
import type { Highlight } from '../../types/skin';
import { letterbox, rgbaToChwFloat32 } from './imagePreprocessing';
import type { Box } from './nms';
import { greedyNms, sigmoidIfNeeded } from './nms';
import { getSession } from './session';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Runs the YOLOv8s acne/lesion detector and returns normalized [0,1] rects
 * against the ORIGINAL (pre-letterbox) photo. */
export async function runAcneDetector(uri: string): Promise<Highlight[]> {
  const session = await getSession(ACNE_DETECTOR_MODEL_ASSET, 'acne_detector');

  const boxed = await letterbox(uri, ACNE_DETECTOR_CONFIG.inputSize, ACNE_DETECTOR_CONFIG.letterboxPadColor);
  const chw = rgbaToChwFloat32(boxed);

  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];

  const tensor = new Tensor('float32', chw, [
    1,
    3,
    ACNE_DETECTOR_CONFIG.inputSize,
    ACNE_DETECTOR_CONFIG.inputSize,
  ]);

  const results = await session.run({ [inputName]: tensor });
  const outputTensor = results[outputName];
  const data = outputTensor.data as Float32Array;
  const dims = outputTensor.dims as readonly number[];

  const numClasses = ACNE_DETECTOR_CONFIG.numClasses;
  const attrsPerAnchor = 4 + numClasses;

  // Ultralytics ONNX exports come out as either [1, attrs, N] or
  // [1, N, attrs] depending on export settings — detect which from dims
  // rather than assuming one, since we don't have the actual file to check.
  let numAnchors: number;
  let channelsFirst: boolean;
  if (dims[1] === attrsPerAnchor) {
    channelsFirst = true;
    numAnchors = dims[2];
  } else if (dims[2] === attrsPerAnchor) {
    channelsFirst = false;
    numAnchors = dims[1];
  } else {
    throw new Error(`Unexpected acne detector output shape: [${dims.join(', ')}]`);
  }

  const valueAt = (anchor: number, attrIndex: number): number =>
    channelsFirst ? data[attrIndex * numAnchors + anchor] : data[anchor * attrsPerAnchor + attrIndex];

  const boxes: Box[] = [];
  for (let anchor = 0; anchor < numAnchors; anchor++) {
    let bestClass = -1;
    let bestScore = -Infinity;
    for (let c = 0; c < numClasses; c++) {
      const score = sigmoidIfNeeded(valueAt(anchor, 4 + c));
      if (score > bestScore) {
        bestScore = score;
        bestClass = c;
      }
    }
    if (bestScore <= ACNE_DETECTOR_CONFIG.confidenceThreshold) continue;

    const cx = valueAt(anchor, 0);
    const cy = valueAt(anchor, 1);
    const w = valueAt(anchor, 2);
    const h = valueAt(anchor, 3);

    boxes.push({
      x: cx - w / 2,
      y: cy - h / 2,
      width: w,
      height: h,
      confidence: bestScore,
      classId: bestClass,
    });
  }

  const kept = greedyNms(boxes, ACNE_DETECTOR_CONFIG.iouThreshold);

  // Undo the letterbox transform (pad offset, then scale) to map boxes from
  // 640-space back onto the original photo, then normalize to [0,1].
  return kept.map((box) => {
    const origX = (box.x - boxed.padLeft) / boxed.scale;
    const origY = (box.y - boxed.padTop) / boxed.scale;
    const origWidth = box.width / boxed.scale;
    const origHeight = box.height / boxed.scale;

    return {
      x: clamp01(origX / boxed.originalWidth),
      y: clamp01(origY / boxed.originalHeight),
      width: clamp01(origWidth / boxed.originalWidth),
      height: clamp01(origHeight / boxed.originalHeight),
      confidence: box.confidence,
      classId: box.classId,
    };
  });
}
