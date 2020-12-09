// Creating map object
var myMap = L.map("map", {
  center: [39.1432892,-96.8211714,4.92],
  zoom: 5
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v9", //streets-v11",
  accessToken: API_KEY
}).addTo(myMap);

// Load in  data from csv
var link = "static/csv/data.csv";
var statesJs = "static/js/us-states.json";
var lowColor = '#FFEDA0';
var highColor = '#800026';
var dataArray = [];
var geojson;

// Grab data with d3
d3.csv(link, function(data) {
    
    // Load GeoJSON data and merge with states data
    d3.json(statesJs, function(json) {
    
      console.log(json);
      // reset data
      for (var j = 0; j < json.features.length; j++) {
        json.features[j].properties.density = 0;
      }

      // Loop through each state data value in the .csv file
      for (var i = 0; i < data.length; i++) {
        // Grab State Name
        var dataState = data[i].state;
      
        // Grab data value 
        var dataValue = 0;
        if (data[i].acres == "n/a") {
           dataValue = 1;
        } else {
          dataValue = parseFloat(data[i].acres)
        }
        //console.log(dataState + "->" + dataValue);
  
        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < json.features.length; j++) {
          var jsonState = json.features[j].properties.name;
          
          if (dataState == jsonState) {
            // Copy the data value into the JSON
            json.features[j].properties.density = json.features[j].properties.density + dataValue;
            //console.log("=>>"+dataState + "->" + json.features[j].properties.density);
            // Stop looking through the JSON
            break;
          }
        }
        //console.log(json)
      }

 
      for (var j = 0; j < json.features.length; j++) {
          dataArray.push(json.features[j].properties.density);
      }
      geojson = L.geoJson(json, {style: style}).addTo(myMap);
      
      
   });


});


function getColor(d) {

  var minVal = d3.min(dataArray);
  var maxVal = d3.max(dataArray);
  var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor]);
    
  return ramp(d);
};

function style(feature) {
  return {
      fillColor: getColor(feature.properties.density),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
  };
};

function highlightFeature(e) {
  var layer = e.target;
  
  layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
  };
};

function resetHighlight(e) {
  geojson.resetStyle(e.target);
};

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
};

function onEachFeature(feature, layer) {
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
  });
}

geojson = L.geoJson(statesData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(myMap);

var info = L.control();

info.onAdd = function (myMap) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>US </h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
        : 'Hover over a state');
};

info.addTo(myMap); 

// Binding a pop-up to each layer
 //onEachFeature:function(feature, layer) {
 //layer.bindPopup(`${fire.state}<hr>${fire.acres}<br><a href="${fire.acres}">Click for details</a>`);
 //layer.bindPopup(`${fire.state}<hr>${fire.acres}<br><a href="${fire.acres}">Click for details</a>`);
 //};
 //.addTo(myMap);

/*
// Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var limits = dataArray.options.limits;
  var colors = cj.options.colors;
  var labels = [];

    // Add min & max
    var legendInfo = "<h1>Median Income</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });
  
    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);
 
*/
