const log = console.log;
let map, markers;
const storesInfoDiv = document.getElementById("storesInfo");
const checkedShowClosed = document.getElementById("showClosed");
const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

function initMap() {
  const mapAdr = document.getElementById("locationTxt").value;
  const numberStores = document.getElementById("numStores").value;
  const op = checkedShowClosed.checked ? "Y" : "N"; // if checked, want to see all stores, not just open ones
  if (numberStores === "") {
    alert("Select number of stores");
    return;
  }
  let alerted = false;
  fetch('/closestStore/' + mapAdr + "/" + numberStores + "/" + op).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      alert("Maintenance on the server, (operating hours are being updated)");
      alerted = true;
      return Promise.reject();
    }
  }).then((json) => {
    removeAllChildren(storesInfoDiv); // clear the previous stores if any
    populateStores(json.stores);             // populate with new stores
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: json.lat, lng: json.lng },
      zoom: 12
    });
    markers = json.stores.map((location, i) => {
      return new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        label: labels[i % labels.length]
      });
    });
    markers.push(new google.maps.Marker({
      position: { lat: json.lat, lng: json.lng },
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      }
    }));
    const markerCluster = new MarkerClusterer(map, markers,
      { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
  }).catch((err) => {
    if (!alerted) alert(err);
  });
}

function removeAllChildren(elem) {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
}

function populateStores(stores) { // takes an array of store objects from the server and renders them
  let i = 0;
  while (i < stores.length) {
    const storeDiv = document.createElement("div");
    storeDiv.className = "store";
    const headerH3 = document.createElement("h3");
    headerH3.appendChild(document.createTextNode("(" + labels[i % labels.length] + ") " +
      capitalizeWords(stores[i].name)));
    storeDiv.appendChild(headerH3);
    storeDiv.appendChild(document.createTextNode(stores[i].address));
    storeDiv.appendChild(document.createElement("br"));
    storeDiv.appendChild(document.createTextNode(stores[i].cityTown + " ON " + stores[i].postalCode));
    storeDiv.appendChild(document.createElement("br"));
    const open = stores[i].openHours;
    const close = stores[i].closeHours;
    const dayOfWeek = weekday[(new Date()).getDay()];
    let hoursTxt = dayOfWeek + " Hours (@google): ";
    if (open === 0) {
      hoursTxt = hoursTxt.concat("Open 24 hours");
    } else if (open === 24) {
      hoursTxt = hoursTxt.concat("Closed");
    } else if (open === -1 || close === -1) {
      hoursTxt = hoursTxt.concat("Not Available");
    } else {
      hoursTxt = hoursTxt.concat(open > 12 ? Math.floor(open - 12) : Math.floor(open));
      hoursTxt = hoursTxt.concat(open % 1 !== 0 ? ((open % 1) * 60 < 10 ? ":0" + (open % 1) * 60 : ":" + (open % 1) * 60) : "");
      hoursTxt = hoursTxt.concat(open > 12 ? "p.m" : "a.m");
      hoursTxt = hoursTxt.concat("-");
      hoursTxt = hoursTxt.concat(close > 12 ? Math.floor(close - 12) : Math.floor(close));
      hoursTxt = hoursTxt.concat(close % 1 !== 0 ? ((close % 1) * 60 < 10 ? ":0" + (close % 1) * 60 : ":" + (close % 1) * 60) : "");
      hoursTxt = hoursTxt.concat(close > 12 ? "p.m" : "a.m");
    }
    storeDiv.appendChild(document.createTextNode(hoursTxt));
    storesInfoDiv.appendChild(storeDiv);
    i++;
  }
}

function capitalizeWords(str) {
  str = str.toLowerCase();
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}