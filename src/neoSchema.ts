import { gql } from 'apollo-server-express';
import neo4j from 'neo4j-driver';
import { Neo4jGraphQL } from '@neo4j/graphql';

const typeDefs = gql`
  type Admin {
    id: ID @id
    uid: String!
  }

  type Partner {
    id: ID @id
    name: String!
    description: String!
    logo: PartnerLogo
      @relationship(type: "PARTNER_LOGO_OWNER", direction: OUT)
    website: String
  }

  type PartnerLogo {
    url: String!
    path: String!
    width: Int!
    height: Int!
    owner: Partner @relationship(type: "PARTNER_LOGO_OWNER", direction: IN)
  }

  type FacilityImage {
    url: String!
    path: String!
    width: Int!
    height: Int!
    profile: Boolean!
    owner: Facility @relationship(type: "FACILITY_IMAGE_OWNER", direction: IN)
  }

  type Facility {
    id: ID @id
    name: String!
    description: String!
    images: [FacilityImage]! @relationship(type: "FACILITY_IMAGE_OWNER", direction: OUT)
  }

  type HorseImage {
    url: String!
    path: String!
    width: Int!
    height: Int!
    profile: Boolean!
    owner: Horse @relationship(type: "IMAGE_OWNER", direction: IN)
  }

  type Horse {
    id: ID @id
    name: String!
    nickname: String
    movie: String
    images: [HorseImage] @relationship(type: "IMAGE_OWNER", direction: OUT)
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
    uid: String!
    name: String!
    profilePicture: String
    phonenumber: String
    email: String!
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
    slots: Int
    type: TimeSlotType! @relationship(type: "TIMESLOT_TYPE", direction: OUT)
    users: [User] @relationship(type: "BOOKED_TIMES", direction: OUT)
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

export default neoSchema;
