import {
  GetImageRequest,
  Image4ioClient,
  UploadFile,
} from '@image4io/image4ionodejssdk';
import CreateFolderRequestModel from '@image4io/image4ionodejssdk/out/Models/CreateFolderRequest';
import DeleteFolderRequestModel from '@image4io/image4ionodejssdk/out/Models/DeleteFolderRequest';
import DeleteFileRequestModel from '@image4io/image4ionodejssdk/out/Models/DeleteImageRequest';
import ListFolderRequestModel from '@image4io/image4ionodejssdk/out/Models/ListFolderRequest';
import UploadImagesRequestModel from '@image4io/image4ionodejssdk/out/Models/UploadImagesRequest';
import { Request, Response } from 'express';
import fs from 'fs';
require('dotenv').config();

const apiKey = process.env.IMAGE4IO_USERNAME;
const apiSecret = process.env.IMAGE4IO_PASSWORD;
const client = new Image4ioClient(apiKey, apiSecret);

/* FOLDERS */
export const getFolders = async (req: Request, res: Response) => {
  const path = req.body.path;
  const continuationToken = req.body.continuationToken;
  const model = new ListFolderRequestModel(path, continuationToken);
  const response = await client.ListFolder(model);
  console.log(response);
  return res.status(200).send(response);
};

export const createFolder = async (req: Request, res: Response) => {
  const path = req.body.path;
  const model = new CreateFolderRequestModel(path);
  const response = await client.CreateFolder(model);
  return res.status(201).send(response);
};

export const deleteFolder = async (req: Request, res: Response) => {
  const path = req.body.path;
  console.log(path);
  const model = new DeleteFolderRequestModel(path);
  const response = await client.DeleteFolder(model);
  return res.status(204).send(response);
};

/* IMAGES */
export const getImage = async (req: Request, res: Response) => {
  const name = req.body.name;
  const model = new GetImageRequest(name);
  let response;

  try {
    response = await client.GetImage(model);
  } catch (err) {
    return res.status(400).send(err.message);
  }

  return res.status(200).send(response);
};

export const uploadImage = async (req: any, res: Response) => {
  console.log(req.files);
  if (req.files) {
    const file = req.files[0];
    const request = new UploadImagesRequestModel(req.body.path, true, true, [
      {
        FileName: file.originalname,
        FilePath: file.path,
      } as UploadFile,
    ]);

    const response = await client.UploadImage(request);

    fs.readdir('./tmp', (err, files) => {
      if (err) throw err;
      for (const file of files) {
        fs.unlink(`./tmp/${file}`, (err) => {
          if (err) throw err;
        });
      }
    });

    console.log(response);

    return res.status(200).send(response);
  } else {
    return res.status(400).send({ response: 'Please, file.' });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  const path = req.body.path;
  const model = new DeleteFileRequestModel(path);
  const response = await client.DeleteImage(model);
  return res.status(204).send(response);
};
