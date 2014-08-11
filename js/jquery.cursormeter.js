/**
 * jQuery cursormeter
 * plugin for measuring distance travelled by a mouse cursor
 * 	
 * == usage: == 
 * var odometer = $.odometer(options);
 * 
 * odometer.data() will return object in following format: 
 * x - distance travelled in x axis
 * y - the same in y
 * total - total distance in pixels
 * ratio - how many pixels in one cm
 * 
 * odometer.destroy() will return data in the same format and remove binding and interval (stopping plugin functionality).
 * 
 * == options are: ==
 * currDistSelector - jQuery selector for element with current total distance
 * refreshRate - integer how precise measuremnt should be (1 = 100 miliseconds)
 * 
 * == Compatibility ==
 * Works only with WebKit version of Opera
 * 
 * Greetz to Adrian Ligiewicz "Siusiak" who tested this with me :)
 */

(function($) {
	var
	// @var currentMousePos object cursor position
		currentMousePos = {x: -1, y: -1},
	// @var previousMousePos object cursor position
		previousMousePos = {x: null, y: null},
	// @var interval resource 
		interval = null,
	// @var pixelRatio integer
		pixelRatio,
	// @var distanceX integer x-axis distance travelled in pixels
		distanceX = 0,
	// @var distanceY integer y-axis distance travelled in pixels 
		distanceY = 0,
	// @var totalDistance float total distance travelled in this session (in centimeters)
		totalDistance = 0,
	// @var globalDistance float total distance travelled global (in centimeters)
		globalDistance = 0,
	// @var $cointainer jQuery object 
		$container,
	// @var $containerTotal jQuery object
		$containerTotal,
	// options
		options;
	
	// Units converter
	function autoUnitsConverter(distanceInCm) {
		// centimeters
		if(distanceInCm < 100) {
			return unitsBase(distanceInCm, 'cm') + ' cm';
		}
		// meters
		else if(distanceInCm < 10000) {
			return unitsBase(distanceInCm, 'm') + ' m';
		}
		// kilometers
		else {
			return unitsBase(distanceInCm, 'km') + ' km';
		}
	}
	// units base
	function unitsBase(distanceInCm, unit) {
		var result;
		switch(unit) {
			case 'cm':
				result = Math.round(distanceInCm * 100) / 100; 
				break;
			case 'm':
				distanceInMetres = distanceInCm / 100;
				result = Math.round(distanceInMetres * 100) / 100;
				break;
			case 'km':
				var distanceInKilometers = distanceInCm / 10000;
				result = Math.round(distanceInKilometers * 100) / 100;							
		}
		
		return result.toFixed(2); 
	}
	// return data object
	function returnData() {
		// return all data in centimeters
		return {
				x: distanceX / pixelRatio, 
				y: distanceY / pixelRatio, 
				ratio: pixelRatio,
				total: totalDistance // total distance for this session in centimeters
			};
	}
	// upload results
	function uploadResults() {
		
	}
	// Refresh distance data
	function refresh() {
		// refresh cursor position 
		$(document).one("mousemove", function (event) {
		    currentMousePos.x = event.pageX;
		    currentMousePos.y = event.pageY;
		});	
		
		// hack to protect from bad first value
	    if (currentMousePos.x == -1) {
	        return;
	    }
		
		// init variables
	    if (previousMousePos.x == null && previousMousePos.y == null) {
	        previousMousePos.x = currentMousePos.x;
	        previousMousePos.y = currentMousePos.y;
	        return;
	    }
	    // skip on no mouse movement
	    else if(previousMousePos.x == currentMousePos.x && previousMousePos.y == currentMousePos.y) {
	    	return;
	    }
	    
	    // recalculate x distance if cursor pos changed
	    if(currentMousePos.x != previousMousePos.x) {
	    	distanceX += Math.abs(currentMousePos.x - previousMousePos.x);
	    	previousMousePos.x = currentMousePos.x;
	    }
	    // recalculate y distance if cursor pos changed
	    if(currentMousePos.y != previousMousePos.y) {
	    	distanceY += Math.abs(currentMousePos.y - previousMousePos.y);
	    	previousMousePos.y = currentMousePos.y;
	    }    	
	    
	    // sum distances
	    totalDistance = (distanceY + distanceX) / pixelRatio;
	    
	    // set container text
	    if(options.autoUnitsConverter) {
	    	$container.text(autoUnitsConverter(totalDistance));
	    } 
	    else {
	    	// callback
		    if(jQuery.isFunction(options.converter)) {
		    	$container.text(options.converter(unitsBase(totalDistance, options.unitsBase)));
		    }
		    else {
	    		$container.text(unitsBase(totalDistance, options.unitsBase));		    	
		    } 
	    }
	    
	    
	    // refresh global distance
	    if($containerTotal) {
	    	tmpDst = globalDistance + totalDistance;
	    	
	    	// check if units conversion is enabled
	    	if(options.autoUnitsConverter) {
	    		$containerTotal.text(autoUnitsConverter(tmpDst));
	    	}
	    	else {
	    		if(jQuery.isFunction(options.converter)) {
	    			$containerTotal.text(options.converter(unitsBase(tmpDst, options.unitsBase)));
	    		}
	    		else {
	    			$containerTotal.text(unitsBase(tmpDst, options.unitsBase));
	    		}
	    		
	    	}
	    }
	    
	    // callback
	    if(jQuery.isFunction(options.onUpdate)) {
	    	options.onUpdate();
	    }
	}		
	// init function
	function init() {
		// calculate centimeter to pixel ratio
			// @var $tmp object temp jquery object just to calculate pixel ratio
		var $tmp = $('<div>').css({
		    width: '1cm',
		    padding: '0',
		    margin: '0'
		}).appendTo('body'),
			// @var timeout integer based on a digit from 1 to 10 (100 miliseconds to 1 second)
			timeout = options.refreshRate * 100;
		
		$container = $(options.currDistSelector).text('0');
		
		// @var cmToPx integer how many px in one centimeter 
		pixelRatio = $tmp.width();	
		
		// remove temporary element
		$tmp.remove();	
		
		// reset coordinates when cursor leaves browser area
		$(document).on("mouseleave", function (event) {
		    currentMousePos = {x: -1, y: -1};
	        previousMousePos = {x: null, y: null};    
	        
	        // pause plugin when mouse leaves workarea
	        clearInterval(interval);
		}).on("mouseenter", function(event) {
			// resume plugin
			interval = setInterval(function() { refresh(); }, timeout);
		});
		
		// enable total distance counter
		if(options.updateUrl != null) {
			// prepare container
			$containerTotal = $(options.totalDistSelector).text('0');
			
			// grab initial stats from url
			$.ajax({
				url: options.updateUrl,
				type: "POST",
				data: {action: "get"},
				dataType: "json"
			}).done(function(data) {
				globalDistance = data.globalDistance;
				if(options.autoUnitsConverter) {
					$containerTotal.text(autoUnitsConverter(globalDistance));
				}
				else {
					if(jQuery.isFunction(options.converter)) {
						$containerTotal.text(options.converter(unitsBase(globalDistance, options.unitsBase)));
					} 
					else {
						$containerTotal.text(unitsBase(globalDistance, options.unitsBase));
					}
					
				}
			});
			
			// bind window close event
			$(window).on('beforeunload', function() {
				var data = $.extend({}, returnData(), {action: "put"});
				
				// send stats
				$.ajax({
					url: options.updateUrl,
					type: "POST",
					data: data,
					dataType: "json",
					async: false
				});
			});		
		}
		
		// set interval for refresh function
		interval = setInterval(function() { refresh(); }, timeout);
	}
	// disable odometer
	function destroy() {
		$(document).unbind('mousemove mouseleave mouseenter');
		$(window).unbind('beforeunload');
		window.clearInterval(interval);
		return returnData();
	}
	
	$.cursorMeter = function(params) { // Here we sure $ is jQuery
		var defaults = {
				currDistSelector: '#current-distance',
				totalDistSelector: '#total-distance',
				refreshRate: 1,
				updateUrl: null,
				autoUnitsConverter: true,
				onUpdate: null,
				converter: null,
				unitsBase: 'cm'
			};
		
		// @var opts object options extended by user input
		options = $.extend({}, defaults, params);
		
		// init function
		init();
		
		// return control interface
		return {
			destroy: function() {
				return destroy();
			},
			data: function() {
				return returnData();
			}
		} 
	}
})(jQuery);