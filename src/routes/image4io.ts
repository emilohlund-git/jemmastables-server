import express from 'express';
import {
  createFolder,
  deleteFolder,
  deleteImage,
  getFolders,
  getImage,
  uploadImage,
} from '../services/image4io.service';
import path from 'path';
import multer from 'multer';

require('dotenv').config();

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, './tmp/');
  },

  filename: function (_req, file, cb) {
    cb(null, 'attachment' + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get('/folders', getFolders);
router.post('/folders', createFolder);
router.delete('/folders', deleteFolder);

router.get('/image', getImage);
router.post('/image', upload.any(), uploadImage);
router.delete('/image', deleteImage);

export default router;
