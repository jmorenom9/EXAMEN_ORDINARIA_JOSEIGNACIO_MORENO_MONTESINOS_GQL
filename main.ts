import {ApolloServer} from "@apollo/server"
import {startStandaloneServer} from "@apollo/server/standalone"
import { MongoClient } from "mongodb";
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) {
  throw new Error("You have to provide a MONGO_URL");
}

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("MOngoDB connected");


const server = new ApolloServer({
  typeDefs: schema,
  resolvers
});

const {url} = await startStandaloneServer(server, {
  context: async () => ({}),
  listen: {port: 4000}
});

console.info(`url conectada en ${url}`);