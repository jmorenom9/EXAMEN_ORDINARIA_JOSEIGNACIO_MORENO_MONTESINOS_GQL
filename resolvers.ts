import { Collection, ObjectId } from "mongodb";
import { APICity, APIValidatePhone, APIWorldTime, RestaurantModel } from "./types.ts";
import { GraphQLError } from "graphql";
import { APIWeather } from "./types.ts";

type Context = {
    RestaurantsCollection: Collection<RestaurantModel>
}

type addRestaurantMutationsArgs = {
    name: string,
    address: string,
    city: string,
    phone: string
}

type getRestaurantQueryArgs = {
    id: string
}

type getRestaurantsQueryArgs = {
    city: string
}

type deleteRestaurantMutationArgs = {
    id: string
}

export const resolvers = {
    Query: {
        getRestaurant: async (_: unknown, args: getRestaurantQueryArgs, ctx: Context): Promise<RestaurantModel | null> => {
            const {id} = args;

            const restaurantExists = await ctx.RestaurantsCollection.findOne({_id: new ObjectId(id)});
            if (!restaurantExists) throw new GraphQLError("No existe el restaurante");

            return restaurantExists;
        },

        getRestaurants: async (_: unknown, args: getRestaurantsQueryArgs, ctx: Context): Promise<RestaurantModel[]> => {
            const {city} = args;
            
            const restaurantsExists = await ctx.RestaurantsCollection.find({city: city}).toArray();
            return restaurantsExists;
        }
    },

    Mutation: {
        addRestaurant: async (_: unknown, args: addRestaurantMutationsArgs, ctx: Context): Promise<RestaurantModel> => {
            const {name, address, city, phone} = args;

            const restaurantExists = await ctx.RestaurantsCollection.countDocuments({phone: phone});
            if (restaurantExists === 1) throw new GraphQLError("Ya existe el restaurante");

            const api_key = Deno.env.get("X_API_KEY");
            if (!api_key) throw new GraphQLError("Tienes que proporcionar una api key");

            const url = `https://api.api-ninjas.com/v1/validatephone?number=${phone}`;
            const data = await fetch(url, {
                headers: {
                    "X-Api-Key": api_key
                }
            });
            if (data.status !== 200) throw new GraphQLError("api ninja error");

            const response: APIValidatePhone = await data.json();

            if (!response.is_valid) throw new GraphQLError("El telefono no es valido");
            const country = response.country;
            const timezones = response.timezones;

            const url2 = `https://api.api-ninjas.com/v1/city?name=${city}`;
            const data2 = await fetch(url2, {
                headers: {
                    "X-Api-Key": api_key
                }
            });
            if (data2.status !== 200) throw new GraphQLError("api ninja error");

            const response2: APICity[] = await data2.json();

            const latitude = response2[0].latitude;
            const longitude = response2[0].longitude;

            const {insertedId} = await ctx.RestaurantsCollection.insertOne({
                name: name,
                address: address,
                city: city,
                latitude: latitude,
                longitude: longitude,
                phone: phone,
                country: country,
                timezones: timezones
            });

            return {
                _id: insertedId,
                name: name,
                address: address,
                city: city,
                latitude: latitude,
                longitude: longitude,
                phone: phone,
                country: country,
                timezones: timezones
            }
        },

        deleteRestaurant: async (_: unknown, args: deleteRestaurantMutationArgs, ctx: Context): Promise<boolean> => {
            const {id} = args;

            const {deletedCount} = await ctx.RestaurantsCollection.deleteOne({_id: new ObjectId(id)});
            if (!deletedCount) return false;
            return true;
        }
    },

    Restaurant: {
        id: (parent: RestaurantModel, _: unknown, __: unknown) => {
            return parent._id?.toString();
        },

        address: (parent: RestaurantModel, _: unknown, __: unknown) => {
            const address = parent.address;
            const city = parent.city;
            const country = parent.country;

            const addressFinal = address + ", " + city + ", " + country;
            return addressFinal;
        },

        datetime: async (parent: RestaurantModel, _: unknown, ctx: Context): Promise<string> => {
            const timezones = parent.timezones;

            const api_key = Deno.env.get("X_API_KEY");
            if (!api_key) throw new GraphQLError("Tienes que proporcionar una api key");

            const url = `https://api.api-ninjas.com/v1/worldtime?timezone=${timezones[0]}`;
            const data = await fetch(url, {
                headers: {
                    "X-Api-Key": api_key
                }
            });
            if (data.status !== 200) throw new GraphQLError("api ninja error");

            const response: APIWorldTime = await data.json();
            const hour = response.hour;
            const minute = response.minute;
            const date = hour + ":" + minute;
            return date;
        },

        temperature: async (parent: RestaurantModel, _: unknown, __: unknown): Promise<string> => {
            const lat = parent.latitude;
            const lon = parent.longitude;

            const api_key = Deno.env.get("X_API_KEY");
            if (!api_key) throw new GraphQLError("Tienes que proporcionar una api key");

            const url = `https://api.api-ninjas.com/v1/weather?lat=${lat}&lon=${lon}`;
            const data = await fetch(url, {
                headers: {
                    "X-Api-Key": api_key
                }
            });
            if (data.status !== 200) throw new GraphQLError("api ninja error");

            const response: APIWeather = await data.json();
            const temp = response.temp;
            return temp;
        }
    }
}