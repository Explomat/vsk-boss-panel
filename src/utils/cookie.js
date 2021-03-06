export const setCookie = function(name, value, expiracy) {
	var exdate = new Date();
	exdate.setTime(exdate.getTime() + expiracy * 1000);
	var c_value = escape(value) + ((expiracy == null) ? '' : '; expires=' + exdate.toUTCString());
	document.cookie = name + '=' + c_value + '; path=/';
};

export const getCookie = function(name) {
	var i, x, y, ARRcookies = document.cookie.split(';');
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
		x = x.replace(/^\s+|\s+$/g, '');
		if (x == name) {
			return y ? decodeURI(unescape(y.replace(/\+/g, ' '))) : y; //;//unescape(decodeURI(y));
		}
	}
};