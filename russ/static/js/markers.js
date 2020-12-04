var myMap = L.map("map", {
    center: [39, -110],
    zoom: 5
  });

var streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    //zoomOffset: -1,
    id: "outdoors-v11",
    accessToken: API_KEY
  }).addTo(myMap);

var greenIcon = L.icon({
    iconUrl: 'https://img.icons8.com/fluent/72/marker-storm.png',
    //shadowUrl: 'leaf-shadow.png',

    iconSize:     [48, 48], // size of the icon
    //shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    //shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});


link = "static/csv/data.csv";

var markers = [];

d3.csv(link, response => {
  console.log(response)
  for (i=0;i<response.length;i++) {
    fire = response[i]
    if (fire.size === "n/a") {
      var marker = L.marker([fire.lat,fire.lon], {icon: greenIcon}).addTo(myMap)
      marker.bindPopup(`${fire.title}<hr>${fire.cause}<br><a href="${fire.link}">Click for details</a>`)
      //markers.push(marker)
    } else {
      fire.size = +fire.size      
      var marker = L.circle([fire.lat,fire.lon], circleStyler(fire)).addTo(myMap)
      var burnArea = L.circle([fire.lat,fire.lon], burnAreaStyler(fire)).addTo(myMap)
      marker.bindPopup(`${fire.title}<hr>Size: ${fire.size} acres<br>Cause: ${fire.cause}<br><a href="${fire.link}">Click for details</a>`)
      burnArea.bindPopup(`${fire.title}<hr>Size: ${fire.size} acres<br>Cause: ${fire.cause}<br><a href="${fire.link}">Click for details</a>`)
      //marker.on("click", function(e) {myMap.panTo(e.latlng, 12)})
    }
  }
});

function circleStyler (fire) {
  var circleStyle = {};
  var circleRadius = 20000+fire.size/3;
  var circleColor;
  var circleFillColor;
  if (fire.cause === "Lightning") {
    circleColor = "blue"
    circleFillColor = "blue"
  } else if (fire.cause === "Unknown") {
    circleColor = "gray"
    circleFillColor = "gray"
  }
  circleStyle = {radius: circleRadius,
                color: circleColor,
                fillColor: circleFillColor}
  return circleStyle
}

function burnAreaStyler(fire) {
  var burnAreaStyle = {
    radius: Math.sqrt(((fire.size*.00156)/Math.PI))*700,
    color: "orange",
    fillColor: "orange"
  }
  return burnAreaStyle
}

L.control.scale().addTo(myMap);
var markerLayer = L.layerGroup(markers)

// var circleClick = d3.selectAll("path").on("click", function() {
//   console.log("doing")
//   var latlon = this.d.point.split(',')
//   var lat = latlon[0]
//   var lon = latlon[1]
//   var zoom = 10

//   myMap.panTo(latlon,zoom)
// })

// var circleGroup = d3.selectAll(".leaflet-marker-icon")
// markerLayer.on("click", function() {
//   console.log("hello")
// })

