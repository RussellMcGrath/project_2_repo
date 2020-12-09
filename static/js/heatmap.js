// define map object
var myMap = L.map("map", {
  center: [39, -110],
  zoom: 5
});

// define map tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
}).addTo(myMap);

// link to data source
var link = "/api/fires";

// call api data
d3.json(link, function(response) {
  // log respoonse
  console.log(response);
  // declare coordinates array
  var heatArray = [];
  // loop through response and store coordinates to array
  for (var i = 0; i < response.length; i++) {
    var location = response[i];
    if (location) {
      heatArray.push([location.lat, location.lon]);
    }
  }
  // define heat layer
  var heat = L.heatLayer(heatArray, {
    maxZoom: 3,
    radius: 20,
    max: 2,
    blur: 6,
    gradient: {
      0.0:'blue',
      0.42: 'crimson',
      0.65: 'lime',
      1.0: 'red'
    }
  }).addTo(myMap);
})