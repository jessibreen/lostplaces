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
var Draw = mapboxgl.Draw(
    {
        displayControlsDefault: false,
        controls: {
            'point': true
            'trash': true
        },

    }
);

var datasetId = "cj0ldpqfa00022xphwg2k355z";

var source = new mapboxgl.GeoJSONSource({
    data: {
        "type": "FeatureCollection",
        "features": []
    }
});

document.getElementById('updateDataset').onclick = function(e) {
    e.preventDefault();
    uploadFeatures();
}


map.on('load', function(){
    map.addControl(Draw);

    map.addSource('dataset', source);
    map.addLayer({
        "id": "dataset-point",
        "type": "circle",
        "source": "dataset",
        "layout": {},
        "paint": {
            // grab the route's color value
            "circle-color": "#73b6e6",
        },
        "filter": [
            "all",
            ["==", "$type", "Point"]
        ]
    });

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

map.on('draw.update', function(e){alert('test')});
map.on('draw.render', function(e){alert('test2')});
map.on('draw.modechange', function(e){alert('test3')});

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
            source.setData(geoJsonFeatures);
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