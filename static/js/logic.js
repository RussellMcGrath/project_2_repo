// Load in  data from csv
var link = "/api/fires";
var statesJs = "static/json/us-states.json";
var lowColor = '#FFEDA0';
var highColor = '#800026';
var dataArray = [];
var geojson;

// Creating map object
var myMap = L.map("map", {
  center: [39,-110],
  zoom: 5
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v9",
  accessToken: API_KEY
}).addTo(myMap);

var info = L.control();

info.onAdd = function (myMap) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = ' <h4> <U> State Level Fire Data </U></h4>' +  (props ?
        '<b>' + props.name + '</b><br /> Acres impacted: ' + Number(props.density).toLocaleString() 
        : 'Hover over a state') ;
};

info.addTo(myMap); 

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

//legend.addTo(map);


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
  info.update(layer.feature.properties);
};

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
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


// Grab data with d3
d3.json(link, function(data) {
    
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
  
        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < json.features.length; j++) {
          var jsonState = json.features[j].properties.name;
          
          if (dataState == jsonState) {
            // Copy the data value into the JSON
            json.features[j].properties.density = json.features[j].properties.density + dataValue;
            break;
          }
        }
      }

      for (var j = 0; j < json.features.length; j++) {
          dataArray.push(json.features[j].properties.density);
      }
      geojson = L.geoJson(json, {style: style, onEachFeature: onEachFeature}).addTo(myMap);
      
      
   });


});
