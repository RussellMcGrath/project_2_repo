// define datasource address
link = "/api/fires" //"static/csv/data.csv";
console.log("hello")
var heatMapLayer;


d3.json(link, function(response) {

  var heatArray = [];

  for (var i = 0; i < response.length; i++) {
    var location = response[i];

    if (location) {
      heatArray.push([location.lat, location.lon]);
    }
  }

  heatMapLayer = L.heatLayer(heatArray, {
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
  })

  console.log(heatMapLayer)
});