// Store our API endpoint inside Url for earthquake data
var API_quakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
//console.log(API_quakes)

// Store in a url the API endpoint for the tectonic plates data
var API_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
//console.log(API_plates)

//Define marker size based on the magnitude of the earthquake
function markerSize(magnitude) {
  //Set the max size
    return magnitude * 4;
};

// Create a GeoJSON layer containing the features array on the earthquakeData object
var earthquakes = new L.LayerGroup();

// Perform a GET request to the query URL
d3.json(API_quakes, function(geoJson) {
// Parse once for each piece of data in the array
    L.geoJSON(geoJson.features, {
        pointToLayer: function(geoJsonPoint, latlng) {
          //Make the markers resize based on the magnitude of the earthquake
            return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag) });
        },
        //Assign style to each marker
        style: function(geoJsonFeature) {
            return {
              //Make the markers change color based on the magnitude of the earthquake
                fillColor: Color(geoJsonFeature.properties.mag),
                //Define opacity of marker
                fillOpacity: 0.7,
                //Define weight and color for marker
                weight: 0.1,
                color: 'black'

            }
        },
        // Run the onEachFeature function once for each piece of data in the array
          onEachFeature: function(feature, layer) {
            //Bind popups and assign data to be displayed
            layer.bindPopup
            //Define the content to be shown in the popup
            ("<h3>" + feature.properties.place +
            "</h3><hr><p>" + "Date" + ":" + new Date(feature.properties.time) + "</p>" +
            "</h3><p>" + "Magnitude" + ":" + feature.properties.felt + "</p>" +
            "</h3><p>" + "Felt" + ":" + feature.properties.felt + "</p>" +
            "</h3><p>" + "Alert" + ":" + feature.properties.alert + "</p>")
        }
        //Append to layer
    }).addTo(earthquakes);
     // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
});

// Create a GeoJSON layer containing the features array on the tectonic plates object 
var plateBoundary = new L.LayerGroup();

// Perform a GET request to the query URL
d3.json(API_plates, function(geoJson) {
// Parse once for each piece of data in the array
    L.geoJSON(geoJson.features, {
      //Add style to the plates boundaries (weight and color)
        style: function(geoJsonFeature) {
            return {
                weight: 2,
                color: 'blue'
            }
        },
      //Add to layer  
    }).addTo(plateBoundary);
})

//Define marker color based on the magnitude of the earthquake
function Color(magnitude) {
    if (magnitude > 5) {
        return 'red'
    } else if (magnitude > 4) {
        return 'darkorange'
    } else if (magnitude > 3) {
        return 'tan'
    } else if (magnitude > 2) {
        return 'yellow'
    } else if (magnitude > 1) {
        return 'darkgreen'
    } else {
        return 'lightgreen'
    }
};

//Create function to build map
function createMap() {

    // Define satellite, light, high-contrast, and outdoor layers, and assign the max zoom allowed
    //Hold High-contrast map in a variable
    var highContrastMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.high-contrast',
        accessToken: API_KEY
    });
    //Hold Outdoors map in a variable
    var outdoors = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.outdoors',
        accessToken: API_KEY
    });
    //Hold Light-contrast map in a variable
    var lightMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.light',
        accessToken: API_KEY
    });

    //Hold Satellite map in a variable
    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: API_KEY
    });

    //Set up base map layers to be shown
    var baseLayers = {
        "High Contrast": highContrastMap,
        "Outdoors": outdoors,
        "Light": lightMap,
        "Satellite": satellite
    };
    // Set up overlays for maps, these will be shown using the controls feature 
    var overlays = {
        //Earthquakes layer
        "Earthquakes": earthquakes,
        //Plate boundaries layer
        "Plate Boundaries": plateBoundary,
    };

    //Create map with all options
    var mymap = L.map('map-id', {
      //Set initial position for the map
        center: [40, -99],
      //Set the zoom in level  
        zoom: 4.3,
      //Set the initial layers to be shown in the map
        layers: [lightMap, earthquakes, plateBoundary]
    });

    //Add controls for the map, and define the initial state of the controls
    L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(mymap);

    //Add legends and add to map, and define the position
    var legend = L.control({ position: 'bottomleft' });
    //Add legend to map
    legend.onAdd = function(map) {
      //Define contents in the legend box
        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];
        //Set the style 
        div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"

        //Loop through data to assign color based on magnitude of earthquake
        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + Color(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }

        return div;
    };
    //Add legen to map
    legend.addTo(mymap);
}
