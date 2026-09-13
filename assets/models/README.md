# Model weights

Both files are committed here (~44MB combined, well under GitHub's limits):

- `skin_signals.onnx` — EfficientNet-B0, ~0.6MB
- `acne_detector.onnx` — YOLOv8s, ~43MB

Source (MIT-licensed): https://huggingface.co/mufasabrownie/glowlytics-skin-models

`constants/models.ts` references these by static `require()` path — Metro
needs them present at bundle time. If you ever need to re-download them:

```
curl -L -o skin_signals.onnx https://huggingface.co/mufasabrownie/glowlytics-skin-models/resolve/main/skin_signals.onnx
curl -L -o acne_detector.onnx https://huggingface.co/mufasabrownie/glowlytics-skin-models/resolve/main/acne_detector.onnx
```

Note: committing binary model weights to git means every clone downloads
this ~44MB, and any future model update adds another copy to history
rather than replacing it. If that becomes a problem, consider moving these
to Git LFS.
