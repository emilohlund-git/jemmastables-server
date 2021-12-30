import express from 'express';
import {
  createFolder,
  deleteFolder,
  deleteImage,
  getFolders,
  getImage,
  uploadImage,
} from '../services/image4io.service';
import multer from 'multer';
import path from 'path';
require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  var storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, path.resolve(__dirname, 'uploads/'));
    },
    filename: function (_req, file, cb) {
      cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
    },
  });
} else {
  var storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, path.resolve(__dirname, 'uploads'));
    },
    filename: function (_req, file, cb) {
      cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
    },
  });
}

const upload = multer({ storage: storage });

const router = express.Router();

router.get('/folders', getFolders);
router.post('/folders', createFolder);
router.delete('/folders', deleteFolder);

router.get('/image', getImage);
router.post('/image', upload.any(), uploadImage);
router.delete('/image', deleteImage);

export default router;
