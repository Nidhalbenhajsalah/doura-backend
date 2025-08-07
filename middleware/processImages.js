const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = 'uploads/activities/';
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const LANDSCAPE_SIZE = { width: 900, height: 600 };
const PORTRAIT_SIZE = { width: 600, height: 900 };

async function processAndResize(buffer, originalname, filenamePrefix = '') {
  const filename = `${filenamePrefix}${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`; // ✅ correct extension
  const outputPath = path.join(UPLOAD_DIR, filename);

  const metadata = await sharp(buffer).metadata();
  const isPortrait = metadata.height > metadata.width;
  const { width, height } = isPortrait ? PORTRAIT_SIZE : LANDSCAPE_SIZE;

  await sharp(buffer)
    .rotate()
    .resize(width, height, {
      fit: sharp.fit.contain,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: 80 }) // You can adjust quality (70–90) for size/perf
    .toFile(outputPath);

  return filename;
}

exports.processImages = async function (req, res, next) {
  try {
    const processedImages = {};

    if (req.files?.coverImage?.[0]) {
      const file = req.files.coverImage[0];
      const filename = await processAndResize(file.buffer, file.originalname, 'cover-');
      processedImages.coverImage = filename;
    }

    if (req.files?.additionalImages?.length) {
      processedImages.additionalImages = [];

      for (const file of req.files.additionalImages) {
        const filename = await processAndResize(file.buffer, file.originalname, 'add-');
        processedImages.additionalImages.push(filename);
      }
    }

    req.processedImages = processedImages;
    next();
  } catch (err) {
    console.error('Image processing failed:', err);
    res.status(500).json({ message: 'Image processing error' });
  }
};
