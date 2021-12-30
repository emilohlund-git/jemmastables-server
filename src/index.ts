import express from 'express';
import formidable from 'express-formidable';
import session from 'express-session';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { COOKIE_NAME, __prod__ } from './constants';
import cors from 'cors';
import image4io from './routes/image4io';
import dotenv from 'dotenv';
import neoSchema from './neoSchema';
dotenv.config();

const main = async () => {
  const PORT = process.env.PORT || 4000;
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'https://studio.apollographql.com',
        'http://localhost:4000/graphql',
      ],
      credentials: true,
    }),
    session({
      name: COOKIE_NAME,
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? '.jemmastables.se' : undefined,
      }, // 30 Days
    })
  );

  app.use('/image4io', image4io);

  await neoSchema.assertIndexesAndConstraints({ options: { create: true } });

  const server = new ApolloServer({
    schema: neoSchema.schema,
    context: ({ req }) => ({ req }),
  });

  await server.start();

  server.applyMiddleware({ app, cors: false });

  app.use(formidable());

  const httpServer = createServer(app);

  httpServer.listen({ port: PORT }, () => {
    console.log(
      `server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
};

main();
