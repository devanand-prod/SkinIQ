import { Tensor } from 'onnxruntime-react-native';

import { SKIN_SIGNALS_CONFIG, SKIN_SIGNALS_MODEL_ASSET } from '../../constants/models';
import type { SkinSignalKey } from '../../constants/models';
import { resizeAndCenterCrop, rgbaToChwFloat32 } from './imagePreprocessing';
import { getSession } from './session';

export type SkinSignals = Record<SkinSignalKey, number>;

/** Runs the EfficientNet-B0 skin-signals model. Returns raw [0,1] floats —
 * scaling to 0-100 and mapping onto UI conditions happens in index.ts. */
export async function runSkinSignals(uri: string): Promise<SkinSignals> {
  const session = await getSession(SKIN_SIGNALS_MODEL_ASSET, 'skin_signals');

  const image = await resizeAndCenterCrop(
    uri,
    SKIN_SIGNALS_CONFIG.inputSize,
    SKIN_SIGNALS_CONFIG.resizeShortSide
  );
  const chw = rgbaToChwFloat32(image, { mean: SKIN_SIGNALS_CONFIG.mean, std: SKIN_SIGNALS_CONFIG.std });

  // Read input/output names from the session rather than hardcoding a
  // guessed name — we don't have the actual model file to inspect its
  // graph, and onnxruntime exposes these directly.
  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];

  const tensor = new Tensor('float32', chw, [
    1,
    3,
    SKIN_SIGNALS_CONFIG.inputSize,
    SKIN_SIGNALS_CONFIG.inputSize,
  ]);

  const results = await session.run({ [inputName]: tensor });
  const output = results[outputName].data as Float32Array;

  const signals = {} as SkinSignals;
  SKIN_SIGNALS_CONFIG.outputOrder.forEach((key, i) => {
    signals[key] = output[i];
  });
  return signals;
}
