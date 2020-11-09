// Define streetmap and darkmap layers
var global_map = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

//Create empty LayerGroups
var layers = {
  quake_layer: new L.LayerGroup(),

};

// Creating map object
var myMap = L.map("map", {
  center: [0,0],
  zoom: 3,
  layers: [global_map, layers.quake_layer],
});

// Create an overlayMaps object to hold the dining layer
var overlays = {
  'Earthquakes':layers.quake_layer,
};

// Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
L.control.layers(null, overlays, { collapsed: false }).addTo(myMap);

var limits=[];
function choose_opacity(depth) {
  limits.push(depth);
  var slope = (1 - .25)/(max - min);
  var opac = .25 + slope  * (depth - min);
  // console.log(max);
  // console.log(mag);
  // console.log(opac);
  return opac
}

colors = ['red', 'orange', 'yellow'];
function chooseColor(depth) {
  if (depth > 500){
    return "red"
  }
  else if (depth > 250){

    return "orange"
  }
  else{

    return "yellow"
  }
};

var max = 50;
var min = 50;
// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";


d3.json(queryUrl, function (data) {

  for (var i = 0; i < data.features.length; i++) {
    var magnitude = data.features[i].geometry.coordinates[2];
    if ( magnitude > max ) {
      max = magnitude;
      // console.log("max" + max);
    }

    else if (magnitude < min) {
      min = magnitude;
      // console.log("min" + min);
    }

    else {
      // console.log("continue");
    }
  }
  
  // Creating a geoJSON layer with the retrieved data
  L.geoJSON(data, {
    pointToLayer: function (geoJsonPoint, latlng) {
 
      var quake_marker = L.circle(latlng, {
        stroke: false,
        fillOpacity: choose_opacity(latlng.alt),
        color: chooseColor(latlng.alt),
        fillColor: chooseColor(latlng.alt),
        radius: geoJsonPoint.properties.mag*50000
      });
      quake_marker.addTo(layers.quake_layer);
      return quake_marker;
    },

    onEachFeature: function (feature, layer) {
      layer.on({
        mouseover: function (event) {
          event.target.openPopup();
        },

        mouseout: function (event) {
          event.target.closePopup();
        },

        click: function (event) {
          myMap.setView(event.target.getLatLng(), 6);
        },
      });

      layer.bindPopup(
        " <h2>" +
          feature.properties.place +
          "</h2> <hr> <h3>" +
          feature.properties.mag +
          "</h3>"
      );
    },
  });
  limits = limits.sort((a, b) => a - b)
  // console.log(limits[limits.length-1]-(limits[limits.length-1]/7)); 
});

console.log(limits);
var ranges = [0 , 250 , 500];

// Set up the legend
var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var limits = ranges;
  var colors = colors;
  var labels = [];


  // Add min & max
  var legendInfo = "<h1>Depth Ranges Legend</h1>" +
    "<div class=\"labels\">" +
      "<div class=\"Yellow\">Yellow >"+ ranges[0] + "</div>" +
      "<div class=\"Orange\">Orange >"+ ranges[1] + "</div>" +
      "<div class=\"Red\">Red  >"+ ranges[2] + "</div>" +
    "</div>";

  div.innerHTML = legendInfo;

  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
};

// Adding legend to the map
legend.addTo(myMap);