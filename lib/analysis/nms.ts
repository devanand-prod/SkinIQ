export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** Applies sigmoid only if the value looks like a logit rather than an
 * already-sigmoided probability — some YOLOv8 ONNX exports include the
 * sigmoid in the graph and some don't. */
export function sigmoidIfNeeded(x: number): number {
  return x < 0 || x > 1 ? sigmoid(x) : x;
}

function iou(a: Box, b: Box): number {
  const aX2 = a.x + a.width;
  const aY2 = a.y + a.height;
  const bX2 = b.x + b.width;
  const bY2 = b.y + b.height;

  const interX1 = Math.max(a.x, b.x);
  const interY1 = Math.max(a.y, b.y);
  const interX2 = Math.min(aX2, bX2);
  const interY2 = Math.min(aY2, bY2);

  const interWidth = Math.max(0, interX2 - interX1);
  const interHeight = Math.max(0, interY2 - interY1);
  const intersection = interWidth * interHeight;

  const union = a.width * a.height + b.width * b.height - intersection;
  return union <= 0 ? 0 : intersection / union;
}

/** Greedy, per-class NMS (the Ultralytics default) — boxes of different
 * classes never suppress each other. */
export function greedyNms(boxes: Box[], iouThreshold: number): Box[] {
  const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence);
  const kept: Box[] = [];

  for (const candidate of sorted) {
    const suppressed = kept.some(
      (keptBox) => keptBox.classId === candidate.classId && iou(keptBox, candidate) > iouThreshold
    );
    if (!suppressed) kept.push(candidate);
  }

  return kept;
}
