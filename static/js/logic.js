// Store our API endpoint inside Url for earthquake data
var API_quakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
console.log(API_quakes)

// Store in a url the API endpoint for the tectonic plates data
var API_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
console.log(API_plates)

//Define marker size based on the magnitude of the earthquake
function markerSize(magnitude) {
    return magnitude * 4;
};

//Create the layer group for earthquakes
var earthquakes = new L.LayerGroup();

//Parse each data point and assign a marker
d3.json(API_quakes, function(geoJson) {
    L.geoJSON(geoJson.features, {
        pointToLayer: function(geoJsonPoint, latlng) {
            return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag) });
        },
        //Assign style to each marker
        style: function(geoJsonFeature) {
            return {
                fillColor: Color(geoJsonFeature.properties.mag),
                fillOpacity: 0.7,
                weight: 0.1,
                color: 'black'

            }
        },
        //Define the content of each label in the popup
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + "Date" + ":" + new Date(feature.properties.time) + "</p>" +
                "</h3><p>" + "Magnitude" + ":" + feature.properties.felt + "</p>" +
                "</h3><p>" + "Felt" + ":" + feature.properties.felt + "</p>" +
                "</h3><p>" + "Alert" + ":" + feature.properties.alert + "</p>")
        }
    }).addTo(earthquakes);
    createMap(earthquakes);
});

//Create the layer group for tectonic plates 
var plateBoundary = new L.LayerGroup();

//Parse each data point 
d3.json(API_plates, function(geoJson) {
    L.geoJSON(geoJson.features, {
        style: function(geoJsonFeature) {
            return {
                weight: 2,
                color: 'blue'
            }
        },
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

    //Create each map layer
    var highContrastMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.high-contrast',
        accessToken: 'pk.eyJ1Ijoib2xhd3JlbmNlNzk5IiwiYSI6ImNqZXZvcTBmdDBuY3oycXFqZThzbjc5djYifQ.-ChNrBxEIvInNJWiHX5pXg'
    });

    var outdoors = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.outdoors',
        accessToken: 'pk.eyJ1Ijoib2xhd3JlbmNlNzk5IiwiYSI6ImNqZXZvcTBmdDBuY3oycXFqZThzbjc5djYifQ.-ChNrBxEIvInNJWiHX5pXg'
    });

    var lightMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.light',
        accessToken: 'pk.eyJ1Ijoib2xhd3JlbmNlNzk5IiwiYSI6ImNqZXZvcTBmdDBuY3oycXFqZThzbjc5djYifQ.-ChNrBxEIvInNJWiHX5pXg'
    });


    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: 'pk.eyJ1Ijoib2xhd3JlbmNlNzk5IiwiYSI6ImNqZXZvcTBmdDBuY3oycXFqZThzbjc5djYifQ.-ChNrBxEIvInNJWiHX5pXg'
    });

    //Set up map base layers
    var baseLayers = {
        "High Contrast": highContrastMap,
        "Outdoors": outdoors,
        "Light": lightMap,
        "Satellite": satellite
    };
    // Set up overlays for maps
    var overlays = {
        "Earthquakes": earthquakes,
        "Plate Boundaries": plateBoundary,
    };

    //Create map with all options
    var mymap = L.map('map-id', {
        center: [40, -99],
        zoom: 4.3,
        layers: [outdoors, earthquakes, plateBoundary]
    });

    //Add controls for the map
    L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(mymap);

    //Add legends and add to map
    var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function(map) {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"

        //Loop through data to assign color based on magnitude of earthquake
        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + Color(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(mymap);
}