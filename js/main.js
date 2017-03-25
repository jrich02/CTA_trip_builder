// ON PAGE LOAD
// Initialize Firebase
var config = {
	apiKey: "AIzaSyAWKNLq7vL3lnWgZueUt18qzlVSaGdDrRk",
	authDomain: "cta-trip-builder.firebaseapp.com",
	databaseURL: "https://cta-trip-builder.firebaseio.com",
	storageBucket: "cta-trip-builder.appspot.com",
	messagingSenderId: "506852293966"
};
firebase.initializeApp(config);

// Connect to database
database = firebase.database();

// HOME PAGE FUNCTIONALITY
	// On load, Check the database for any created trips to display
	function getTrips() {
		database.ref('trips').on('value', function(results) {
			var allTrips = results.val();
			// check that allTrips has any value. if not display "haven't built" message
			if (!allTrips) {
				$('.noTrips').removeClass('hidden');
				$('.tripList').addClass('hidden');
			} else {
				$('.tripList').removeClass('hidden');
				$('.noTrips').addClass('hidden');
			}

		// if there are trips, display them below in an UL
			// loop through the trips in the JSON object
			// create 1 LI per trip item
			// from JSON, get name of trip, count how many routes are in trip

		});
	}
getTrips(); // run getTrips function every time page is loaded.


	//Three event handlers needed
		// 1. Plus button to create new trip (on click open addTrip section, close others)
	$('button.addTrip').on('click', function() {
		$('#addTrip').removeClass('hidden');
		$('#home, #viewTrip, #buildRoute').addClass('hidden');
	});
		// 2. UL LI of trips go to viewTrip view (run viewTrip function)
		// 3. Trashcan icon on UL LI of trips to run function to remove that (run function


// ADD TRIP PAGE FUNCTIONALITY (should this be wrapped in an outer function?)
	// Event handler for Cancel button on click
	$('.cancelNewTrip').on('click', function() {
		$('.tripName').val(''); // Clear out any text entered into input
		$('#addTrip').addClass('hidden'); // Hide/Remove all content in addTrip
		$('#home').removeClass('hidden'); // Display/Rerun JS? for home section
	});

	// Event handler for Build Routes button on click
	$('.buildRoutes').on('click', function() {
		var newRouteName = $('.newTripName').val(); // Get the value of the text input

		// if the value is empty. Display message "Please create a name for your new trip"
		if (!newRouteName) {
			alert('Please create a name for your new trip');
			// else get value. 
		} else {
			// Use value to create new trip entry in firebase
			// firebase structure would be to use key to nest underneath each part of structure
			// trips > routes > stops--list of info about stops
			var tripsReference = database.ref('trips');
			var tripKey = tripsReference.push({
					tripName: newRouteName
				});
			var tripKey = tripKey.key;
			console.log('tripKey= ' + tripKey);

			// Move to next page - buildRoute. Pass in name of route for buildRoute header
			buildRoutePageCreator(tripKey, newRouteName);
		}
	});


function getBusInfo(type, param1, param2) {
	var trackerURL = 'http://ctabustracker.com/bustime/api/v2/';
	var apiKey = '?key=eJUH5k4Qkb7EapXS4udaPSuGt';
	var dataFormat = '&format=json';
	var busPromise = $.ajax({
		type: 'GET',
		url: trackerURL + type + apiKey + param1 + param2 + dataFormat,
	});
	return busPromise;
}


function getTrainInfo(type, param1, param2, param3) {
	var trackerURL = 'http://lapi.transitchicago.com/api/1.0/';
	var apiKey = '?key=8832a51e6a514642ba4a6e3125ee3c74';
	var dataFormat = '&outputType=JSON';
	// var param1;
	// var param2;
	// var param3;
	// arrivals api: http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx
		// mapid, stpid, max, rt, key
	// follower api: http://lapi.transitchicago.com/api/1.0/ttfollow.aspx
		//runnumber, key
	// locations api: http://lapi.transitchicago.com/api/1.0/ttpositions.aspx
		//rt, key
	$.ajax({
		type: 'GET',
		url: trackerURL
	});
}


// need to pass in el color, get stops from there.
function getElStops() {
	var elStopAjaxCall = $.ajax({
		type: 'GET',
		url: 'https://data.cityofchicago.org/resource/8mj8-j3c4.json',
		// success: function(data) {
		// 	for (var i = 0; i < data.length; i++) {
		// 		console.log(data[i].station_name)
		// 	}
		// }
	});
	return elStopAjaxCall;

	// elStopAjaxCall.done(function(data) {
	// 		for (var i = 0; i < data.length; i++) {
	// 			console.log(data[i].station_name)
	// 		}
	// 	});
}


// BUILD ROUTE PAGE FUNCTIONALITY
function buildRoutePageCreator(tripKey, newRouteName) {
	// hide addTrip, show buildRoute.
	$('#addTrip').addClass('hidden');
	$('#buildRoute').removeClass('hidden');
	// put new route name in header for for build route section
	$('#buildRoute .pageTitle h1').text(newRouteName);

	// list of train routes. train names don't change. need code for api call
	var trainLines = [
		{stopCode:'red', stopName: 'Red Line'}, 
		{stopCode:'blue', stopName:'Blue Line'}, 
		{stopCode:'brn', stopName:'Brown Line'}, 
		{stopCode:'g', stopName:'Green Line'}, 
		{stopCode:'o', stopName:'Orange Line'}, 
		{stopCode:'p', stopName:'Purple Line'}, 
		{stopCode:'pnk', stopName:'Pink Line'}, 
		{stopCode:'y', stopName:'Yellow Line'}
	];

	var busPromise = getBusInfo('getroutes','',''); //get the list of bus routes. run function passing in right params.

	//gets the route data from the getroutes JSON and writes it to an array as select options.
	busPromise.done(function (data) {
		var routeList = []; // array for route select options
		// push trainlines to routeList
		for (var i = 0; i < trainLines.length; i++) {
			routeList.push('<option value=' + '"' + trainLines[i].stopCode + '"' + 'data-route-type="train">' + trainLines[i].stopName + '</option>');
		}

		var routesArray = data['bustime-response'].routes;
		for (var j = 0; j < routesArray.length; j++) {
			var routeName = routesArray[j].rtnm;
			var routeNumber = routesArray[j].rt;
			routeList.push('<option value=' + '"' + routeNumber + '"' + 'data-route-type="bus">' + routeNumber + ' ' + routeName + '</option>');
		}

		createSelect('route', routeList, '#buildRoute'); // create route select in dom
	});

}

	// Create DOM elements for 4 selects
		// 1. Select Route, this should be on page immediately
		// 2. Select Direction
		// 3. Select Stop
		// 4. Select Exit stop
	// Build Select route
		// Populate with route names returned from API
		// Draw select route to page.
	// Store selected route & get data for next selection (directions)
		// on change, get value of selection
		// store in variable...or object? to get it ready to send off to firebase
		// use value of selection to send ajax request to API to return possible directions
	// Build Select Direction
		// Use JSON results to add options to select
		// add select to page
	// Store selected direction & get data for next selection (stops)
		// on change get value
		// store value same place as route name to get ready to send off to firebase
		// use value of selection to send ajax request to API to retun possible stops
	// Build select stop
		// Use JSON results to add all stops on route in direction as select options
		// add select to the page
	// Store selected stop & get data for next selection (proceeding stops)
		// on change get value of selection
		// store value same place as route name & direction
		// future function (do calculation that will determine which stops come after selected in that direction)
	// Build select exit stop
		// Redraw select stop to page (future function would repopulate with only following stops)
	// Store selected stop
		// on change get value of selection
		// store value of selection with previous values
		// Draw "I'm Done" and "Add Transfer" buttons to the page

	// Event Listeners
		// Cancel Button on click - Clear out variable with any currently added data
		// Check referal "page"
			// IF viewTrip, return to viewTrip
			// IF addTrip,
				// Check tripName from addTrip
				// See if tripName has values in database
				// IF NOT, remove tripName entry from database
				// return to HOME
		// Add Transfer button on click
			// Send currently selected stop to the database
			// Create step 3 on the page
			// Create select, with same options from original Build Route
				// FUTURE: use google maps API, to check values of lat/long of all stops in entire system
				// Compare those values to lat/long of previous selected stop (step 2)
				// If distance is less than 1 mile, get associated route
				// remove all duplicate routes
				// populate select with these routes
				// draw select to page
			// on change of new select, repeat all steps above
		// I'm Done button on click
			// Send currently selected stop to the database
			// Proceed/Return to viewTrip page using current route name






























