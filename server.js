'use strict';
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());

app.use(express.static('./'));

app.get('/location', (req, res) => {
  try {
    console.log(req.query);
    const queryData = req.query.data;
    let geoURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryData}&key=
    ${process.env.GOOGLE_MAPS_API_KEY}`;
    superagent.get(geoURL).end((err, mapsResponse) => {
      console.log('env var ' + process.env.GOOGLE_MAPS_API_KEY);
      const location = new Location(queryData, mapsResponse.body.results[0]);
      res.send(location);
    });
  } catch (error) {
    handleError(error);
  }
});

//location constructor
function Location(queryData, geoData) {
  this.search_query = queryData;
  this.formatted_query = geoData.formatted_address;
  this.latitude = geoData.geometry.location.lat;
  this.longitude = geoData.geometry.location.lng;
}

app.get('/weather', (request, response) => {
  try {
    const weatherData = searchToweather(request.query.data);
    response.send(weatherData);
  } catch (error) {
    handleError(error, response);
  }
});

//helper
function searchToweather() {
  let arr = [];
  const weaData = require('./data/darksky.json');

  for (let i = 0; i < weaData.daily.data.length; i++) {
    arr.push(new Weather(weaData.daily.data[i]));
  }
  return arr;
}

function Weather(day) {
  this.time = new Date(day.time * 1000).toDateString();
  this.forecast = day.summary;
}

//error handling
function handleError(error, res) {
  res.status(500).send('error');
}
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
