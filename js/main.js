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

// Event listeners for build route page
// Need to use event delegation because they get built as selected
// try if/then statements to check the class name and do something different depending on which select is used
$('#buildRoute').on('change', 'select', function(e) {
	// get class name of select
	var clickedSelect = this.className;
	// if route is changed, do the route stuff
	if (clickedSelect === 'route') {
		// see what type of route it is to call right api
		var routeType = $(this).find(':selected').attr('data-route-type');
		// get the value of the selection. store in variable...or object? to get it ready to send off to firebase
		var selectedRoute = $(this).val();
		var directionsList = [];

		// use value of selection to send ajax request to API to return possible directions.
		if (routeType === 'train') {
			var elStopPromise = getElStops();
			// I DON'T NEED TO DO ANY OF THIS. I MISSED THAT I CAN ADD A URL PARAMETER
			// TO THE REQUEST FOR THE ROUTES. IT MIGHT BE A BETTER WAY TO DO IT
			// THE OTHER POSSIBILITY IS TO GET IT ONCE, BUT NOT RUN IT ON CHANGE.
			// AND KEEP THE DATA IN A VARIABLE WHILE ON THIS PAGE.
			elStopPromise.done(function(data) {
				// selected route = color code = object property
				trainDirectionsList = [];
				// loop through response
				for (var i = 0; i < data.length; i++) {
					if (data[i][selectedRoute] === true) {
						var trainStation = data[i].station_descriptive_name;
						var trainStationId = data[i].map_id;
						// put stop names in array
						trainDirectionsList.push('<option value=' + trainStationId + '>' + trainStation + '</option>');
					}
				}
				// stackoverflow copy/paste way to remove duplicates from array with jquery
				$.each(trainDirectionsList, function(i, el){
					if($.inArray(el, directionsList) === -1) directionsList.push(el);
				});
				// build the station select and place it on the page
				createSelect('station', directionsList, '#buildRoute');
			});
		} else if (routeType === 'bus') {
			var busStopPromise = getBusInfo('getdirections','&rt=' + selectedRoute,'');
			busStopPromise.done(function(data) {
				var directionsArray = data['bustime-response'].directions;

				for (var i = 0; i < directionsArray.length; i++) {
					var direction = directionsArray[i].dir;
					directionsList.push('<option value=' + direction + '>' + direction + ' </option>');
				}

				createSelect('direction', directionsList, '#buildRoute');
			});
		} else {alert('missing data-route-type!')}

	// Build Select Direction
		// Use JSON results to add options to select
		// add select to page
	} else if (clickedSelect === 'put a different select option here') {}
});

	// creates the select in the DOM, appends the route list and adds select to the page.
	function createSelect(name, selectOptions, location) {
		// create the option list
		var optionList = '<option value="" disabled selected>Select your ' + name + '</option>' + selectOptions.join("");

		// check if the select already exists on the page, if so append new options to it, if not create it.
		if ( $(location).find('select').hasClass(name) ) {
			console.log(location + ' has ' + name)
			$('select[class=' + name + ']').html(optionList);
		} else {
			var select = document.createElement('select');
			select.setAttribute('class', name);
			$(select).append(optionList);
			$(location).append(select);
		}
	}


// 		if ( $('.chooseBus select.directions').length === 0 ) {
// 		var select = document.createElement('select');
// 		select.setAttribute('class', 'directions');
// 		$('.chooseBus').append(select);
// 	}
// 	$('select.directions').html('<option value="" disabled selected>Select your direction</option>' + directionsList.join(""));
// }

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

// VIEW TRIP PAGE FUNCTIONALITY
	// viewTrip function (called from UL LI event handler)
		// Get name or ID of clicked LI
		// getRoutes function - Draw viewTrip page/section to screen
			// Request data about that trip from firebase
			// Use JSON data to draw trip outlines to page
				// put the right number of stops in order, right to left
				// put the right icon at each stop, bus or train
				// put the right icon between stops, riding or waiting
		// getRouteTimes function - Get arrival times for the stops in the routes in JSON object
			// Send AJAX request to CTA tracker bus API and train API
				// Include all routes w/ stops & directions from the JSON returned by firebase
				// Parse the JSON object into a JS object?
				// Push the returned arrival times AND bus numbers into the newly created JS object?
				// format inside the stop object:
					// "arrivalTimes" : [
					// 	{"routeNumber" : "7263", "arrivalTime" : "11:59"},
					// 	{"routeNumber" : "8293", "arrivalTime" : "12:15"}, 
					// 	{etc}
					// ]
			// drawRouteTimes function - Go to newly created JS object that has arrival times and put them in template
				// Go loop through routes looping through stops
					// In first stop object, get first arrivalTimes object arrivalTime, set it to first stop in visual
					// Go to second stop object, get matching routeNumber arrivalTime, set it to next stop in visual
					// Go to third stop, get the first arrival time that is AFTER the second stop arrival time and set to next stop in visual
					// Go to fourth stop, get matching routeNumber arrivalTime and set it to next stop
					// Repeat 3-4 until no more stops
				// repeat loop through routes, until no more routes

		// Back button event handler (on click, go to home, re-run on homepage load function)
		// Plus button event handler (on click, go to buildRoute page)

































