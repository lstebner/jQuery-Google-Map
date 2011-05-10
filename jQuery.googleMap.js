(function($){
	/**
	*	This plugin makes createing maps from the Google API V3 easier with the help of jQuery. It implements 
	* 	the basic features of displaying a map along with the ability to retrieve directions. 
	*
	* 	Requires jQuery (http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js)
	*	Requires the API to be loaded (http://maps.google.com/maps/api/js?sensor=set_to_true_or_false)
	*
	*	Options:
	*		address: A text representation of an address (slower than passing lat/lon directly)
	*
	*		latitude: The latitude to center the map on
	*
	*		longitude: The longitude to center the map on 
	*
	*   	width: The width to give the map 
	*			- defaults to the elements width
	*
	*   	height: The height of the map
	*			- defaults to the elements height
	*
	*   	zoom: Zoom level for the map (integer, default 13)
	*			- Higher number = closer zoom
	*
	*   	mapType: The map type (default 'roadmap')
	*			- Types: roadmap | satellite | hybrid | terrain
	*
	*   	marker: Whether a marker should be added or not (bool)
	*
	*   	markerTitle: The title to apply to the marker (as a tooltip)
	*
	*   	markerClick: Callback for when the marker is clicked
	*
	*   	infoBubble: Whether or not to display the info bubble (bool)
	*
	*   	infoBubbleContent: A string of content to put in the info bubble (can be full HTML)
	*
       *   	autoOpenInfo: If the info bubble should be opened immediately or not (bool)
	*
       *   	directions: An object containing info for providing directions
	*			showSteps: Whether or not the steps for the directions should be displayed (bool, default: true)
       *   	    container: The ID of the container to put rendered directions into
       *   	    from: The starting location for the directions
	*				- Can be an address, latlng object or 'marker' to use the maps marker loc
       *   	    to: The ending location for the directions
	*				- Can be an address, latlng object or 'marker' to use the maps marker loc
       *   	    travelMode: The travel mode to pass when getting directions (default 'driving')
	* 				- Types: driving | walking | biking
       *   	
	*   	data: Nothing should be passed as 'data' into this plugin. This area of the settings is
	* 			used to store objects such as the map and geocoder.
	*
	*
	*	Methods:
	*		- getMap: Get the map object with all of the settings
	*
	*		- marker: Set up the marker with the map settings
	*
	*		- markerClick: Marker click action, by default opens the info bubble (if there is one)
	*						and looks for callback
	*
	*		- infoBubble: Set up the info bubble
	*
	*		- getDirections({ from:'address', to:'address' }): Get directions from/to somewhere
	*
	*
	*/
	$.fn.googleMap = function(opts, args){
		if (!opts){ opts = {}; }
		var $self = this;
		
		//all of the available options
		var defaults = {
			address: '',
			latitude:0,
			longitude:0,
			width: $self.css('width').replace('px', ''),
			height: $self.css('height').replace('px', ''),
			zoom:13,
			mapType: 'roadmap',
			marker: true,
			markerTitle: '',
			markerClick: null,
			infoBubble: false,
			infoBubbleContent: '',
            autoOpenInfo: true,
			//directions specific options are stored in their own object to make accessing
			//them more intuitive in the code
            directions: {
				showSteps: true,
                container: '',
                from: 'marker',
                to: 'marker',
                travelMode: 'driving'
            },
			//these things shouldn't be passed into the map, but they are stored here so that
			//they will get stored in the .data() call. These are the google api objects
			data: {
				geocoder: null,
			    latlng: null,
    		    map: null,
    		    marker: null,
    		    infoBubble: null,
    		    directionsDisplay: null,
				directionsService: null,
    		    mapOptions: {}
			}
		};
		
		//look for stored settings
		var settings = this.data('googleMap');
		
		//methods
		var methods = {
			//initialize
			init: function(){
				settings = defaults;
				methods.updateSettings(opts);
				
				methods.getMap();
			},
			//update settings
			updateSettings: function(newSettings){
				settings = $.extend(true, settings, newSettings);
				$self.data('googleMap', settings);
			},
			//the big one, get the map
			getMap: function(map_args){
				//update settings if anything new was passed in
			    if (map_args){
			        methods.updateSettings(map_args);
			    }

				//attempt to first use a text string address
				if (settings.address){
					//addresses must be geocoded because they're useless as text strings
					if (!settings.data.geocoder){
						settings.data.geocoder = new google.maps.Geocoder();
					}
					
					//do geocode request
					settings.data.geocoder.geocode({ address:settings.address }, function(results, status){
						if (status == google.maps.GeocoderStatus.OK){
							//set up the map with the found location
							settings.data.map.setCenter( results[0].geometry.location );
							//set up the map marker
							if (settings.marker){
								methods.marker( results[0].geometry.location );
							}
						}
						//TODO: errors...
					});
				}
				//otherwise set up the latlng object (much faster btw)
				else{
			    	settings.data.latlng = new google.maps.LatLng(settings.latitude, settings.longitude);
				}

				//default the map type
                var mapType = google.maps.MapTypeId.ROADMAP;
				//use the requested map type if it's legal
                if (settings.mapType.toUpperCase() in google.maps.MapTypeId){
                    mapType = google.maps.MapTypeId[ settings.mapType.toUpperCase() ];
                }

				//set up the map options for the request
                settings.data.mapOptions = {
					zoom: settings.zoom,
					center: settings.data.latlng,
					mapTypeId: mapType
                };

				//request the map
                settings.data.map = new google.maps.Map(document.getElementById( $self.attr('id') ), settings.data.mapOptions);

				//if a marker was requested and there is latlng available, then set up that marker now
				//note* if a text address was used, that marker is requested above in the geocoder callback
                if (settings.marker && settings.data.latlng){
					methods.marker( settings.data.latlng );
                }
				
				//set up the info bubble if requested
                if (settings.infoBubble){
                    methods.infoBubble();
                }

				//call update settings again with all the data objects in place now
                methods.updateSettings( settings );
			},
			//display a marker
			marker: function(pos){
				//if no position was passed, try to use the latlng data
				if (!pos && settings.data.latlng){
					pos = settings.data.latlng;
				}
				
				//request the marker
				settings.data.marker = new google.maps.Marker({
                        position: pos,
                        map: settings.data.map, 
                        title: settings.markerTitle
                   });
				
				//add a click event to the marker
                   google.maps.event.addListener(settings.data.marker, 'click', function(){ methods.markerClick(); });
			},
			//click event on marker
			markerClick: function(){
				//open up the info bubble if using one
				if (settings.infoBubble){
			    	settings.data.infoBubble.open( settings.data.map, settings.data.marker );
				}

				//check for custom markerClick callback
			    if ( settings.markerClick ){
			        settings.markerClick();
			    }
			},
			//get directions
			getDirections: function(args){
				//update settings if new ones were passed in
			    if (args){ 
			        methods.updateSettings({ directions:args }); 
			    }
				
				//create directions service
				settings.data.directionsService = new google.maps.DirectionsService();
				
				//set display area if not already set
			    if (!settings.data.directionsDisplay){
			        settings.data.directionsDisplay = new google.maps.DirectionsRenderer();
			        settings.data.directionsDisplay.setMap( settings.data.map );
			    }
			
				//set up where to display the directions steps if requested
				if (settings.directions.showSteps){
			    	settings.data.directionsDisplay.setPanel( document.getElementById(settings.directions.container) );
				}

				//default travel mode
			    var mode = google.maps.TravelMode.DRIVING;
				//use the requested travel mode if it is valid
			    if (settings.directions.travelMode.toUpperCase() in google.maps.TravelMode){
			        mode = google.maps.TravelMode[ settings.directions.travelMode.toUpperCase() ];
			    }
				
				//use the existing latlng value if either 'to' or 'from' is set to use the marker
				if (settings.directions.from == 'marker'){
					settings.directions.from = settings.data.latlng;
				}
				else if (settings.directions.to == 'marker'){
					settings.directions.to = settings.data.latlng;
				}
				
				//set up the directions request
			    var request = {
                    origin: settings.directions.from,
                    destination: settings.directions.to,
                    travelMode: mode
                };
				
				//request the directions
                settings.data.directionsService.route(request, function(result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        settings.data.directionsDisplay.setDirections(result);
                    }
                });

				//update settings with new directions stuff
				methods.updateSettings(settings);
			},
			//set up the info bubble
			infoBubble: function(args){
			    if (args){
			        methods.updateSettings(args);
			    }

                settings.data.infoBubble = new google.maps.InfoWindow({
                    content: settings.infoBubbleContent
                });

				if (settings.autoOpenInfo){
					settings.data.infoBubble.open( settings.data.map, settings.data.marker );
				}

				//update settings with info bubble
				methods.updateSettings(settings);
			}
		};

		//check for straight method call
		if (typeof(opts) == 'string'){
			if (opts in methods){
				methods[opts](args);
			}

			return $self;
		}
		
		//make sure google stuff is loaded before init
		if (typeof(google) != 'undefined'){
			methods.init(opts);
		}

		return $self;
	}
})(jQuery);