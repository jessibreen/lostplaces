/**
 * Created by Moomintroll on 3/22/17.
 */
$('#aboutModal').modal('show');
mapboxgl.accessToken = 'pk.eyJ1IjoiamVzc2licmVlbiIsImEiOiJGNnlGVkRrIn0.Ar8l7jFbPYG3SWR-DrTyNQ';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/jessibreen/cj0l6jygv002z2smr7yyp8fhx', //stylesheet location
    center: [-84.492, 38.050], // starting position
    zoom: 13.8, // starting zoom
    bearing: 48.05
});


var geoJsonFeatures;
var Draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        'point': true,
        'trash': true
    },

});

var datasetId = "cj0ldpqfa00022xphwg2k355z";

document.getElementById('updateDataset').onclick = function(e) {
    e.preventDefault();
    uploadFeatures();
}


map.on('load', function(){
    map.addControl(Draw);


    map.addSource('dataset', {
        "type": "geojson",
        "data":  {
            type: 'FeatureCollection',
            features: []
        }
        }
    );

    map.addLayer({
        "id": "dataset-point",
        "type": "symbol",
        "source": "dataset",
        "layout": {
            "icon-image": "triangle-15"
        },
        //"paint": {
            // grab the route's color value
            //"circle-color": "#73b6e6",
        //},
        "filter": [
            "all",
            ["==", "$type", "Point"]
        ]
});

    map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['dataset-point'] });

        if (!features.length) {
            return;
        }

        var feature = features[0];

        // Populate the popup and set its coordinates
        // based on the feature found.
        var popup = new mapboxgl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setHTML("<h1>Hello World!</h1>")
            .addTo(map);
    });

    // map.on('click', function (e) {
    //     var markerHeight = 50, markerRadius = 10, linearOffset = 25;
    //     var popupOffsets = {
    //         'top': [0, 0],
    //         'top-left': [0, 0],
    //         'top-right': [0, 0],
    //         'bottom': [0, -markerHeight],
    //         'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    //         'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    //         'left': [markerRadius, (markerHeight - markerRadius) * -1],
    //         'right': [-markerRadius, (markerHeight - markerRadius) * -1]
    //     };
    //
    //     var popupContent = "<h1>Hello World!</h1>";
    //
    //     var popup = new mapboxgl.Popup({closeOnClick: false, offset: popupOffsets})
    //         .setLngLat(features.geometry.coordinates)
    //         .setHTML(popupContent)
    //         .addTo(map);
    // });

    // document.getElementById('export').onclick = function(e) {
    //     // Extract GeoJson from featureGroup
    //     var data = Draw.getAll();
    //
    //     if (data.features.length > 0) {
    //         // Stringify the GeoJson
    //         var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
    //
    //         // Create export
    //         document.getElementById('export').setAttribute('href', 'data:' + convertedData);
    //         document.getElementById('export').setAttribute('download','data.geojson');
    //     } else {
    //         alert("Wouldn't you like to draw some data?");
    //     }
    //
    // }



    getData(datasetId);





});

map.on('draw.create', function(e) {$('#submitModal').modal('show');
    console.log(e);






});

function setFeatureId(){
    return getData(datasetId);
}

function getData(datasetId) {
    $.ajax({
        url : 'https://mysterious-beyond-97824.herokuapp.com/dataset?datasetId=' + datasetId,
        type : 'GET',
        dataType: 'json'
    })
        .done(function(oldData){
            geoJsonFeatures = oldData;
            //source.setData(geoJsonFeatures);
            map.getSource('dataset').setData(geoJsonFeatures);

            return geoJsonFeatures;
        });
}

function uploadFeatures(){
    var drawnData = Draw.getAll();
    for(i = 0; i < drawnData.features.length; i++){

        var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
        xmlhttp.open("POST", 'https://mysterious-beyond-97824.herokuapp.com/dataset');
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(JSON.stringify({"feature":drawnData.features[i], "datasetId": "cj0ldpqfa00022xphwg2k355z"}));

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && i == drawnData.features.length) {
                alert('upload successful!');

                getData(datasetId);
            } else if (xmlhttp.readyState == 4 && xmlhttp.status !== 200){
                alert('looks like something went wrong');
            }
        };
    }
}