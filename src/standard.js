/*
	Create & Read Cookie
	--------------------
	http://www.w3schools.com/js/js_cookies.asp
	
	Delete Cookie
	-------------
	http://javascript.about.com/library/bldelck.htm
*/
function bake(c_name, value, exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
}
function cookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g,"");
		if (x == c_name) {
			return unescape(y);
		}
	}
}
function eatcookie(name) {
	document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
}
function htmlescape(text) {
	var m = text.toString();
	if(m.length > 0) {
		return m.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\"/g, '&quot;');
	}
	else {
		return "";
	}
}
function htmlesc(text) {
	var m = text.toString();
	if(m.length > 0) {
		return m.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
	}
	else {
		return "";
	}
}

/*http://www.zachstronaut.com/posts/2009/02/17/animate-css-transforms-firefox-webkit.html*/
function el(id) {
	return document.getElementById(id);
}
function transformProp(element) {
	// Note that in some versions of IE9 it is critical that
	// msTransform appear in this list before MozTransform
	var properties = [
		'transform',
		'WebkitTransform',
		'msTransform',
		'MozTransform',
		'OTransform'
	];
	var p;
	while (p = properties.shift()) {
		if (typeof element.style[p] != 'undefined') {
			return p;
		}
	}
	return false;
}
function rotate(divid, amount) {
	el(divid).style.webkitTransform = 'rotate(' + amount + 'deg)';
	el(divid).style.mozTransform = 'rotate(' + amount + 'deg)';
	el(divid).style.oTransform = 'rotate(' + amount + 'deg)';
	el(divid).style.transform = 'rotate(' + amount + 'deg)';
}
function rotam(divid) {
	return el(divid).style[transformProp(el(divid))].replace('rotate(', '').replace('deg)', '');
}
function newurl(url) {
	window.history.pushState({}, "", url);
}
/*http://play.pokemonshowdown.com/sim.js*/
function messageSanitize(str) {
	return htmlesc(str).replace(/(https?\:\/\/[a-z0-9-.]+(\/([^\s]*[^\s?.,])?)?|[a-z0-9]([a-z0-9-\.]*[a-z0-9])?\.(com|org|net|edu|tk)((\/([^\s]*[^\s?.,])?)?|\b))/ig, '<a href="$1" target="_blank">$1</a>').replace(/<a href="([a-z]*[^a-z:])/g, '<a href="http://$1').replace(/(\bgoogle ?\[([^\]<]+)\])/ig, '<a href="http://www.google.com/search?ie=UTF-8&q=$2" target="_blank">$1</a>').replace(/(\bgl ?\[([^\]<]+)\])/ig, '<a href="http://www.google.com/search?ie=UTF-8&btnI&q=$2" target="_blank">$1</a>').replace(/(\bwiki ?\[([^\]<]+)\])/ig, '<a href="http://en.wikipedia.org/w/index.php?title=Special:Search&search=$2" target="_blank">$1</a>').replace(/\[\[([^< ]([^<`]*?[^< ])?)\]\]/ig, '<a href="http://www.google.com/search?ie=UTF-8&btnI&q=$1" target="_blank">$1</a>');
}