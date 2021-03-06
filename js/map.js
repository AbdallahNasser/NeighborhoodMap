
var map;
// Use flicker.com api
var filcker = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=306d8113632c74aeb2a02482dc3a909d&format=json&text=";

// Create a new blank array for all markers.
var markers = [];
var locationInfowindow;
// Constructor creates a new map
function initMap() {
    map = new google.maps.Map(document.getElementById("my_map"), {
        center: {lat: 30.048484, lng: 31.225000},
        zoom: 13,
        mapTypeControl: false
    });

    // Create blank infowindow with max width of 370
    locationInfowindow = new google.maps.InfoWindow({maxWidth: 370});
    var i = 0;
    // The following group uses the location array to create an array of markers on initialize.
    nearbyPlaces.forEach(function(listItem) {
        // Get the position, placeName & description from the nearbyPlaces array.
        var position = listItem.location;
        var placeName = listItem.placeName;
        var description = listItem.description;
        console.log(placeName);
        // create message to appear on each infowindow
        // according to the marker selected
        var contentString = "<div id='content'>"+
            "<h4 id='firstHeading' class='firstHeading'>"+ placeName + "</h4>"+
            "<div id='bodyContent'>"+
            "<p>" + description + " </p>"+
            "</div>"+
            "</div>";
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            placeName: placeName,
            description: contentString,
            animation: google.maps.Animation.DROP,
            id: i++
        });
        // Push the marker to markers array.
        markers.push(marker);
        // Create an onclick event to each marker to open an infowindow
        createClickEvent(marker, locationInfowindow);

    });
    // Display all markers on page load
    showListings();
}


// Marker click event
function createClickEvent(marker, locationInfowindow){
    marker.addListener("click", function() {
        populateInfoWindow(this, locationInfowindow);
    });
}

// Play animation to a marker when it is clicked
// or when a place in the list is selected
function animate(marker){
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
    setTimeout(function(){ marker.setAnimation(null); }, 1400);
}

// Stop marker animation
function stopAnimation(marker){
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    }
}

// This function populates the infowindow when the marker is clicked.
// it allows only one infowindow to open at a time
// and populate based on clicked marker's position.
function populateInfoWindow(marker, infowindow) {
    // Check whether this marker's infowindow is opened or not
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        animate(marker);
        console.log(marker.placeName);
        $.getJSON(filcker+marker.placeName+"&jsoncallback=?",function(data){
            var photo = null;
            if(data.photos.photo[0] !== null){
                console.log(data.photos.photo[0].id);
                photo = data.photos.photo[0];
                // Create opened infowindow's content
                // using the selected photo from flicker api
                // and place description
                infowindow.setContent(
                    "<img src="+"https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" +
                    photo.id + "_" + photo.secret + ".jpg" + " class='place-img'>"+
                    marker.description
                );
            }else {
                // when no photo found on flicker
                // display this message in the infowindow
                infowindow.setContent(
                    "<div>No photo found</div>" +
                    marker.description
                    );

            }
            // open infowindow
            infowindow.open(map, marker);
        }).done(function(){console.log("Done");})
        .fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
            console.log( "error" );
            alert("An error has occured with flickr's api, please refresh the page or try again later!");
        })
        .always(function() {
            console.log( "complete" );
        });

      // clear marker whem infowindow is closed.
      infowindow.addListener("closeclick", function() {
        infowindow.marker = null;
        stopAnimation(marker);
      });
    }
}

// Display all markers on map
function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    markers.forEach(function(marker) {
        marker.setMap(map);
        bounds.extend(marker.position);
    });
    google.maps.event.addDomListener(window, "resize", function() {
        map.fitBounds(bounds);
    });
}

// Map api call fail
function mapFail(){
     document.getElementById("my_map").innerHTML = "<p class='text-center'>Google maps API could not be loaded!</p>";
}

// Add only clicked place's marker to map
var newPlace = function(data){
    this.name = ko.observable(data.placeName);
    this.nameClicked = function(clickedData){
        markers.forEach(function(marker) {
            if (marker.placeName.toLowerCase().startsWith(clickedData.name().toLowerCase())) {
                marker.setVisible(true);
                populateInfoWindow(marker, locationInfowindow);
                viewModel.Query(marker.placeName);
            }else{
                marker.setVisible(false);
            }
        });
    };
};

// x button clears input
this.clearInput = function(){
    viewModel.Query("");
};

// create viewModel with KO
var viewModel = {
    places:[]
};

nearbyPlaces.forEach(function(nearbyPlace) {
    viewModel.places.push(new newPlace(nearbyPlace));
});


viewModel.Query = ko.observable("");

// Display search result markers on map
viewModel.searchResults = ko.computed(function() {
    var q = viewModel.Query();
    console.log(q);
    for(var i = 0; i < markers.length; i++){
        if (markers[i].placeName.toLowerCase().indexOf(q.toLowerCase()) >= 0) {
            markers[i].setVisible(true);
        }else{
            markers[i].setVisible(false);
        }
    }
    return viewModel.places.filter(function(i) {
        return i.name().toLowerCase().indexOf(q.toLowerCase()) >= 0;
    });
});

// apply all bindings
ko.applyBindings(viewModel);


// places list open/hide events

$("#search-input").mouseenter(function(){
    $("#search-input").focusin(function(){
        $(".bd-search-results").css("display", "block");
    });
});

$("#search-input").focusout(function(){
    $(".bd-search-results").mouseleave(function(){
        $(".bd-search-results").css("display", "none");
    });
});