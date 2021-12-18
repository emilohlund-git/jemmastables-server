const express = require('express');
const { createServer } = require('http');
const { gql, ApolloServer } = require('apollo-server-express');
const { Neo4jGraphQL } = require('@neo4j/graphql');
const neo4j = require('neo4j-driver');
const cors = require('cors');
const PORT = 4000;
require('dotenv').config();

const main = async () => {
  const app = express();

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

  const typeDefs = gql`
    type Admin {
      username: String!
      password: String!
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
      category: String! @unique
      horses: [Horse] @relationship(type: "HORSE_CATEGORY", direction: IN)
    }

    type User {
      name: String!
      phonenumber: String! @unique
      email: String! @unique
      timeslots: [TimeSlot] @relationship(type: "BOOKED_TIMES", direction: OUT)
    }

    type DateSlot {
      date: String! @unique
      timeslots: [TimeSlot] @relationship(type: "TIMESLOTS", direction: IN)
    }

    type TimeSlotType {
      type: String! @unique
      timeslot: [TimeSlot]! @relationship(type: "TIMESLOT_TYPE", direction: IN)
    }

    type TimeSlot {
      to: String!
      from: String!
      type: TimeSlotType! @relationship(type: "TIMESLOT_TYPE", direction: OUT)
      users: [User] @relationship(type: "BOOKED_TIMES", direction: IN)
      date: DateSlot! @relationship(type: "TIMESLOTS", direction: OUT)
    }
  `;

  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );

  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

  await neoSchema.assertIndexesAndConstraints({ options: { create: true } });

  const server = new ApolloServer({
    schema: neoSchema.schema,
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
