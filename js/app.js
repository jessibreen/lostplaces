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
        'point': true
    },

});

var datasetId = "cj0ldpqfa00022xphwg2k355z";



map.on('load', function(){
    map.addControl(Draw);
});


//tell the modal to clear values if it becomes hidden
$('#submitModal').on('hidden.bs.modal', function (e) {
    $('#submitModal').find('input').val('');
})

//tell the modal to clear the Draw points if the modal has been dismissed (backdrop click does not dismiss this modal)
$('#submitModal button[data-dismiss="modal"]').click(function(){
    Draw.deleteAll();
});

//Add the handler for the submit modal save button
$('#allSubmitBtn').click(function(e){
    var properties = {
        'placeName': $('#placeName').val(),
        'yearsLived': $('#yearsLived').val(),
        'placeDescription': $('#placeDescription').val()
        }

    $('#allSubmitBtn').text('Saving...');
    //add fields to the Draw feature
    saveFeatureProperties($('#submitModal').data('featureId'), Draw, properties);

    //get the full draw feature
    featureData = Draw.get($('#submitModal').data('featureId'));
    
    ga('send', {
      hitType: 'event',
      eventCategory: 'Create Point',
      eventAction: 'clickSave',
      eventLabel: 'Clicked save'
    });

    //post the feature to the server
    postFeature(
        featureData,
        function(e){
            $('#submitModal').modal('hide');
            //Draw.deleteAll();
            $('#allSubmitBtn').text('Save');
            
            ga('send', {
              hitType: 'event',
              eventCategory: 'Create Point',
              eventAction: 'saveSuccess',
              eventLabel: 'Successful Save'
            });
            
        }),
        function(e){
        //this doesn't fire on some ajax errors
            console.error("error posting to server", e);
            ga('send', {
              hitType: 'event',
              eventCategory: 'Create Point',
              eventAction: 'saveError',
              eventLabel: 'Error on Save'
            });
             $('#submitModal .alert').show().text("There was a problem saving your submission.")
        }

})

map.on('draw.create', function(e) {
    var featureId = e.features[0].id;
    $('#submitModal').modal('show').data('featureId', featureId);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Create Point',
      eventAction: 'createModalOpened',
      eventLabel: 'Create point modal opened'
    });
});



//Save an object of properties into a provided feature and Mapbox GL Draw object
function saveFeatureProperties(featureId, drawObj, properties){
    $.each(properties, function(property, value){
        drawObj.setFeatureProperty(featureId, property, value);
    })

}


//Use jQuery to POST the geoJSON of a single provided feature to Mapbox
function postFeature(featureData, success, error) {

    var postData = {
        feature: featureData,
        datasetId: "cj0ldpqfa00022xphwg2k355z"
    }

    $.ajax({
        url:'http://lostplacesmap.org/api/dataset',
        type:"POST",
        data:JSON.stringify(postData),
        contentType:"application/json",
        dataType:"json",
        success: success,
        error: error
    })
}


