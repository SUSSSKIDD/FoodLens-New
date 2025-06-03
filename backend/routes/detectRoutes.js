const express = require('express');
const multer = require('multer');
const path = require('path');
const { detectVegetables } = require('../controllers/detectController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

router.post('/', upload.single('image'), detectVegetables);

module.exports = router;
