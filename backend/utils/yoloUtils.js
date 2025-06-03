const ort = require('onnxruntime-node');
const sharp = require('sharp');
const fs = require('fs');


const labels = ["Beans", "Bitter_Gourd", "Bottle_Gourd", "Broccoli", "Cabbage"];

const preprocessImage = async (filePath) => {
  const { data, info } = await sharp(filePath)
    .resize(224,224)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convert [HWC] to [CHW]
  const chw = new Float32Array(3 * 224 * 224);
  for (let i = 0; i < 224 * 224; i++) {
    chw[i] = data[i * 3] / 255.0;         // R
    chw[i + 224 * 224] = data[i * 3 + 1] / 255.0; // G
    chw[i + 2 * 224 * 224] = data[i * 3 + 2] / 255.0; // B
  }

  return new ort.Tensor('float32', chw, [1, 3, 224, 224]);
};

const runYoloModel = async (imagePath) => {
  const session = await ort.InferenceSession.create('models/detection/best.onnx');
  const tensor = await preprocessImage(imagePath);

  const feeds = { images: tensor };
  const results = await session.run(feeds);
  const output = results[Object.keys(results)[0]].data;

  const numDetections = output.length / 6;
  const detections = [];

  for (let i = 0; i < numDetections; i++) {
    const base = i * 6;
    const x1 = output[base + 0];
    const y1 = output[base + 1];
    const x2 = output[base + 2];
    const y2 = output[base + 3];
    const confidence = output[base + 4];
    const classId = output[base + 5];

    if (confidence > 0.8) {
      detections.push({
        label: labels[Math.round(classId)] || `Class ${classId}`,
        confidence: +(confidence * 100).toFixed(2),
        box: {
          x1: +x1.toFixed(2),
          y1: +y1.toFixed(2),
          x2: +x2.toFixed(2),
          y2: +y2.toFixed(2)
        }
      });
    }
  }

  return detections;
};

module.exports = { runYoloModel };
