// Store our API endpoint inside Url for earthquake data
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// Store in a url the API endpoint for the tectonic plates data
var API_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

function markerSize(mag) {
    return mag * 30000;
}

function markerColor(mag) {
    if (mag <= 1) {
        return "#ADFF2F";
    } else if (mag <= 2) {
        return "#9ACD32";
    } else if (mag <= 3) {
        return "#FFFF00";
    } else if (mag <= 4) {
        return "#ffd700";
    } else if (mag <= 5) {
        return "#FFA500";
    } else {
        return "#FF0000";
    };
}

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            //});

            // Define a function we want to run once for each feature in the features array
            // Give each feature a popup describing the place and time of the earthquake
            //function onEachFeature(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + "Date" + ":" + new Date(feature.properties.time) + "</p>" +
                "</h3><p>" + "Magnitude" + ":" + feature.properties.felt + "</p>" +
                "</h3><p>" + "Felt" + ":" + feature.properties.felt + "</p>" +
                "</h3><p>" + "Alert" + ":" + feature.properties.alert + "</p>")
        },
        pointToLayer: function(feature, latlng) {
            return new L.circle(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.properties.mag),
                fillOpacity: 1,
                stroke: false,
            })
        }
    });


    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

// Create a variable to hold the layer for the tectonic plates layer
var plateBoundary = new L.LayerGroup();
// //Run the function on each point of the array
d3.json(API_plates, function(geoJson) {
    L.geoJSON(geoJson.features, {
        return: { weight: 2, color: 'magenta' }
    })
}).addTo(myMap);

function createMap(earthquakes) {

    // Define satellite, light, high-contrast, and outdoor layers
    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var highContrastMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.high-contrast',
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite Map": satellite,
        "Light Map": lightmap,
        "Outdoors": outdoors,
        "High Contrast": highContrastMap,
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        PlateBoundaries: plateBoundary,
    };

    // Create our map, giving it the stellite and earthquakes layers to display on load
    var myMap = L.map("map-id", {
        center: [37.09, -95.71],
        zoom: 4,
        layers: [lightmap, earthquakes, plateBoundary]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

    var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function() {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [0, 1, 2, 3, 4, 5];

        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(magnitudes[i] + 1) + '"></i> ' +
                +magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
        }

        return div;
    };

    legend.addTo(myMap);
}