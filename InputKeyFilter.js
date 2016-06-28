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
 *  2015-07-02, : 
 *       + CreateEmailFilter
 *
 */
 
var inputKeyFilter = {

	Create: function(elementID, onChange, customFilter, onblur, onkeypress, onkeyup, isNoRestoreValue, validated){
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
				&& (elementType != "password")
				&& (elementType != "url")
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
		element.ikf = new function(){
		}
		element.ikf.customFilter = customFilter;
		if(!isNoRestoreValue)
			element.ikf.oldValue = element.value;
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
				elementInput.ikf.isKeypress = false;
				inputKeyFilter.filter(elementInput, charCode);
				return true;//Go to onkeyup event. For Chrome and input type="number"
			}
			var value = elementInput.value.substr(0,caretPos) + charCode + elementInput.value.substr(caretPos);
			elementInput.ikf.isKeypress = true;
			if(!inputKeyFilter.filter(elementInput, value)){
				return !inputKeyFilter.restoreValue(elementInput);
			}
			if(typeof elementInput.ikf.oldValue != 'undefined')
				elementInput.ikf.oldValue = value;
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
			//var elementInput = (evt.srcElement) ? evt.srcElement : evt.currentTarget;//Uncompatible with IE6
			var elementInput = this;
//consoleLog("onKeyUp(" + evt + ") elementInput.ikf.isKeypress = " + elementInput.ikf.isKeypress);
			if(elementInput.ikf.isKeypress){
				elementInput.ikf.isKeypress = false;
				return true;//Do not process the "key up" event if "key press" event fires
			}
			if(!inputKeyFilter.filter(elementInput)){
				inputKeyFilter.restoreValue(elementInput);
				return false;
			}
			if(typeof elementInput.ikf.oldValue != 'undefined')
				elementInput.ikf.oldValue = elementInput.value;
			return true;
		}
		if((typeof validated != 'undefined') && (validated != null))
			element.ikf.validated = validated;
	}
	
	, restoreValue: function(elementInput){
//consoleLog("elementInput.ikf.isNoRestoreValue = " + elementInput.ikf.isNoRestoreValue + " elementInput.ikf.oldValue = " + elementInput.ikf.oldValue);
		if(elementInput.ikf.isNoRestoreValue || (typeof elementInput.ikf.oldValue == 'undefined')){
			return false;
		}
		var caretPos = null;
		try{
			caretPos = getCaretPosition(elementInput);
		}catch(e){//For Chrome and input type="number"
		}
		elementInput.value = elementInput.ikf.oldValue;
		if(caretPos)
			setCaretPosition(elementInput, caretPos);
		return true;
	}
	
	, timeout_id: null
	
	, CreateTooltip: function (text, elementInput, className) {
		clearTimeout(inputKeyFilter.timeout_id);
		var element = inputKeyFilter.getMyTooltip();
		if(element)
			document.body.removeChild(element);
		element = document.createElement("span");
		element.id = inputKeyFilter.idMyTooltip;
		element.style.opacity = "1"; // Полупрозрачный фон. Attention!!! opacity = "0.9" is not allowed for Opera 9.5 for Windows Mobile
		element.className = className;//"uparrowdiv";//"downarrowdiv";
		element.innerHTML = text;
		document.body.appendChild(element);

		if (elementInput) {
		    var offsetSum = getOffsetSum(elementInput);
		    if (className.match(/(down)/) == null)
		        element.style.top = (offsetSum.top + elementInput.offsetHeight + 10) + "px";//for uparrowdiv style
		    else
		        element.style.top = (offsetSum.top - element.offsetHeight - 10) + "px";//for downarrowdiv style
		    element.style.left = offsetSum.left + "px";
		}
		else consoleError('CreateTooltip("' + text + '", ' + elementInput + ', "' + className + '") failed. Invalid elementInput.');

		inputKeyFilter.timeout_id = setTimeout(function() { inputKeyFilter.RemoveMyTooltip() }, 3000);
	}
	
	//http://javascript.ru/forum/dom-window/7626-vsplyvayushhaya-podskazka.html
	, TextAdd: function(text, elementInput, className){
//consoleLog("inputKeyFilter.TextAdd(" + text + ") inputKeyFilter.focusAgain = " + inputKeyFilter.focusAgain);
		if(isIE && inputKeyFilter.focusAgain)
			return;
		if((typeof className == 'undefined') || (className == null))
			className = "uparrowdivred";
		inputKeyFilter.CreateTooltip(text, elementInput, className);
		beep();
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
//consoleLog("inputKeyFilter.filter(...)\n\n" + printStackTrace().join("nn"));

		//for float number
		if(!inputKeyFilter.validate(elementInput))
			return false;
			
		if(elementInput.ikf.customFilter){
			if(typeof value == 'undefined')
				value = elementInput.value;
			if(!elementInput.ikf.customFilter(elementInput, value))
				return false;
			if(typeof elementInput.ikf.validated != 'undefined'){
//consoleLog("validated");
				inputKeyFilter.CreateTooltip(isRussian() ?
						"Проверено"
						: "Validated"
					, elementInput, "uparrowdivgreen");
			}
			else inputKeyFilter.RemoveMyTooltip();
			return true;
		}
		consoleError("customFilter is not defined!");
	}
	
	//https://learn.javascript.ru/keyboard-events
	// event.type is keypress or keyup
	, getChar: function(event){
//alert("event: " + event);
		if (!event) event = window.event;//for IE6
		if (event.which == null)// IE
//		if (typeof event.which == 'undefined')// IE
		{
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
return;//infinity loop in Opera WP
/*
		//I use a inputKeyFilter.focusAgain variable to prevent an infinite loop to give focus to an inputKeyFilter element in IE.
		// For testing:
		// open IE,
		// go to https://googledrive.com/host/0B5hS0tFSGjBZfkhKS1VobnFDTkJKR0tVamxadmlvTmItQ2pxVWR0WDZPdHZxM2hzS1J3ejQ/InputKeyFilter/ site,
		// give focus to the empty Integer field, then click to the empty Float field.
		if(!isIE || !inputKeyFilter.focusAgain)
		{
			//do not works in Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=53579
			elementInput.focus();
			inputKeyFilter.focusAgain = true;
		}
		else inputKeyFilter.focusAgain = false;
	}

	// Set focus to the input element again if input value is NaN.
	// You can call this function during processing of the "onblur", "onfocusout" and "onchange" events of the input element.
	, isNaN: function(value, elementInput){
//consoleLog("inputKeyFilter.isNaN(...). elementInput.ikf.isKeypress = " + elementInput.ikf.isKeypress);
		elementInput.ikf.isKeypress = true;
		if(!isNaN(value)){
			return false;
		}
			
		this.TextAdd(isRussian() ?
				"Не числовое значение: " + value
				: "number is an illegal number: " + value
			, elementInput);
		
		this.focus(elementInput);
		
		return true;
*/
	}
	
	, parseFloat: function(float){
		return parseFloat(float.replace(",", "."));
	}
	
	, idMyTooltip: "myTooltip"
	
	, getMyTooltip: function(){
		return document.getElementById(this.idMyTooltip);
	}
	
	, RemoveMyTooltip: function(){
//consoleLog("RemoveMyTooltip\n\n" + printStackTrace().join("nn"));
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
	
	, isMinMax: function(elementInput, value, isFloat){
		var min;
		var max;
		if(isFloat == true){
			value = inputKeyFilter.parseFloat(value);
			min = parseFloat(elementInput.min);
			max = parseFloat(elementInput.max);
		}else{
			value = parseInt(value);
			min = parseInt(elementInput.min);
			max = parseInt(elementInput.max);
		}
		if(elementInput.min && (value < min)){
			elementInput.ikf.isNoRestoreValue = true;
			inputKeyFilter.TextAdd(isRussian() ?
					"Значение должно быть больше или равно " + elementInput.min
					: "Please select a value that is no less than " + elementInput.min
				, elementInput);
			return false;
		}
		if(elementInput.max && (value > max)){
			elementInput.ikf.isNoRestoreValue = true;
			inputKeyFilter.TextAdd(isRussian() ?
					"Значение должно быть меньше или равно " + elementInput.max
					: "Please select a value that is no more than " + elementInput.max
				, elementInput);
			return false;
		}
		return true;
	}
	
}//inputKeyFilter

//Negative and positive integer value of the input element is allowed
function CreateIntFilter(elementID, onChange, onblur){
	try{
		inputKeyFilter.Create(elementID
			, onChange
			, function(elementInput, value){//customFilter
				elementInput.ikf.isNoRestoreValue = false;
				if(value.match(/^(-?\d*)$/) == null){
					inputKeyFilter.TextAdd(isRussian() ?
							"Допустимый формат: -[0...9]. Например: -1234 1234"
							: "Acceptable formats: -[0...9]. Examples: -1234 1234"
						, elementInput);
					return false;
				}
				return inputKeyFilter.isMinMax(elementInput, value);
			}
			, onblur ? 
				onblur
				: document.getElementById(elementID).onblur ?
					null
					: function(event){
						if(inputKeyFilter.isNaN(parseInt(this.value), this))
							return;
						inputKeyFilter.isMinMax(this, this.value);
					}
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
				elementInput.ikf.isNoRestoreValue = false;
				if(value.match(/^(\d*)$/) == null){
					inputKeyFilter.TextAdd(isRussian() ?
							"Допустимый формат: [0...9]. Например: 1234"
							: "Acceptable formats: [0...9]. Examples: 1234"
						, elementInput);
					return false;
				}
				return inputKeyFilter.isMinMax(elementInput, value);
			}
			, onblur ? 
				onblur
				: document.getElementById(elementID).onblur ?
					null
					: function(event){
						if(inputKeyFilter.isNaN(parseInt(this.value), this))
							return;
						inputKeyFilter.isMinMax(this, this.value);
					}
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
				elementInput.ikf.isNoRestoreValue = false;
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
				return inputKeyFilter.isMinMax(elementInput, value, true);
			}
			, onblur ? 
				onblur
				: document.getElementById(elementID).onblur ?
					null
					: function(event){
					if(inputKeyFilter.isNaN(parseFloat(this.value), this))
						return;
					inputKeyFilter.isMinMax(this, this.value, true);
					}
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
				if(!this.ikf.customFilter(this))
					return false;
				if(this.onChangeEmail != null)
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
			, null//onkeyup
			, true//isNoRestoreValue
			, true//validated
		)
	} catch(e) {
		consoleError("Create email filter failed. " + e);
	}
}

function CreateUrlFilter(elementID, onChange, onblur){

	document.getElementById(elementID).onChangeUrl = onChange;
	
	try{
		inputKeyFilter.Create(elementID
			, function(event){//onChange
//consoleLog("CreateUrlFilter.onChange");
				if(!this.ikf.customFilter(this))
					return false;
				if(this.onChangeUrl != null)
					this.onChangeUrl(event);
			}
			, function(elementInput, value){//customFilter
			
				//For HTML5
				if(!inputKeyFilter.validate(elementInput))
					return false;
					
				//http://www.w3schools.com/html/tryit.asp?filename=tryhtml_input_url
				//http://stackoverflow.com/questions/1410311/regular-expression-for-url-validation-in-javascript
				if(elementInput.value.match(/^[a-z]+:[^:]+$/i) == null){
					inputKeyFilter.TextAdd(isRussian() ?
							"Допустимый формат: protocol:hostname."
							: "Acceptable formats: protocol:hostname."
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
			, null//onkeyup
			, true//isNoRestoreValue
			, true//validated
		)
	} catch(e) {
		consoleError("Create URL filter failed. " + e);
	}
}

function CreatePasswordFilter(elementID, customFilter, onChange, onblur){
	try{
		inputKeyFilter.Create(elementID
			, onChange
			, customFilter
			, onblur
			, null//onkeypress
			, null//onkeyup
			, true//isNoRestoreValue
			, true//validated
		)
	} catch(e) {
		consoleError("Create password filter failed. " + e);
	}
}

function CreateDateFilter(elementID, options
    ) {
    try {
        if (typeof options.formatMessage == 'undefined')
            options.formatMessage = 'Please type date %s';
        function dateValidation(event) {
            if (elementDate.defaultValue == event.target.value) {
                if (typeof options.onblur == 'undefined')
                    return;
                if (!options.onblur(event))
                    return;
            }
            var timestamp = Date.parse(event.target.value);
            if (isNaN(timestamp) == false) {
                if (typeof options.dateLimitMessage == 'undefined')
                    options.dateLimitMessage = 'Please type date between "%min" and "%max"';
                options.dateLimitMessage = options.dateLimitMessage.replace('%min', elementDate.min).replace('%max', elementDate.max);
                if (elementDate.min != '') {
                    if (new Date(elementDate.min).getTime() > new Date(event.target.value).getTime()) {
                        inputKeyFilter.TextAdd(options.dateLimitMessage, elementDate);
//                        elementDate.focus();
                        return;
                    }
                }
                if (elementDate.max != '') {
                    if (new Date(elementDate.max).getTime() < new Date(event.target.value).getTime()) {
                        inputKeyFilter.TextAdd(options.dateLimitMessage, elementDate);
//                        elementDate.focus();
                        return;
                    }
                }
                if (typeof options.onblur != 'undefined')
                    options.onblur(event);
            } else inputKeyFilter.TextAdd(options.formatMessage.replace('%s', elementDate.defaultValue), elementDate);
        }
        var elementDate = document.getElementById(elementID);
        if (typeof options.min != 'undefined')
            elementDate.min = options.min;
        if (typeof options.max != 'undefined')
            elementDate.max = options.max;
        if (elementDate.tagName.toUpperCase() != 'INPUT') {
            consoleError('Invalid element tag name="' + elementDate.tagName + '". Use input tag"');
        }
        else switch (elementDate.type.toLowerCase()) {
            case "date":
                consoleLog("Your browser supports date input");
                elementDate.onblur = function (event) {
                    consoleLog("elementDate.onblur()");
                    dateValidation(event);
                }
                break;
            case "text":
                consoleLog("Your browser doesn't support date input");
                elementDate.type = 'text';
                elementDate.value = 'YYYY-MM-DD';//'mm/dd/yyyy';
                elementDate.defaultValue = elementDate.value;
                inputKeyFilter.Create(elementID
                    , null//onChange event
                    , function (elementInput, value) {//customFilter
                        var arrayDate = value.match(/^([\dy]*)-([\dm]*)-([\dd]*)$/i);
                        if (arrayDate) {
                            /*
                            var arrayString = '';
                            for (var i = 1; i < arrayDate.length; i++) {
                                arrayString += arrayDate[i] + '-';
                            }
                            consoleLog("elementDate.customFilter() value: " + value + ' arrayString: ' + arrayString);
                            */
                            return true;
                        }
                        inputKeyFilter.TextAdd(options.formatMessage.replace('%s', elementInput.defaultValue), elementInput);
                        return false;
                    }
                    , function (event) {//onblur event
                        consoleLog("elementDate.onblur()");
                        dateValidation(event);
                    }
                );
                break;
            default: consoleError('Invalid input type="' + elementDate.type + '". Use type="date"');
        }
    } catch (e) {
        consoleError("Create date filter failed. " + e);
    }
}
