// backend/src/middlewares/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    const { owner_type, owner_id } = req.body;
    const unit_id = req.user?.unit_id;

    if (!owner_type || !owner_id || !unit_id) {
      return cb(new Error('owner_type, owner_id e unit_id são obrigatórios'));
    }

    const uploadPath = path.join(
      __dirname,
      '../uploads',
      'units',
      String(unit_id),
      owner_type,
      String(owner_id)
    );

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {

    const sanitized = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, '_');

    const filename = `${Date.now()}-${sanitized}`;

    cb(null, filename);
  }

});

const fileFilter = (req, file, cb) => {

  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'));
  }

};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

module.exports = upload;