require('now-env');
// Makes use of Google Maps geocoding API and Dark Sky weather API
// Get API keys at https://console.developers.google.com & https://darksky.net/dev/
// and add them to the server secrets
// Feel free to reach out to me on Twitter @mattdionis or @motleydev with any questions!
import { makeExecutableSchema } from 'graphql-tools';
import NodeGeocoder from 'node-geocoder';
const { ApolloServer} = require('apollo-server');
import request from 'request';

// Set the baseUrl and urlParams for Dark Sky API call
const baseUrl = 'https://api.darksky.net/forecast/';
const urlParams = '?units=si&exclude=minutely,hourly,flags';
const mapLinkBase = 'https://www.google.com/maps/?q=';

// Geocode a place through node-geocoder and the Google Maps API
// https://github.com/nchaulet/node-geocoder
function getLocation(apiKey, place) {
  const options = {
    provider: 'google',
    apiKey
  };

  const geocoder = NodeGeocoder(options);

  return new Promise((resolve, reject) => {
    geocoder.geocode(place).then( res => {

      const city = res[0].city;
      const country = res[0].country;
      const lat = res[0].latitude;
      const lng = res[0].longitude;
      
      resolve({
        city,
        country,
        coords: [lat, lng],
        mapLink: `${mapLinkBase}${lat},${lng}`
      });
    
    }).catch(e => {
      reject(e);
    });
  });
}

// Pass the geographic coordinates of the location to the Dark Sky API to get current conditions
function getWeather(apiKey, coords, date) {

  const day = date
    ? `,${date.split('T')[0]}T12:00:00`
    : ''

  return new Promise((resolve, reject) => {
    const finalUrl = `${baseUrl}${apiKey}/${coords[0]},${coords[1]}${day}${urlParams}`;
    request(finalUrl, (error, response, body) => {
      if (error) {
        reject(error);
      }
      const data = JSON.parse(body);
      const summary = data.currently.summary;
      const temperature = data.currently.temperature;
      const feelsTemp = data.currently.apparentTemperature;
      const timezone = data.timezone
      const time = data.currently.time
      const icon = data.currently.icon
      const sunrise = data.daily.data[0].sunriseTime
      const sunset = data.daily.data[0].sunsetTime
      const moonPhase = data.daily.data[0].moonPhase
      resolve({
        summary,
        temperature,
        coords,
        feelsTemp,
        timezone,
        time,
        icon,
        sunrise,
        sunset,
        moonPhase,
      });
    });
  });
}

const typeDefs = `
  type Query {
    location(place: String!, date: String): Location
  }

  type Location {
    city: String
    country: String
    coords: [Float]
    mapLink: String
    timeZone: String
    weather: Weather
  }

  type Weather {
    summary: String
    temperature: Float
    coords: [Float]
    feelsTemp: Float
    timezone: String
    time: Int
    icon: String
    sunrise: Int
    sunset: Int
    moonPhase: Float
  }
`;

// Pass in the Google and Dark Sky API keys
const resolvers = {
  Query: {
    location(root, args, context) {
      return getLocation(process.env.GOOGLE, args.place);
    }
  },
  Location: {
    weather(root, args, context) {
      return getWeather(process.env.DARKSKY, root.coords, root.date);
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const server = new ApolloServer({ schema });

server.listen(9000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});