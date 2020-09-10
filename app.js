'use strict'
const log = console.log;
const express = require('express');
const request = require('request');
const GeoPoint = require('geopoint');
const TinyQueue = require('tinyqueue');
const { mongoose } = require('./db/mongoose');
const { Store } = require('./models/store');
const apiKey = process.env.GOOGLEAPIKEY;
const app = express();

// body-parser: middleware for parsing HTTP JSON body into a usable object
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/page.html');
})

/*************************************************/
// ================= Routes ======================
app.get('/closestStore/:address/:numberStores/:closedToo', (req, res) => {
  // Sends the closest 'numberStores' stores to the location given by 'address' in sorted order
  // if 'closedToo' is set to 'Y' then all stores are considered , otherwise only the ones open at the moment
  let allStores;
  Store.find().then((stores) => {
    allStores = stores;
    return getLatLng(req.params.address);
  }).then((result) => {
    const lat = result.results[0].geometry.location.lat;
    const lng = result.results[0].geometry.location.lng;
    const closedToo = req.params.closedToo === "Y" ? true : false;
    const numberStores = Math.min(Number(req.params.numberStores), allStores.length);
    const origin = new GeoPoint(Number(lat), Number(lng));
    const dt = new Date();
    const offset = dt.getTimezoneOffset()
    // get UTC time first, subtract 4 (difference to EST time)
    const hourUTC = new Date(dt.getTime() + offset * 60 * 1000).getHours();
    const hour = hourUTC - 4 < 0 ? hourUTC - 4 + 24 : hourUTC - 4;
    // if !closedToo, filter out the stores that are already closed (or not open yet)
    const stores = closedToo ? allStores : (allStores.filter((elem) => elem.openHours <= hour && elem.closeHours > hour));
    stores.forEach((elem) => { // add dist property to all stores, distance to point (lat, lng) supplied above
      elem.dist = origin.distanceTo(new GeoPoint(elem.lat, elem.lng), true);
    });
    const queue = new TinyQueue([], (a, b) => (b.dist - a.dist)); // initialize max queue
    let i = 0;
    while (i < stores.length && queue.length < numberStores) { // push the first 'numberStores' into it
      queue.push(stores[i]);
      i++;
    }
    // go through the rest of the stores
    // if the max dist store in queue is larger than the current dist, remove top and push current
    while (i < stores.length) {
      if (queue.peek().dist > stores[i].dist) {
        queue.pop();
        queue.push(stores[i]);
      }
      i++;
    }
    const retStores = [];
    while (queue.length) retStores.push(queue.pop());
    //log(retStores);
    retStores.sort((a, b) => a.dist - b.dist); // sort the 'numberStores' stores in asc order
    res.status(200).send({ lat, lng, stores: retStores });
  }).catch((err) => {
    log(err);
    res.status(500).send({ message: err });
  })
})


/*************************************************/
// static js directory
app.use("/js", express.static(__dirname + '/public/js'))
app.use(express.static('public'));

/*************************************************/
// Express server listening...
const port = process.env.PORT || 3001
app.listen(port, () => {
  log(`Listening on port ${port}...`);
})

/*************************************************/
// Helpers

function getLatLng(mapAdr) {
  return new Promise((resolve, reject) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${mapAdr}&key=${apiKey}`;
    request({ url, json: true }, (error, response, body) => {
      if (error) {
        reject("Can't connect to server");
      } else if (response.statusCode !== 200) {
        reject('Issue with getting resource');
      } else {
        resolve(body);
      }
    })
  })
}

module.exports = app;