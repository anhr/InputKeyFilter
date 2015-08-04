/**
 * A Javascript object of the cross-browser filter of value of the text input element on your web page using JavaScript language. You can filter the value as an integer number, a float number etc. , or write a custom filter, such as a phone number filter.
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: https://googledrive.com/host/0B5hS0tFSGjBZfkhKS1VobnFDTkJKR0tVamxadmlvTmItQ2pxVWR0WDZPdHZxM2hzS1J3ejQ/AboutMe/
 * source: https://github.com/anhr/InputKeyFilter
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2015 Andrej Hristoliubov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Revision:
 *  2011-07-02, : 
 *       + CreateEmailFilter
 *
 */
 
var inputKeyFilter = {

	Create: function(elementID, onChange, customFilter, onblur, onkeypress, onkeyup){
		var element = document.getElementById(elementID);
		if(!element)
			throw "Invalid id of Input Key Filter input element: " + elementID;
		if(element.tagName.toUpperCase() != "INPUT")
			throw "Use input element as Input Key Filter";
			
		var elementType = element.type.toLowerCase();
		if	(
				(elementType != "text")
				&& (elementType != "email")
				&& (elementType != "number")
			){
			var message = "element ID: '" + elementID + "' element type: '" + elementType + "'. Use input text element as Input Key Filter";
			if(isIE)
				throw message;
			consoleError(message);
			element.type = "text";
		}
		
		if((typeof onChange != 'undefined') && (onChange != null)){
			if(element.onchange == null)
				element.onchange = onChange;
			else consoleError("Create inputKeyFilter failed!. element.onchange ambigous."
				+ "\nFirst:\n\n" + element.onchange
				+ "\n\n or second:\n\n" + onChange
				);
		}
		element.customFilter = customFilter;
		element.oldValue = element.value;
		if((typeof onblur != 'undefined') && (onblur != null)){
			if(element.onblur == null){
				//Use this function if you want do not lose the focus of the input element if input value is NaN (empty or invalid)
				//example of the onblur function: function(event){ inputKeyFilter.isNaN(parseInt(this.value), this); }
				element.onblur = onblur;
			}
			else consoleError("Create inputKeyFilter failed!. element.onblur ambigous."
				+ "\nFirst:\n\n" + element.onblur
				+ "\n\n or second:\n\n" + onblur
				);
		}
		if((typeof onkeypress != 'undefined') && (onkeypress != null))
			element.onkeypress = onkeypress;
		else element.onkeypress = function(evt){
			//http://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input
			//var elementInput = (evt.srcElement) ? evt.srcElement : evt.currentTarget;//Uncompatible with IE6
			var elementInput = this;
			var charCode = inputKeyFilter.getChar(evt);
			
			//for FireFox, Windows Phone Opera
			if(!charCode)
				return true;//Control codes. Examples: ArrowUp, ArrowLeft, Home, End, Backspace, Delete
				
			var caretPos;
			try{
				caretPos = getCaretPosition(elementInput);
			}catch(e){
				elementInput.isKeypress = false;
				return true;//Go to onkeyup event. For Chrome and input type="number"
			}
			var value = elementInput.value.substr(0,caretPos) + charCode + elementInput.value.substr(caretPos);
//MessageElement(value + " elementInput.value: " + elementInput.value + " caretPos = " + caretPos + " oldValue: " + elementInput.oldValue);
			if(!inputKeyFilter.filter(elementInput, value)){
				inputKeyFilter.restoreValue(elementInput);
				return false;
			}
			elementInput.oldValue = value;
			inputKeyFilter.RemoveMyTooltip();
			elementInput.isKeypress = true;
			return true;
		}
		if((typeof onkeyup != 'undefined') && (onkeyup != null))
			element.onkeyup = onkeyup;
		else element.onkeyup = function(evt){
			// Sometimes the "key press" event is not fires.
			// For example if user press the control keys (ArrowUp, ArrowLeft, Home, End, Backspace, Delete etc).
			// Some browsers (Internet Samsung Galaxy S5) is not support the "key press" event.
			// The "key press" event is not fires in Android if you press a russian letter. see http://stackoverflow.com/questions/9302986/no-keypress-events-for-certain-keys-in-android-browser
			// For resolving of the problem I have added the onKeyUp(...) function for "key up" event
			// I can not to stop processing of the "key press" event because some browsers (Opera and IE in Windows Phone) do not support the "key up" event
//consoleLog("onKeyUp(" + evt + ")");
			//var elementInput = (evt.srcElement) ? evt.srcElement : evt.currentTarget;//Uncompatible with IE6
			var elementInput = this;
			if(elementInput.isKeypress){
				elementInput.isKeypress = false;
				return true;//Do not process the "key up" event if "key press" event fires
			}
			if(!inputKeyFilter.filter(elementInput)){
				inputKeyFilter.restoreValue(elementInput);
				return false;
			}
			elementInput.oldValue = elementInput.value;
			inputKeyFilter.RemoveMyTooltip();
			return true;
		}
	}
	
	, restoreValue: function(elementInput){
		var caretPos = null;
		try{
			caretPos = getCaretPosition(elementInput);
		}catch(e){//For Chrome and input type="number"
		}
		if(typeof elementInput.oldValue != 'undefined')
			elementInput.value = elementInput.oldValue;
		else elementInput.value = "";//For Android 2.3.6
		if(caretPos)
			setCaretPosition(elementInput, caretPos);
	}
	
	//http://javascript.ru/forum/dom-window/7626-vsplyvayushhaya-podskazka.html
	, TextAdd: function(text, input){
consoleLog("inputKeyFilter.TextAdd(" + text + ") inputKeyFilter.focusAgain = " + inputKeyFilter.focusAgain);
		if(isIE && inputKeyFilter.focusAgain)
			return;
		var element = inputKeyFilter.getMyTooltip();
		if(!element){
			element = document.createElement("span");
			document.body.appendChild(element );
			element.id = inputKeyFilter.idMyTooltip;
			element.className = "uparrowdiv";//"downarrowdiv";
			var offsetSum = getOffsetSum(input);
			//element.style.top = (offsetSum.top - input.offsetHeight - element.offsetHeight) + "px";//for downarrowdiv style
			element.style.top = (offsetSum.top + input.offsetHeight + 10) + "px";//for uparrowdiv style
			element.style.left = offsetSum.left + "px";
			element.style.opacity = "1"; // Полупрозрачный фон. Attention!!! opacity = "0.9" is not allowed for Opera 9.5 for Windows Mobile
		}
		element.innerHTML = text;
		beep();
		setTimeout(function() { inputKeyFilter.RemoveMyTooltip() }, 3000);
	}

	//Validate of the input value if your browser supports HTML5
	, validate: function(elementInput){
//consoleLog("inputKeyFilter.filter(...). " + elementInput.validationMessage);
		if(
					(typeof elementInput.validationMessage != "undefined")//Your browser supports HTML5
					&& (elementInput.validationMessage != "")
				){
			inputKeyFilter.TextAdd(elementInput.validationMessage, elementInput);
			inputKeyFilter.focus(elementInput);
			return false;
		}
		return true;
	}
	
	, filter: function(elementInput, value){
//consoleLog("inputKeyFilter.filter(...). " + elementInput.validationMessage);
		if(!inputKeyFilter.validate(elementInput))
			return false;
		if(elementInput.customFilter){
			if(typeof value == 'undefined')
				value = elementInput.value;
			return elementInput.customFilter(elementInput, value);
		}
		consoleError("customFilter is not defined!");
	}
	
	//https://learn.javascript.ru/keyboard-events
	// event.type is keypress or keyup
	, getChar: function(event){
//alert("event: " + event);
		if (!event) event = window.event;//for IE6
		if (event.which == null) { // IE
//		if (typeof event.which == 'undefined') { // IE
			if (event.keyCode < 32) return null; // Control codes. Examples: ArrowUp, ArrowLeft, Home, End, Backspace, Delete
			return String.fromCharCode(event.keyCode)
		}

		if (event.which != 0 && event.charCode != 0) { // все кроме IE
			if (event.which < 32) return null; // Control codes. Examples: ArrowUp, ArrowLeft, Home, End, Backspace, Delete
			return String.fromCharCode(event.which); // остальные
		}

		return null; //Control codes. Examples: ArrowUp, ArrowLeft, Home, End, Backspace, Delete
	}
	
	, focusAgain: false
	
	, focus: function(elementInput){
//ErrorMessage("inputKeyFilter.focus(...) inputKeyFilter.focusAgain = " + inputKeyFilter.focusAgain, false, false);// + printStackTrace().join("\n"));
return;//бесконечная петля в Opera WP
		//I use a inputKeyFilter.focusAgain variable to prevent an infinite loop to give focus to an inputKeyFilter element in IE.
		// For testing:
		// open IE,
		// go to https://googledrive.com/host/0B5hS0tFSGjBZfkhKS1VobnFDTkJKR0tVamxadmlvTmItQ2pxVWR0WDZPdHZxM2hzS1J3ejQ/InputKeyFilter/ site,
		// give focus to the empty Integer field, then click to the empty Float field.
		if(!isIE || !inputKeyFilter.focusAgain){
//		if(!inputKeyFilter.focusAgain){
			//do not works in Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=53579
			elementInput.focus();
			inputKeyFilter.focusAgain = true;
//			setTimeout(function() { ErrorMessage("setTimeout inputKeyFilter.focusAgain = " + inputKeyFilter.focusAgain, false, false); inputKeyFilter.focusAgain = false; }, 2000);
		}
		else inputKeyFilter.focusAgain = false;
	}

	// Set focus to the input element again if input value is NaN.
	// You can call this function during processing of the "onblur", "onfocusout" and "onchange" events of the input element.
	, isNaN: function(value, elementInput){
//consoleLog("inputKeyFilter.isNaN(...). elementInput.isKeypress = " + elementInput.isKeypress);
		elementInput.isKeypress = true;
		if(!isNaN(value)){
			return false;
		}
			
		this.TextAdd(isRussian() ?
				"Не числовое значение: " + value
				: "number is an illegal number: " + value
			, elementInput);
		
		this.focus(elementInput);
		
		return true;
	}
	
	, parseFloat: function(float){
		return parseFloat(float.replace(",", "."));
	}
	
	, idMyTooltip: "myTooltip"
	
	, getMyTooltip: function(){
		return document.getElementById(this.idMyTooltip);
	}
	
	, RemoveMyTooltip: function(){
		var element = this.getMyTooltip();
		if(!element)
			return;
		setTimeout(function() { inputKeyFilter.opacityMyTooltip() }, 10);
	//	document.body.removeChild(element)
	}
	
	, opacityMyTooltip: function(){
		var element = this.getMyTooltip();
		if(!element)
			return;
		var opacity = parseFloat(element.style.opacity) - 0.1;
		if(opacity < 0){
			document.body.removeChild(element);
			return;
		}
		element.style.opacity = opacity.toFixed(2);// Полупрозрачный фон// Attention!!! toString() is not compatible with Safari;
		element.style.filter = "alpha(Opacity=" + parseInt(opacity * 100) + ")"; // Прозрачность в IE
		setTimeout(function() { inputKeyFilter.opacityMyTooltip() }, 100);
	}
}//inputKeyFilter

//Negative and positive integer value of the input element is allowed
function CreateIntFilter(elementID, onChange, onblur){
	try{
		inputKeyFilter.Create(elementID
			, onChange
			, function(elementInput, value){//customFilter
				if(value.match(/^(-?\d*)$/) == null){
					inputKeyFilter.TextAdd(isRussian() ?
							"Допустимый формат: -[0...9]. Например: -1234 1234"
							: "Acceptable formats: -[0...9]. Examples: -1234 1234"
						, elementInput);
					return false;
				}
				return true;
			}
			, onblur
		)
	} catch(e) {
		consoleError("Create integer filter failed. " + e);
	}
}

//Positive integer value of the input element is allowed
function CreateIntPositiveFilter(elementID, onChange, onblur){
	try{
		inputKeyFilter.Create(elementID
			, onChange
			, function(elementInput, value){//customFilter
				if(value.match(/^(\d*)$/) == null){
					inputKeyFilter.TextAdd(isRussian() ?
							"Допустимый формат: [0...9]. Например: 1234"
							: "Acceptable formats: [0...9]. Examples: 1234"
						, elementInput);
					return false;
				}
				return true;
			}
			, onblur
		)
	} catch(e) {
		consoleError("Create positive integer filter failed. " + e);
	}
}

function CreateFloatFilter(elementID, onChange, onblur){
	try{
		inputKeyFilter.Create(elementID
			, onChange
			, function(elementInput, value){//customFilter
				var decimalSeparator;
				if(elementInput.type == "number")
					decimalSeparator = ".";
				else decimalSeparator = getDecimalSeparator();
				if(value.match(new RegExp("^(-?\\d*)((\\e(-?\\d*)?)?|(" + ((decimalSeparator == "." ? ("\\" + decimalSeparator) : decimalSeparator)) + "(\\d*)?)?)$", "i")) == null){
					decimalSeparator = getDecimalSeparator();
					inputKeyFilter.TextAdd(isRussian() ?
							"Допустимый формат: -[0...9]" + decimalSeparator + "[0...9] или -[0...9]e-[0...9]. Например: -12" + decimalSeparator + "34 1234 12e34 -12E-34"
							: "Acceptable formats: -[0...9]" + decimalSeparator + "[0...9] or -[0...9]e-[0...9]. Examples: -12" + decimalSeparator + "34 1234 12e34 -12E-34"
						, elementInput);
					return false;
				}
				return true;
			}
			, onblur
		)
	} catch(e) {
		consoleError("Create float filter failed. " + e);
	}
}

function CreateEmailFilter(elementID, onChange, onblur){

	document.getElementById(elementID).onChangeEmail = onChange;
	
	try{
		inputKeyFilter.Create(elementID
			, function(event){//onChange
//consoleLog("CreateEmailFilter.onChange");
				if(!this.customFilter(this))
					return false;
				this.onChangeEmail(event);
			}
			, function(elementInput, value){//customFilter
				//For HTML5
				if(!inputKeyFilter.validate(elementInput))
					return false;
					
				//http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
				if(elementInput.value.match(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i) == null){
					inputKeyFilter.TextAdd(isRussian() ?
							"Допустимый формат: username@hostname."
							: "Acceptable formats: username@hostname."
						, elementInput);
					inputKeyFilter.focus(elementInput);
					return false;
				}
				return true;
			}
			, onblur
			
			//Do not filter input value if user press a key
			, function(event){//onkeypress
				return true;
			}
			//Do not filter input value if user press a key
			, function(event){//onkeyup
				return true;
			}
		)
	} catch(e) {
		consoleError("Create email filter failed. " + e);
	}
}
