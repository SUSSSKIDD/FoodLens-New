const fs = require('fs');
const { runYoloModel } = require('../utils/yoloUtils');

exports.detectVegetables = async (req, res) => {
  try {
    const filePath = req.file.path;
    const veggies = await runYoloModel(filePath);

    fs.unlinkSync(filePath); // delete file after detection
    res.json({ detected: veggies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Detection failed' });
  }
};
