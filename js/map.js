
var map;
// Use flicker.com api
var filcker = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=306d8113632c74aeb2a02482dc3a909d&format=json&text=";

// Chosen places that will appear on map
// Those places are selected in Cairo, Egypt
var nearby_places = [
	{
		place_name: 'Al-Ahly Sporting Club',
	 	location: {lat: 30.048484, lng:  31.222244},
	 	description: 'Al Ahly Sporting Club, is an Egyptian sports club based in Cairo,' +
		' Egypt. It is best known for its professional football team, ' +
		'which plays in the Egyptian Premier League, the top tier in ' +
		'the Egyptian football league system.'
 	},
	{
		place_name: 'Cairo Tower',
		location: {lat: 30.045930, lng: 31.224250},
		description: 'The Cairo Tower - commonly known to locals' +
		' as "Nasser\'s Pineapple" - is a free-standing concrete' +
		' tower located in Cairo, Egypt. At 187 m, it has been the' +
		' tallest structure in Egypt and North Africa for about 50 years.'
	},
	{
		place_name: 'El sawy Culture Wheel', 
		location: {lat: 30.061957, lng: 31.217200},
		description: 'El Sawy Culture Wheel is an all-purpose, private' +
		' cultural center, located on Gezira Island in the Zamalek' +
		' district, central Cairo, Egypt. It is considered one of ' +
		'the most important cultural venues in Egypt.'
	},
	{
		place_name: 'Cairo Opera House', 
		location: {lat: 30.042779, lng: 31.224020},
		description: 'The Cairo Opera House, part of Cairo\'s' +
		' National Cultural Center, is the main performing arts' +
		' venue in the Egyptian capital.'
	},
	{
		place_name: 'Opera Metro Station', 
		location: {lat: 30.041842, lng: 31.225215},
		description: 'The Cairo Metro is the rapid transit system' +
		' in Greater Cairo, Egypt. It was the first of only two ...' +
		' As of 2014, the Cairo Metro has 61 stations (mostly At-grade),' +
		' of which 3 are transfer stations, with a total length of 77.9 kilometres'
	},
	{
		place_name: 'Tahrir Square', 
		location: {lat: 30.044261, lng: 31.235905},
		description: 'Tahrir Square also known as "Martyr Square",' +
		' is a major public town square in Downtown Cairo, Egypt.' +
		' The square has been the location and focus for political' +
		' demonstrations in Cairo, most notably those that led to ' +
		'the 2011 Egyptian revolution and the resignation of' +
		' President Hosni Mubarak.'
	},
	{
		place_name: 'Egyptian Museum', 
		location: {lat: 30.047855, lng: 31.233572},
		description: 'The Museum of Egyptian Antiquities, known' +
		' commonly as the Egyptian Museum or Museum of Cairo, in' +
		' Cairo, Egypt, is home to an extensive collection of' +
		' ancient Egyptian antiquities.'
	},
	{
		place_name: 'Sheraton Cairo Hotel & Casino',
		 location: {lat: 30.039232, lng: 31.220301},
		 description: 'On the bank of the Nile, the Sheraton' +
		 ' Cairo Hotel is minutes away from the Pyramids of' +
		 ' Giza and the Egyptian Museum. Book direct for best rates.'
	}
];


// Create a new blank array for all markers.
var markers = [];

// Constructor creates a new map
function initMap() {
	map = new google.maps.Map(document.getElementById('my_map'), {
		center: {lat: 30.048484, lng: 31.225000},
		zoom: 13,
		mapTypeControl: false
	});

	// Create blank infowindow with max width of 370
	var location_Infowindow = new google.maps.InfoWindow({maxWidth: 370});

	// The following group uses the location array to create an array of markers on initialize.
	for (var i = 0; i < nearby_places.length; i++) {
	  	// Get the position, place_name & description from the nearby_places array.
		var position = nearby_places[i].location;
	  	var place_name = nearby_places[i].place_name;
	  	var description = nearby_places[i].description;
	  	// create message to appear on each infowindow
	  	// according to the marker selected
	  	var contentString = '<div id="content">'+
			'<h4 id="firstHeading" class="firstHeading">'+ place_name + '</h4>'+
			'<div id="bodyContent">'+
			'<p>' + description + ' </p>'+
			'</div>'+
			'</div>';
	  	// Create a marker per location, and put into markers array.
	  	var marker = new google.maps.Marker({
		  	position: position,
		  	place_name: place_name,
		  	description: contentString,
		  	animation: google.maps.Animation.DROP,
		  	id: i
	  	});
	  	// Push the marker to markers array.
	  	markers.push(marker);
	  	// Create an onclick event to each marker to open an infowindow
	  	marker.addListener('click', function() {
	  		populateInfoWindow(this, location_Infowindow);
	  	});
	}
	// Display all markers on page load
	showListings();
}

// This function populates the infowindow when the marker is clicked.
// it allows only one infowindow to open at a time
// and populate based on clicked marker's position.
function populateInfoWindow(marker, infowindow) {
	// Check whether this marker's infowindow is opened or not
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		console.log(marker.place_name);  
		$.getJSON(filcker+marker.place_name+"&jsoncallback=?",function(data){
			var photo = null
			if(data.photos.photo[0] != null){
				console.log(data.photos.photo[0].id);
				photo = data.photos.photo[0];
				// Create opened infowindow's content
				// using the selected photo from flicker api
				// and place description
				infowindow.setContent(
					'<img src='+'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' +
					photo.id + '_' + photo.secret + '.jpg' + ' class="place-img">'+
					marker.description
				);
			}else {
				// when no photo found on flicker
				// display this message in the infowindow
				infowindow.setContent(
					'<div>'+"No photo found"+'</div' +
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
		})
		.always(function() {
			console.log( "complete" );
		});

	  // clear marker whem infowindow is closed.
	  infowindow.addListener('closeclick', function() {
	  	infowindow.marker = null;
	  });
	}
}

// Display all markers on map
function showListings() {
	var bounds = new google.maps.LatLngBounds();
  	// Extend the boundaries of the map for each marker and display the marker
  	for (var i = 0; i < markers.length; i++) {
	  	markers[i].setMap(map);
	  	bounds.extend(markers[i].position);
  	}
  	map.fitBounds(bounds);
}

// Add only clicked place's marker to map
var newPlace =function(data){
	this.name= ko.observable(data.place_name);
	this.nameClicked= function(clickedData){
		for(var i = 0; i < markers.length; i++){
			if (markers[i].place_name.toLowerCase().startsWith(clickedData.name().toLowerCase())) {
				markers[i].setMap(map);
			}else{
				markers[i].setMap(null);
			}
		}
	}
}

// create viewModel with KO
var viewModel = {
	places:[new newPlace(nearby_places[0]),
	new newPlace(nearby_places[1]),
	new newPlace(nearby_places[2]),
	new newPlace(nearby_places[3]),
	new newPlace(nearby_places[4]),
	new newPlace(nearby_places[5]),
	new newPlace(nearby_places[6]),
	new newPlace(nearby_places[7])
	]
};

viewModel.Query = ko.observable('');

// Display search result markers on map
viewModel.searchResults = ko.computed(function() {
	var q = viewModel.Query();
	console.log(q);
	for(var i = 0; i < markers.length; i++){
		if (markers[i].place_name.toLowerCase().indexOf(q.toLowerCase()) >= 0) {
			markers[i].setMap(map);
		}else{
			markers[i].setMap(null);
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

$(".dropdown-item").click(function(){
	var placeholder = $(this).text();
	$("#search-input").attr('placeholder', placeholder);
});

$("#search-input").focusout(function(){
	$(".bd-search-results").mouseleave(function(){
	    $(".bd-search-results").css("display", "none");
	});
});
