import {OptionalId} from "mongodb"

export type RestaurantModel = OptionalId<{
    name: string,
    address: string,
    city: string,
    latitude: number,
    longitude: number,
    phone: string,
    country: string,
    timezones: string[]
}>

export type Restaurant = {
    id: string,
    name: string,
    address: string,
    phone: string,
    temperature: string,
    datetime: string
}


// https://api.api-ninjas.com/v1/validatephone?number=+12065550100
export type APIValidatePhone = {
    is_valid: boolean,
    country: string,
    timezones: string[]
}

// https://api.api-ninjas.com/v1/worldtime?timezone
export type APIWorldTime = {
    hour: string,
    minute: string
}

// https://api.api-ninjas.com/v1/city?name=Madrid
export type APICity = {
    latitude: number,
    longitude: number
}

// https://api.api-ninjas.com/v1/weather?lat=1&?lon=1
export type APIWeather = {
    temp: string
}