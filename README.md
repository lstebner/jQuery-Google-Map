# Google Map jQuery Plugin

## Description

This plugin makes creating maps from the Google API V3 easier with the help of jQuery. It implements 
the basic features of displaying a map along with the ability to retrieve directions. 

## Requirements
- jQuery
- Google Maps API to be loaded (http://maps.google.com/maps/api/js?sensor=set_to_true_or_false)

## Options

````
- address: A text representation of an address (slower than passing lat/lon directly)

- latitude: The latitude to center the map on

- longitude: The longitude to center the map on 

- width: The width to give the map 
	- defaults to the elements width

-height: The height of the map
	- defaults to the elements height

zoom: Zoom level for the map (integer, default 13)
	- Higher number = closer zoom

mapType: The map type (default 'roadmap')
	- Types: roadmap | satellite | hybrid | terrain

marker: Whether a marker should be added or not (bool)

markerTitle: The title to apply to the marker (as a tooltip)

markerClick: Callback for when the marker is clicked

infoBubble: Whether or not to display the info bubble (bool)

infoBubbleContent: A string of content to put in the info bubble (can be full HTML)

autoOpenInfo: If the info bubble should be opened immediately or not (bool)

directions: An object containing info for providing directions

showSteps: Whether or not the steps for the directions should be displayed (bool, default: true)
     	   container: The ID of the container to put rendered directions into
     	   from: The starting location for the directions
			  - Can be an address, latlng object or 'marker' to use the maps marker loc
     	   to: The ending location for the directions
		      - Can be an address, latlng object or 'marker' to use the maps marker loc
     	   travelMode: The travel mode to pass when getting directions (default 'driving')
			  - Types: driving | walking | biking
     	
data: Nothing should be passed as 'data' into this plugin. This area of the settings is
	  used to store objects such as the map and geocoder.
````

## Methods
````
- getMap: Get the map object with all of the settings

- marker: Set up the marker with the map settings

- markerClick: Marker click action, by default opens the info bubble (if there is one)
			   and looks for callback

- infoBubble: Set up the info bubble

- getDirections({ from:'address', to:'address' }): Get directions from/to somewhere
````

## Credit
2011 - Created by Luke Stebner. Feel free to use publicly, just remember giving credit is
worth good karma :D