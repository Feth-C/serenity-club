// backend/src/middlewares/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { owner_type, owner_id } = req.body;

    if (!owner_type || !owner_id) {
      return cb(new Error('owner_type e owner_id Sono necessari per salvare il file'));
    }

    // ------------------------------
    // Caminho absoluto para src/uploads/members/[memberId]
    // ------------------------------
    const uploadPath = path.join(__dirname, '../uploads', owner_type, owner_id);

    // ------------------------------
    // Cria a pasta se não existir
    // ------------------------------
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {

    // ------------------------------
    // Nome do arquivo: timestamp + original name
    // ------------------------------
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

module.exports = upload;
