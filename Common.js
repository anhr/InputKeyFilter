/**
 * Common Javascript code. I use it in my different projects
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: https://googledrive.com/host/0B5hS0tFSGjBZfkhKS1VobnFDTkJKR0tVamxadmlvTmItQ2pxVWR0WDZPdHZxM2hzS1J3ejQ/AboutMe/
 * source: https://github.com/anhr/InputKeyFilter https://github.com/anhr/ColorSelector
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2015 Andrej Hristoliubov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Revision:
 *  2015-07-01, : 
 *       + localization of the float value.
 *
 */

//http://jsfiddle.net/9zxvE/238/
var isOpera = false;
// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = false;   // Firefox 1.0+
var isSafari = false;
// At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = false;                          // Chrome 1+
var isIE = false;                            // At least IE6
var ieVersion = null;

isOpera = !!window.opera || navigator.userAgent.indexOf('Opera') >= 0;
// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
if(!isOpera){
	isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
	if(!isFirefox){
		isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		// At least Safari 3+: "[object HTMLElementConstructor]"
		if(!isSafari){
			isChrome = !!window.chrome;                          // Chrome 1+
			if(!isChrome){
				isIE = window.navigator.userAgent.indexOf('MSIE ') != -1;//false;                            // At least IE6
				
				//https://gist.github.com/jalbertbowden/5174156
				var ieMobile = /IEMobile\/(\d+\.?(\d+)?)/.exec( navigator.userAgent );
				ieMobile = ( !! window.ActiveXObject && ieMobile && (ieMobile.length >= 2) && +( ieMobile[1] ) ) || NaN;
				
				if(!isIE){
				
					if(isNaN(ieMobile)){
						var msg = "browser type not found\n\n" + window.navigator.userAgent;
						try
						{
							console.error(msg);
						} catch(e) {
							alert(msg);
						}
					}
					isIE = true;
				}
				if(isNaN(ieMobile))
					 ieVersion = ( !!window.ActiveXObject && +( /msie\s(\d+)/i.exec( navigator.userAgent )[1] ) ) || NaN;
				else ieVersion = ieMobile;
			}
		}
	}
}

function MessageElement(Message){
	var element = document.getElementById('Message');
	if(element == null)	{
		alert('ERROR: element Message == null. ' + Message);
		return;
	}
	if(element.innerHTML != Message)//Если я не буду делать эту проверку, то таблица ТВ каналов в Windows Phone IE будет шире экрана
	{
//consoleLog('Message: ' + Message);
	    element.innerHTML = Message + '<hr><div align="center"><input type="button" onclick="javascript: return MessageElement(\'\')" value="' + (isRussian() ? 'Закрыть' : 'Close') + '" style="margin-top:5px;" /></div>';
	    if (Message == "")
	        element.style.display = "none";
        else element.style.display = "block";
    }
}

var emailSubject = "Scoreboard error";
function ErrorMessage(message, emailMe, StackTrace){
	consoleError(message);
	if(StackTrace != false)
		message += '\n\n' + printStackTrace().join("nn");
	
	//http://www.htmlhelp.com/reference/html40/entities/special.html
	var body;
	if(emailMe != false){
		body = message;
		body = body.replace(/\n/g, "%0D%0A");
		body = body.replace(/ /g, "%20");
		body = body.replace(/"/g, "%22");
		body = body.replace(/&/g, "%26");
	}
	message = message.replace(/</g, '&lt;');
	message = message.replace(/>/g, '&gt;');
	
	message = message.replace(/\n/g, '<BR>');
	if(emailMe != false){
		//http://www.rapidtables.com/web/html/mailto.htm
		if(typeof myEmail == 'undefined')
			myEmail = "anhr@mail.ru";
		message += "<BR><BR><a href=\"mailto:" + myEmail + "?subject=" + emailSubject + "&body=" + body + "\" >"
			+ (isRussian() ?
					"Сообщите мне о Вашей проблеме"
					: "Email me about problem")
			+ "</a>"
	}
	MessageElement('<FONT style="color: red; background-color: white">ERROR: ' + message + '</FONT>');
}

function consoleLog(message){
	try{
	    console.log(getPerformance(message));//Do not works in WP
    } catch (e) {
    }
}

function consoleError(msg)
{
	try
	{
	    console.error(getPerformance(msg));
    } catch(e) {
//		alert(msg);
    }
}

function getPerformance(text)
{
    if (window.performance) {
        var now = (window.performance.now() / 1000).toFixed(3);
//        var now = g_user.nickname;//for LJ TV Chrome browser
        text = now + ': ' + text;
    }
    //$.connection.chatHub.server.consoleLog(text);
    return text;
}

function getTagData (tag) {
    if(typeof tag.textContent != 'undefined'){
        return tag.textContent;
    }
    if(typeof tag.text != 'undefined'){
        return tag.text;//IE
    }
    ErrorMessage("getTagData() failed!");
}

//http://htmlweb.ru/java/example/stack_js.php
function printStackTrace() {
    var callstack = [];
    var isCallstackPopulated = false;
    try {
        i.dont.exist+=0; //does not exist - that's the point
    } catch(e) {
        if (e.stack) { //Firefox
            var lines = e.stack.split("n");
            for (var i = 0, len = lines.length; i < len; i++) {
//                if ( lines[i].match( /^s*[A-Za-z0-9-_$]+(/ ) )
                {
                    callstack.push(lines[i]);
                }
            }
            //Remove call to printStackTrace()
            callstack.shift();
            isCallstackPopulated = true;
        }
        else if (window.opera && e.message) { //Opera
            var lines = e.message.split("n");
            for (var i = 0, len = lines.length; i < len; i++) {
//                if ( lines[i].match( /^s*[A-Za-z0-9-_$]+(/ ) )
                {
                    var entry = lines[i];
                    //Append next line also since it has the file info
                    if (lines[i+1]) {
                        entry += " at " + lines[i+1];
                        i++;
                    }
                    callstack.push(entry);
                }
            }
            //Remove call to printStackTrace()
            callstack.shift();
            isCallstackPopulated = true;
        }
    }
    if (!isCallstackPopulated) { //IE and Safari
        var currentFunction = arguments.callee.caller;
        while (currentFunction) {
            var fn = currentFunction.toString();
            //If we can't get the function name set to "anonymous"
            var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf("(")) || "anonymous";
            callstack.push(fname);
            try{
                currentFunction = currentFunction.caller;
            }catch(e){
                break;//for Safari
            }
        }
    }
    return callstack;
//    output(callstack);
}

function output(arr) {
    //Optput however you want
    alert(arr.join("nn"));
}

//http://stackoverflow.com/questions/523266/how-can-i-get-a-specific-parameter-from-location-search
//Example how to use it: 
//var params = parseQueryString();
//alert(params["foo"]); 
//
//Depricated. For example incorrect decoding from "q+%2B+4" to "q + 4". Use QueryString instead.
var parseQueryString = function () {

    var str = window.location.search;
    var objURL = {};

    str.replace(
        new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
        function( $0, $1, $2, $3 ){
            objURL[ $1 ] = $3;
        }
    );
    return objURL;
};

//http://javascript.ru/ui/offset
function getOffsetSum(elem) {
    var top=0, left=0
    while(elem) {
        top = top + parseFloat(elem.offsetTop)
        left = left + parseFloat(elem.offsetLeft)

        //http://stackoverflow.com/questions/21912684/how-to-get-value-of-translatex-and-translatey
        if (window.getComputedStyle) {
            var style = getComputedStyle(elem),
                transform = style.transform || style.webkitTransform || style.mozTransform;
            if (typeof transform != 'undefined') {//do not support in IE 11
                var mat = transform.match(/^matrix\((.+), (.+), (.+)\)$/);///^matrix3d\((.+)\)$/);
                if (mat) {
                    top = top + parseInt(mat[3]);
                    left = left + parseInt(mat[2]);
                }
            }
        }

        elem = elem.offsetParent
    }
    return {top: Math.round(top), left: Math.round(left)}
}

function getMargin(margin) {
    var marginWidth = parseInt(margin);//parseInt for IE7
    if (!isNaN(marginWidth))
        return marginWidth;
    switch(margin){
        case "auto"://Указывает, что размер отступов будет автоматически рассчитан браузером.
            return 0;
        case "inherit"://Наследует значение родителя.
            break;
    }
    ErrorMessage("Unknown margin: " + margin);
}

function getBorderWidth(border) {
    var borderWidth = parseInt(border);//parseInt for IE7
    if (!isNaN(borderWidth))
        return borderWidth;
    //http://htmlbook.ru/css/border-width
    switch (border) {
        case "thin"://Less than the medium width.
            return 2;
        case "medium"://Default.
            return 4;
        case "thick"://Greater than the medium width.
            return 6;
        case "inherit"://Takes the value of this property from the computed style of the parent element.
            break;
    }
    ErrorMessage("Unknown border width: " + border);
}

function getFullSize(element) {
    var style;
    if (typeof window.getComputedStyle != 'undefined')
        style = window.getComputedStyle(element, null);
    else if (typeof element.currentStyle != 'undefined')
        style = element.currentStyle;//IE7
    else {
        ErrorMessage("element.currentStyle is undefined\n\n" + window.navigator.appName + " " + window.navigator.appVersion);
        return;
    }
    return {
        height: element.offsetHeight
            + getMargin(style.marginTop)
            + getMargin(style.marginBottom)
            + getBorderWidth(style.borderBottomWidth)
            + getBorderWidth(style.borderTopWidth)
        ,
        width: element.offsetWidth
            + getMargin(style.marginLeft)
            + getMargin(style.marginRight)
            + getBorderWidth(style.borderLeftWidth)
            + getBorderWidth(style.borderRightWidth)
    }
}

//http://www.askdev.ru/javascript/9439/%D0%9E%D0%BF%D1%80%D0%B5%D0%B4%D0%B5%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5-%D1%8F%D0%B7%D1%8B%D0%BA%D0%B0-%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8F-%D1%81%D1%80%D0%B5%D0%B4%D1%81%D1%82%D0%B2%D0%B0%D0%BC%D0%B8-Java-Script/
function getLocale() {
	if (!navigator){
		consoleError("getLocale() failed! !navigator");
		return "";
	}
	
	if (
        (typeof navigator.languages != 'undefined')
        && (typeof navigator.languages != 'unknown')//for IE6
        && (navigator.languages.length > 0)
        )
		return navigator.languages[0];//Chrome
		
	//IE
	if (navigator.language) {
		return navigator.language;
	}
	else if (navigator.browserLanguage) {
		return navigator.browserLanguage;
	}
	else if (navigator.systemLanguage) {
		return navigator.systemLanguage;
	}
	else if (navigator.userLanguage) {
		return navigator.userLanguage;
	}
	
	consoleError("getLocale() failed!");
	return "";
}

//D:\My documents\MyProjects\trunk\WebFeatures\WebFeatures\SignalRChat\ckeditor\core\lang.js 
// line 79 detect: function( defaultLanguage, probeLanguage ) {
function getLanguageCode() {
    var parts = getLocale().toLowerCase().match(/([a-z]+)(?:-([a-z]+))?/),
        lang = parts[1],
        locale = parts[2];
    return lang;
}
/*
function loadScript(url) {
    var script = document.createElement('script');
    script.setAttribute("type", 'text/javascript');
    script.setAttribute("src", url);
    document.getElementsByTagName("head")[0].appendChild(script);
}
*/
//http://javascript.ru/forum/events/21439-dinamicheskaya-zagruzka-skriptov.html
//https://learn.javascript.ru/onload-onerror
var loadScript = function (src, onload, onerror, appendTo) {
    if (!appendTo) {
        appendTo = document.getElementsByTagName('head')[0];
    }
    /*//not support in IE6
    var script = appendTo.querySelector('script[id="' + src + '"]');
    if (script) {
        if (onload)
            setTimeout(function () { onload() }, 100);//Если не сделать эту задержку, то при открыити локальной веб камеры иногда не успевает скачиваться app.js и появляется ошибка addMedia.js:6 Uncaught ReferenceError: App is not defined
        return;
    }
    */
    for(i in appendTo.childNodes){
        var child = appendTo.childNodes[i];
        if((child.tagName == 'SCRIPT') && (child.id == src)){
            if (onload)
                setTimeout(function () { onload() }, 100);//Если не сделать эту задержку, то при открыити локальной веб камеры иногда не успевает скачиваться app.js и появляется ошибка addMedia.js:6 Uncaught ReferenceError: App is not defined
            return;
        }
    }

    script = document.createElement('script');
    script.setAttribute("type", 'text/javascript');
    script.setAttribute("id", src);

    if (onload) {
        if (script.readyState && !script.onload) {
            // IE, Opera
            script.onreadystatechange = function () {
//                alert('script.readyState: ' + script.readyState);
/*
                                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    onload();
                }
*/
                if (script.readyState == "complete") { // на случай пропуска loaded
                    onload(); // (2)
                }

                if (script.readyState == "loaded") {
                    setTimeout(onload, 0);  // (1)

                    // убираем обработчик, чтобы не сработал на complete
                    this.onreadystatechange = null;
                }
            }
        }
        else {
            // Rest
            function _onload() {
                consoleLog('loadScript.onload() ' + this.src);
                onload();
            }
            script.onload = _onload;

            if (onerror)
                script.onerror = onerror;
            else script.onerror = function () {
                consoleError('loadScript: "' + this.src + '" failed');
            };
        }
    }

    script.src = src;
    appendTo.appendChild(script);
}

function isRussian() {
	return getLocale().toUpperCase().indexOf("RU") == 0;
}

http://www.cyberforum.ru/javascript/thread234057.html
function getCaretPosition(obj){
	if (document.selection){
		var range = document.selection.createRange();
		range.moveStart('textedit', -1);
		return range.text.length;
	}
	return obj.selectionStart;
}

//http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox
function setCaretPosition(elem, caretPos) {

	if(elem == null)
		return;

	if(elem.createTextRange) {
		var range = elem.createTextRange();
		range.move('character', caretPos);
		range.select();
	}
	else {
		if(elem.selectionStart) {
			elem.focus();
			elem.setSelectionRange(caretPos, caretPos);
		}
		else
			elem.focus();
	}
}

//https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Working_with_Objects
function showProps(obj) {
	var result = "";
	for (var i in obj) {
//		if (obj.hasOwnProperty(i))
			result += i + " = " + obj[i] + "\n";
	}
	return result;
}

//http://stackoverflow.com/questions/7744875/how-do-i-detect-if-quicktime-is-installed-with-javascript
function hasQuickTime() {
	var haveqt = false;

	if (navigator.plugins) {
		for (i=0; i < navigator.plugins.length; i++ ) {
			if (navigator.plugins[i].name.indexOf
			("QuickTime") >= 0)
			{ return true; }
		}
	}

	if ((navigator.appVersion.indexOf("Mac") > 0)
		&& (navigator.appName.substring(0,9) == "Microsoft")
		&& (parseInt(navigator.appVersion) < 5) )
	{ return true; }
	
	return false;
}

//http://stackoverflow.com/questions/879152/how-do-i-make-javascript-beep
function beep(url) {
    try {
        var snd;
        if (url) {
            snd = new Audio(url);
        } else {
/*	
        if(isFirefox){
            //ATTENTION!!! Audio data in the wav format is not compatible with Opera, Safari
            var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
        }else{
            //ATTENTION!!! Audio data in the mp3 format is not compatible with FireFox
            var snd = new Audio("data:audio/mp3;base64,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");  
        }			
*/
            snd = new Audio("data:audio/mp3;base64,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");

            //ATTENTION!!! Audio data in the wav format is not compatible with IE. Error: AUDIO/VIDEO: Unknown MIME type.
            //http://stackoverflow.com/questions/24301748/using-html-audio-with-ie-media12899-audio-video-unknown-mime-type
            //Compatible with Chrome, Opera, Firefox, Safari
            //var snd = new Audio("beep.wav");

            //var snd = new Audio("beep.mp3");
        }
		snd.play();
	} catch(e){
	
		var message;
		if(typeof e.message == 'undefined')
			message = e;
		else message = e.message;
		
		//for IE
		//http://stackoverflow.com/questions/7050210/why-is-ie9-telling-me-it-does-not-support-audio-but-it-supports-other-audio
		//http://www.w3schools.com/jsref/prop_doc_documentmode.asp
		if(
				(typeof document.documentMode != 'undefined')//IE
				&& (document.documentMode < 9)//The web page is displayed in less then IE9 mode
			){
			message += '. Make sure you did not press the Compatibility View button or to define the IE9 version engine is used to render a page using the <meta http-equiv="X-UA-Compatible" content="IE=9"/> tag in the <head> of your web page.'
		}
		
		//for Safari
		//Safari error: 'undefined' is not a constructor (evaluating 'new Audio')
		//http://stackoverflow.com/questions/21037139/javascript-audio-is-not-working-in-safari-5-1-7-an-ie
		else if (isSafari && !hasQuickTime()) {
		    message += ". Safari does not play audio by itself. Install <a href='http://www.apple.com/quicktime/download/' target='_blank' >QuickTime</a> and restart Windows."
		    MessageElement(message);
		}
		else consoleError("beep() failed! " + message);
	}
}

//http://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
function colourNameToHex(colour)
{
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

	//example colour = "#abcde7";
	if(colour.match(/^#([ABCDEF\d]{6})$/i) == null){
		consoleError("Invalid color name: " + colour);
		return false;
	}
    return colour;
}

//http://www.mattlag.com/scripting/hexcolorinverter.php
function invertHex(hexnum){
	if(hexnum == false)
		return false;
	var hexSumbol = "#";
	if((hexnum.length > 0) && (hexnum.charAt(0) == hexSumbol))//hexnum[0] is not supported by IE
		hexnum = hexnum.substr(1);
	else hexSumbol = "";
	if(hexnum.length != 6) {
		consoleError("Hex color must be six hex numbers in length.");
		return false;
	}
	
	hexnum = hexnum.toUpperCase();
	var splitnum = hexnum.split("");
	var resultnum = "";
	var simplenum = "FEDCBA9876".split("");
	var complexnum = new Array();
	complexnum.A = "5";
	complexnum.B = "4";
	complexnum.C = "3";
	complexnum.D = "2";
	complexnum.E = "1";
	complexnum.F = "0";
	
	for(i=0; i<6; i++){
		if(!isNaN(splitnum[i])) {	resultnum += simplenum[splitnum[i]]; }
		else if(complexnum[splitnum[i]]){ resultnum += complexnum[splitnum[i]]; }
		else {
			alert("Hex colors must only include hex numbers - 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, or F.");
			return false;
		}
	}
	
	return hexSumbol + resultnum;
}

//http://stackoverflow.com/questions/1074660/with-a-browser-how-do-i-know-which-decimal-separator-does-the-client-use
function getDecimalSeparator() {
	//fallback  
	var decSep = ".";

	try {
		// this works in FF, Chrome, IE, Safari and Opera
		var sep = parseFloat(3/2).toLocaleString().substring(1,2);
		if (sep === '.' || sep === ',') {
			decSep = sep;
		}
	} catch(e){}

	return decSep;
}

function get_cookie ( cookie_name, defaultValue)
{
	//http://ruseller.com/lessons.php?rub=28&id=593
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
 
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return defaultValue;
}

function SetCookie(name, value)
{
	//http://ruseller.com/lessons.php?rub=28&id=593
	var cookie_date = new Date ( );  // Текущая дата и время
	cookie_date.setTime ( cookie_date.getTime() + 1000 * 60 * 60 * 24 * 365);
	var length = 0, lengthMin = 0, oldValue;
	while((length == 0) || (length != lengthMin)){
	    document.cookie = name + "=" + value + "; expires=" + cookie_date.toGMTString();
	    var cookieLimit = get_cookie(name, '').length;
	    if (cookieLimit != value.length) {
	        oldValue = value;
	        length = parseInt((lengthMin + value.length) / 2);
	        value = value.substring(0,length);
	        //consoleError('Cookie Limit 1 = ' + value.length);
	        continue;
	    }
	    if(length != 0){
	        length = parseInt(length + (oldValue.length - value.length) / 2);
	        lengthMin = value.length;
	        value = oldValue.substring(0, length);
	        //consoleError('Cookie Limit 2 = ' + value.length);
	        continue;
        }
	    break;
	}
	if(length != 0){
	    consoleError('Cookie Limit = ' + value.length);
	    delete_cookie (name);
	}
	return length;
}

function delete_cookie ( cookie_name )
{
	//http://ruseller.com/lessons.php?rub=28&id=593
	var cookie_date = new Date ( );  // Текущая дата и время
	cookie_date.setTime ( cookie_date.getTime() - 1 );
	document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}

function getElementByClassName(parentElement, className) {
    for (var i = 0; i < parentElement.childNodes.length; i++){
        var childElement = parentElement.childNodes[i];
        if (childElement.className) {
            var arrayClassNames = childElement.className.split(' ');
            for (var j = 0; j < arrayClassNames.length; j++) {
                if (arrayClassNames[j] == className) {
                    return childElement;
                }
            }
        }
    }
    return null;
}

function displayDuration(startTime, elementDuration, suffix) {
    var dateCur = new Date();
    var time = dateCur.getTime() - startTime;
    var timezoneOffset = dateCur.getTimezoneOffset() * 60000;
    var date = new Date(time + timezoneOffset);
    //consoleLog('displayDuration() startTime = ' + startTime + ' time = ' + time + ' timezoneOffset = ' + timezoneOffset + ' date = ' + date + ' dateCur = ' + dateCur);
    var year = date.getFullYear();//нужно анализировать для случая Time Zone < 0 (Американское время)
    if (year == 1969)
        var date = new Date(time + timezoneOffset + 1000 * 60 * 60);
    else if ((year == 1970) && (date.getHours() == 1))
        var date = new Date(time + timezoneOffset - 1000 * 60 * 60);
    var hour = date.getHours();
    var minute = date.getMinutes();
    var seconds = date.getSeconds();
    if (typeof suffix == 'undefined')
        suffix = '';
    elementDuration.innerText = ((hour == 0) ? '' : (hour + ':')) + minute + ':' + ((seconds < 10) ? '0' : '') + seconds + suffix;
}

function isBranchExpanded(informer) {
    return informer.className.indexOf(' expanded') != -1;
}

function onbranchelement(informer, branchId, expand, maxHeight) {
    var branch = document.getElementById(branchId);
    var expanded = ' expanded';
    if(informer.className.indexOf('b-toggle') == -1)
        consoleError('informer.className: ' + informer.className);
    if(!isBranchExpanded(informer))
    {
        if((expand != null) && (expand == false))
            return;//do not expand
        if(typeof maxHeight == 'undefined')
            maxHeight = window.screen.height + "px";
        informer.style.maxHeight = maxHeight;
        informer.className += expanded;
        if(branch)
            branch.innerHTML = "▼"<!-- http://htmlbook.ru/samhtml/tekst/spetssimvoly http://unicode-table.com/ru/#box-drawing -->
        return false;
    }
    if((expand != null) && (expand == true))
        return;//do not close
    informer.style.maxHeight = "0px";
    informer.className = informer.className.replace(expanded, '');
    if(branch)
        branch.innerHTML = "▶"<!-- http://htmlbook.ru/samhtml/tekst/spetssimvoly http://unicode-table.com/ru/#box-drawing -->
    return false;
};

function onbranch(informerId, branchId, expand, maxHeight) {
    onbranchelement(document.getElementById(informerId), branchId, expand, maxHeight);
}
