declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEO4J_URI: string;
      NEO4J_USER: string;
      NEO4J_PASSWORD: string;
      SESSION_SECRET: string;
      ADMIN_USER: string;
      ADMIN_PASSWORD: string;
      BUCKET_NAME: string;
      API_KEY: string;
      PORT: number;
      IMAGE4IO_USERNAME: string;
      IMAGE4IO_PASSWORD: string;
      IMAGE4IO_BASEURL: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
