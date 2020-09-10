const axios = require('axios');
const cheerio = require('cheerio');
const { mongoose } = require('./db/mongoose');
const { Store } = require('./models/store');
const log = console.log;

// every 24 hours update the operating hours of all the stores
//const allStores = [];
Store.find().then((stores) => {
  let t = 0;
  const intervalObj = setInterval(() => {
    if (t === stores.length - 1) {
      clearInterval(intervalObj);
      setTimeout(() => { mongoose.connection.close(); }, 4000)
    }
    const curr = t;
    storeHours(stores[curr]).then((response) => {
      const $ = cheerio.load(response.data);
      const elems = $('div > span.FCUp0c.rQMQod');
      const hours1 = "1" in elems ? parseTimeData(elems["1"].children[0].data) : [];
      const hours2 = "2" in elems ? parseTimeData(elems["2"].children[0].data) : [];
      const hours = hours1.length === 0 || isNaN(hours1[0]) ? hours2 : hours1;
      let open, close;
      if (hours.length === 0 || isNaN(hours[0]) || isNaN(hours[1])) {
        open = -1; close = -1;
      } else {
        open = hours[0]; close = hours[1];
      }
      if (open === -1) {
        log("curr = " + curr + " _id= " + stores[curr]._id + " ============================================== Problem =============================");
        if ("0" in elems) log("0 " + elems["0"].children[0].data);
        if ("1" in elems) log("1 " + elems["1"].children[0].data);
        if ("2" in elems) log("2 " + elems["2"].children[0].data);
        if ("0" in elems) log(elems["0"].children);
        if ("1" in elems) log(elems["1"].children);
      }
      //log("curr = " + curr + " open " + open + " close " + close);
      return Store.updateOne({ _id: stores[curr]._id }, { openHours: open, closeHours: close }, { returnOriginal: false });
    }).then((stre) => {
      //log(stre);
    }).catch((error) => {
      log(error);
      clearInterval(intervalObj);
    });
    t++;
  }, 4000); // add a delay to requests to google, to avoid 429 Too Many Requests
}).catch((err) => {
  log(err);
});

// ==================== Helper Functions ====================

function storeHours(store) {
  const name = store.name.replace(/[^a-zA-Z0-9' ]/g, "").replace(/ /g, '+');
  const location = store.address.replace(/[^a-zA-Z0-9' ]/g, "").replace(/ /g, '+');
  const city = store.cityTown.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, '+');
  const search = "https://www.google.com/search?q=" + name + "+" + location + "+" + city + "+hours";
  return axios.get(search);
}

function parseTimeData(str) {
  let open, close;
  if (str.includes("24 hours")) {
    open = 0; close = 24;
  } else if (str.includes("Closed")) {
    open = 24; close = 0;
  } else if (str.includes("a.m.") || str.includes("p.m.") || str.includes("am") || str.includes("pm") ||
      str.includes("A.M.") || str.includes("P.M.") || str.includes("AM") || str.includes("PM")) {
    let i = 0;
    while ((str[i] >= '0' && str[i] <= '9') || str[i] === 'A' || str[i] === 'P' || str[i] === 'M' || str[i] === 'a' || str[i] === 'p' || str[i] === 'm' || str[i] === '.' || str[i] === ':') { i++; }
    open = extractTime(str.slice(0, i)); close = extractTime(str.slice(i + 1));
  } else {
    open = NaN; close = NaN;
  }
  return [open, close];
}

function extractTime(str) {
  // extract time from a string in the format xx:xx(a.m./p.m.) or xx(a.m./p.m.) where x are numbers
  // for example extractTime("5:30a.m") = 5.5 , extractTime("8:30p.m.") = 20.5, extractTime("9p.m.") = 21
  if (!str.includes(":")) {
    let i = 0;
    while (str[i] >= '0' && str[i] <= '9') { i++; }
    return (str.includes("a.m.") || str.includes("am") || str.includes("AM") || str.includes("A.M.")) && parseInt(str.slice(0, i)) !== 12
      ? parseInt(str.slice(0, i)) : parseInt(str.slice(0, i)) + 12;
  } else {
    let i = 0;
    while (str[i] >= '0' && str[i] <= '9') { i++; }
    const hours = (str.includes("a.m.") || str.includes("am") || str.includes("AM") || str.includes("A.M.")) && parseInt(str.slice(0, i)) !== 12
      ? parseInt(str.slice(0, i)) : parseInt(str.slice(0, i)) + 12;
    let j = i + 1;
    while (str[j] >= '0' && str[j] <= '9') { j++; }
    const mins = parseInt(str.slice(i + 1, j));
    return hours + (mins / 60);
  }
}