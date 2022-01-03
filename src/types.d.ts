type File = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
};

type HttpStatusCode = {
  OK: number;
  BAD_REQUEST: number;
  NOT_FOUND: number;
  INTERNAL_SERVER: number;
};
