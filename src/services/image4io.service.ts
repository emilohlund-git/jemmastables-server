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
  let response;
  try {
    response = await client.ListFolder(model);
  } catch {
    return res.status(400).send({
      error: 'Could not get the folders.',
    });
  }
  return res.status(200).send(response);
};

export const createFolder = async (req: Request, res: Response) => {
  const path = req.body.path;
  const model = new CreateFolderRequestModel(path);
  let response;
  try {
    response = await client.CreateFolder(model);
  } catch {
    return res.status(400).send({
      error: 'Could not create the folder.',
    });
  }
  return res.status(201).send(response);
};

export const deleteFolder = async (req: Request, res: Response) => {
  const path = req.body.path;
  let response;
  try {
    const model = new DeleteFolderRequestModel(path);
    response = await client.DeleteFolder(model);
  } catch {
    return res.status(400).send({
      error: 'Could not delete the folder.',
    });
  }
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
    return res.status(400).send({
      error: 'Could not get the image.',
    });
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

    let response;

    try {
      response = await client.UploadImage(request);
    } catch {
      return res.status(400).send({
        error: 'Could not upload the image.',
      });
    }

    fs.readdir('./tmp', (err, files) => {
      if (err) throw err;
      for (const file of files) {
        fs.unlink(`./tmp/${file}`, (err) => {
          if (err) throw err;
        });
      }
    });

    return res.status(200).send(response);
  } else {
    return res.status(400).send({ error: 'No image attached.' });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  const path = req.body.path;
  const model = new DeleteFileRequestModel(path);
  let response;
  try {
    response = await client.DeleteImage(model);
  } catch {
    return res.status(400).send({
      error: 'Could not delete the image.',
    });
  }
  return res.status(204).send(response);
};
