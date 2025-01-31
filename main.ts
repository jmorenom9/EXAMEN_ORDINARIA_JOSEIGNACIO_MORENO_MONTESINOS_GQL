import {ApolloServer} from "@apollo/server"
import {startStandaloneServer} from "@apollo/server/standalone"
import { MongoClient } from "mongodb";
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";
import { RestaurantModel } from "./types.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) {
  throw new Error("You have to provide a MONGO_URL");
}

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("MOngoDB connected");

const db = mongoClient.db("Restaurants");
const RestaurantsCollection = db.collection<RestaurantModel>("restaurants");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers
});

const {url} = await startStandaloneServer(server, {
  context: async () => ({RestaurantsCollection}),
  listen: {port: 4000}
});

console.info(`url conectada en ${url}`);