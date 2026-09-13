import { Asset } from 'expo-asset';
import { InferenceSession } from 'onnxruntime-react-native';

const sessionCache = new Map<string, Promise<InferenceSession>>();

/**
 * Loads (and caches) an ONNX Runtime session for a bundled model asset.
 * `cacheKey` just needs to be stable per model — the asset module id itself
 * isn't a useful map key.
 */
export function getSession(moduleAsset: number, cacheKey: string): Promise<InferenceSession> {
  const cached = sessionCache.get(cacheKey);
  if (cached) return cached;

  const promise = (async () => {
    const asset = Asset.fromModule(moduleAsset);
    if (!asset.localUri) {
      await asset.downloadAsync();
    }
    const modelUri = asset.localUri ?? asset.uri;
    return InferenceSession.create(modelUri);
  })();

  sessionCache.set(cacheKey, promise);
  return promise;
}
