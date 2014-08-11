window.odometerOptions = {
  auto: false, // Don't automatically initialize everything with class 'odometer'
  selector: '.distance-container', // Change the selector used to automatically find things to be animated
  format: '(ddd).dd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
  duration: 3000, // Change how long the javascript expects the CSS animation to take
  theme: 'car', // Specify the theme (if you have more than one theme css file on the page)
 //  animation: 'count' // Count is a simpler animation method which just increments the value,
                     // use it when you're looking for something more subtle.
};

$.SyntaxHighlighter.init();
$(function() {
	// distance meter
	var cursorMeter  = $.cursorMeter({
		updateUrl: 'php/odometer.php', 
		autoUnitsConverter: false, 
		unitsBase: 'm'});
		
		
	var current = new Odometer({
  		el: $('#current-distance').get(0),
	});
	
	var total = new Odometer({
  		el: $('#total-distance').get(0),
	});
});