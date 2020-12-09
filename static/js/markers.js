console.log("Running markers script")
// define colored icon objects
var greenIcon = L.icon({
  iconUrl: 'static/images/green.png',
  iconSize:     [40, 40], // size of the icon
  iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});
var blueIcon = L.icon({
  iconUrl: 'static/images/blue.png',
  iconSize:     [40, 40], // size of the icon
  iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});
var blackIcon = L.icon({
  iconUrl: 'static/images/black.png',
  iconSize:     [40, 40], // size of the icon
  iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});
var grayIcon = L.icon({
  iconUrl: 'static/images/gray.png',
  iconSize:     [40, 40], // size of the icon
  iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});
var yellowIcon = L.icon({
  iconUrl: 'static/images/yellow.png',
  iconSize:     [40, 40], // size of the icon
  iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});
var aquaIcon = L.icon({
  iconUrl: 'static/images/aqua.png',
  iconSize:     [40, 40], // size of the icon
  iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});
var redIcon = L.icon({
  iconUrl: 'static/images/red.png',
  iconSize:     [40, 40], // size of the icon
  iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});
var pinkIcon = L.icon({
  iconUrl: 'static/images/pink.png',
  iconSize:     [40, 40], // size of the icon
  iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});

// declare map object variable
var myMap;

// define map tile layers
var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-streets-v11",
    accessToken: API_KEY
  })//.addTo(myMap);
var outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
});

// define datasource address
link = "/api/fires" //"static/csv/data.csv";

// instantiate marker arrays
var markers = []
var responseMarkers = [];
var humanMarkers = [];
var lightningMarkers = [];
var prescribedMarkers = [];
var unknownMarkers = [];
var otherMarkers= [];

console.log("still running")

// get data from api
d3.json(link, response => {
  console.log("running d3 json")
  console.log(response)
  
  createMarkerMap(response)
  createControls()
  
  buildLegend(myMap);
  

  
  // add scale to map
  L.control.scale().addTo(myMap);

});

function createMarkerMap(response) {
  console.log("running create markermap")
  for (i=0;i<response.length;i++) {
    // define row data
    fire = response[i]
    if (fire.acres === "n/a") {
      var marker = L.marker([fire.lat,fire.lon], markerStyler(fire))//.addTo(myMap);
      marker.bindPopup(`${fire.title}<hr>${fire.cause}<br><a href="${fire.link_url}">Click for details</a>`)
      marker.on("click", function() {myMap.setView([this._latlng.lat, this._latlng.lng],9)})
      marker.on("click", function() {myMap.setView([39,-110],5)})
      markerSorter(fire,marker);
    } else {
      fire.acres = +fire.acres      
      var marker = L.marker([fire.lat,fire.lon], markerStyler(fire))//.addTo(myMap)
      var burnArea = L.circle([fire.lat,fire.lon], burnAreaStyler(fire))//.addTo(myMap)
      marker.bindPopup(`${fire.title}<hr>Size: ${fire.acres} acres<br>Cause: ${fire.cause}<br><a href="${fire.link_url}">Click for details</a>`)
      burnArea.bindPopup(`${fire.title}<hr>Size: ${fire.acres} acres<br>Cause: ${fire.cause}<br><a href="${fire.link_url}">Click for details</a>`)
      marker.on("click", function() {myMap.setView([this._latlng.lat, this._latlng.lng],9)})
      burnArea.on("click", function() {myMap.setView([this._latlng.lat, this._latlng.lng],9)})
      marker.on("click", function() {myMap.setView([39,-110],5)})
      burnArea.on("click", function() {myMap.setView([39,-110],5)})
      markerSorter(fire,marker);
      markerSorter(fire,burnArea);
    }
  }
}


function createControls() {
  var markerLayer = L.layerGroup(markers);
  var responseLayer = L.layerGroup(responseMarkers);
  var humanLayer = L.layerGroup(humanMarkers);


  var baseMaps = {
    Satellite: satelliteMap,
    Outdoors: outdoorMap
  }
  var overlays = {
    Fires: markerLayer
  };

  myMap = L.map("map", {
    center: [39, -110],
    zoom: 5,
    layers: [satelliteMap,markerLayer]
  });

  // create tile/overlay controls
  L.control.layers(baseMaps,overlays, {collapsed: false}).addTo(myMap);

}

function markerStyler (fire) {
  var markerStyle = {};
  var icon;
  switch(fire.cause) {
    case "Burned Area Emergency Response":
      icon = pinkIcon;
      break;
    case "Human":
      icon = redIcon;
      break;
    case "Lightning":
      icon = yellowIcon;
      break;
    case "Prescribed Fire":
      icon = greenIcon;
      break
    case "Unknown":
      icon = blueIcon
      break;
    default:
      icon = grayIcon
  }
  markerStyle = {icon: icon}
  return markerStyle  
}

function burnAreaStyler(fire) {
  var burnAreaStyle = {
    radius: Math.sqrt(((fire.acres*.00156)/Math.PI))*700,
    color: "orange",
    fillColor: "orange"
  }
  return burnAreaStyle
}

function markerSorter(fire,marker) {
  switch(fire.cause) {
    case "Burned Area Emergency Response":
      responseMarkers.push(marker);
      break;
    case "Human":
      humanMarkers.push(marker);
      break;
    case "Lightning":
      lightningMarkers.push(marker);
      break;
    case "Prescribed Fire":
      prescribedMarkers.push(marker);
      break
    case "Unknown":
      unknownMarkers.push(marker);
      break;
    default:
      otherMarkers.push(marker)
  }
  markers.push(marker)
}


// Function to create the map legend
function buildLegend(mapObject) {
  // create legend object
  var markerLegend = L.control({ position: "bottomright" });
  // add legend content
  
  markerLegend.onAdd = function() {
    // create div to hold legend
    var div = L.DomUtil.create("div", "info legend");
    // create list of legend labels
    var causes = ["Burned Area Emergency Response","Human","Lightning","Prescribed","Unknown","other"];
    // create list of marker names
    var markerNames = ["pink","red","yellow","green","blue","gray"]
    // create legend html content
    var legendInfo = `<h3>Fire Cause</h3><hr>\
                      <ul>\
                        <li><img src="static/images/${markerNames[0]}.png" width=30 height=30>${causes[0]}</li>\
                        <li><img src="static/images/${markerNames[1]}.png" width=30 height=30>${causes[1]}</li>\
                        <li><img src="static/images/${markerNames[2]}.png" width=30 height=30>${causes[2]}</li>\
                        <li><img src="static/images/${markerNames[3]}.png" width=30 height=30>${causes[3]}</li>\
                        <li><img src="static/images/${markerNames[4]}.png" width=30 height=30>${causes[4]}</li>\
                        <li><img src="static/images/${markerNames[5]}.png" width=30 height=30>${causes[5]}</li>\
                      </ul>`

    // add completed html code to the legend object
    div.innerHTML = legendInfo;

    return div;
  };
  // add legend to the map
  markerLegend.addTo(mapObject);

  myMap.on('overlayremove', function (eventLayer) {
    // Switch to the Population legend...
    if (eventLayer.name === 'Fires') {
        this.removeControl(markerLegend);
    }
  });
  myMap.on('overlayadd', function (eventLayer) {
    // Switch to the Population legend...
    if (eventLayer.name === 'Fires') {
        this.addControl(markerLegend);
    }
  });
}

console.log("still running")