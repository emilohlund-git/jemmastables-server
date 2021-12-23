const express = require('express');
const session = require('express-session');
const { createServer } = require('http');
const { gql, ApolloServer } = require('apollo-server-express');
const { Neo4jGraphQL } = require('@neo4j/graphql');
const { COOKIE_NAME, __prod__ } = require('./constants');
const neo4j = require('neo4j-driver');
const cors = require('cors');
const { testConfig } = require('./swish');
const fs = require('fs');
const request = require('request');
const PORT = 4000;
const dotenv = require('dotenv').config();

function logResult(error, response) {
  if (error) {
    console.log(error);
  }
  if (response) {
    console.log(response.statusCode);
    console.log(response.headers);
    console.log(response.body);
  }
}

function requestOptions(method, uri, body) {
  return {
    method: method,
    uri: uri,
    json: true,
    body: body,
    'content-type': 'application/json',
    cert: fs.readFileSync(testConfig.cert),
    key: fs.readFileSync(testConfig.key),
    ca: testConfig.ca ? fs.readFileSync(testConfig.ca) : null,
    passphrase: testConfig.passphrase,
  };
}

const main = async () => {
  const app = express();

  const auth = (req, res, next) => {
    if (
      req.session &&
      req.session.user === 'Jemmastables' &&
      req.session.admin
    ) {
      return next();
    } else {
      return res.sendStatus(401);
    }
  };

  app.use(express.json());

  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'https://studio.apollographql.com',
        'http://localhost:4000/graphql',
      ],
      credentials: true,
    })
  );

  app.use(
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

  app.post('/login', (req, res) => {
    if (!req.body.username || !req.body.password) {
      res.status(401).send({ message: 'Login failed', status: res.statusCode });
    } else if (
      req.body.username === process.env.ADMIN_USER &&
      req.body.password === process.env.ADMIN_PASSWORD
    ) {
      req.session.user = process.env.ADMIN_USER;
      req.session.admin = true;
      res
        .status(200)
        .send({ message: 'Login success', status: res.statusCode });
    } else {
      res.status(401).send({ message: 'Login failed', status: res.statusCode });
    }
  });

  // Create Payment Request
  app.post('/paymentrequests', function (req, res) {
    // NOTE: the callbackUrl will be called by the swish system when the status of the
    //       payment is changed. This will normally be an endpoint in the merchants system.
    //       Since this sample is likely run on a local machine, we can't really act on the
    //       callback. We entered this example here that is using a service that lets you see
    //       how the callback looks. To see it in action, open https://webhook.site in a browser
    //       and replace the callbackUrl below with your unique url
    const json = {
      payeePaymentReference: '0123456789',
      callbackUrl: 'https://webhook.site/f641832d-b07a-4700-9d44-0f2e47e5ba6b',
      payeeAlias: testConfig.payeeAlias,
      payerAlias: req.body.payerAlias,
      amount: req.body.amount,
      currency: 'SEK',
      message: req.body.message,
    };

    const options = requestOptions(
      'POST',
      `${testConfig.host}/api/v1/paymentrequests`,
      json
    );

    request(options, (error, response, body) => {
      logResult(error, response);

      if (!response) {
        res.status(500).send(error);
        return;
      }

      res.status(response.statusCode);
      if (response.statusCode == 201) {
        // Payment request was successfully created. In order to get the details of the
        // newly created request, we need to make a GET request to the url in the location header

        const location = response.headers['location'];
        const token = response.headers['paymentrequesttoken'];

        const opt = requestOptions('GET', location);

        request(opt, (err, resp, bod) => {
          logResult(err, resp);

          if (!response) {
            res.status(500).send(error);
            return;
          }

          const id = resp.body['id'];

          res.json({
            url: location,
            token: token,
            id: id,
          });
        });
      } else {
        res.send(body);
        return;
      }
    });
  });

  // Get Payment Request
  app.get('/paymentrequests/:requestId', function (req, res) {
    const options = requestOptions(
      'GET',
      `${testConfig.host}/api/v1/paymentrequests/${req.params.requestId}`
    );

    request(options, (error, response, body) => {
      logResult(error, response);

      if (!response) {
        res.status(500).send(error);
        return;
      }

      res.status(response.statusCode);
      if (response.statusCode == 200) {
        res.json({
          id: response.body['id'],
          paymentReference: response.body['paymentReference'] || '',
          status: response.body['status'],
        });
      } else {
        res.send(body);
        return;
      }
    });
  });

  // Get QR Code
  app.get('/qr/:token', function (req, res) {
    const token = req.params.token;

    const json = {
      token: token,
      size: '600',
      format: 'png',
      border: '0',
    };

    const options = requestOptions(
      'POST',
      `${testConfig.qrHost}/api/v1/commerce`,
      json
    );

    request(options, (error, response, body) => {
      logResult(error, response);

      if (!response) {
        res.status(500).send(error);
        return;
      }
    }).pipe(res);
  });

  app.get('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).send({ message: 'Logout success', status: res.statusCode });
  });

  const typeDefs = gql`
    type Admin {
      id: ID @id
      username: String!
      password: String! @private
    }

    type Partners {
      name: String!
      description: String!
      image: String!
      website: String
    }

    type Facility {
      name: String!
      description: String!
      images: [String]!
    }

    type Horse {
      name: String!
      nickname: String
      movie: String
      images: [String]!
      owner: String!
      after: String!
      birthyear: String!
      gender: String!
      color: String!
      category: HorseCategory!
        @relationship(type: "HORSE_CATEGORY", direction: OUT)
    }

    type HorseCategory {
      category: String!
      image: String!
      horses: [Horse] @relationship(type: "HORSE_CATEGORY", direction: IN)
    }

    type Page {
      name: String!
      content: String
      images: [String]
    }

    type Component {
      name: String!
      images: [String]
    }

    type Logo {
      image: String!
    }

    type User {
      id: ID @id
      name: String!
      password: String!
      phonenumber: String!
      email: String! @unique
      timeslots: [TimeSlot] @relationship(type: "BOOKED_TIMES", direction: IN)
    }

    type DateSlot {
      date: String!
      timeslots: [TimeSlot] @relationship(type: "TIMESLOTS", direction: IN)
    }

    type TimeSlotType {
      type: String!
      timeslot: [TimeSlot]! @relationship(type: "TIMESLOT_TYPE", direction: IN)
    }

    type TimeSlot {
      to: String!
      from: String!
      type: TimeSlotType! @relationship(type: "TIMESLOT_TYPE", direction: OUT)
      users: User @relationship(type: "BOOKED_TIMES", direction: OUT)
      date: DateSlot! @relationship(type: "TIMESLOTS", direction: OUT)
    }
  `;

  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );

  const neoSchema = new Neo4jGraphQL({
    typeDefs,
    driver,
  });

  await neoSchema.assertIndexesAndConstraints({ options: { create: true } });

  const server = new ApolloServer({
    schema: neoSchema.schema,
    context: ({ req }) => ({ req }),
  });

  await server.start();

  server.applyMiddleware({ app, cors: false });

  const httpServer = createServer(app);

  httpServer.listen({ port: 4000 }, () => {
    console.log(
      `server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
    );
  });
};

main();
