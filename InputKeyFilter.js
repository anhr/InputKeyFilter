var MyTooltip = {
	idMyTooltip: "myTooltip"
	
	, getMyTooltip: function(){
		return document.getElementById(this.idMyTooltip);
	}
	
	, RemoveMyTooltip: function(){
		var element = this.getMyTooltip();
		if(!element)
			return;
		setTimeout(function() { MyTooltip.opacityMyTooltip() }, 10);
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
		setTimeout(function() { MyTooltip.opacityMyTooltip() }, 100);
	}
}

function InputKeyFilter(customFilter) {
	this.onkeypress = false;
	this.customFilter = customFilter;

	//http://javascript.ru/forum/dom-window/7626-vsplyvayushhaya-podskazka.html
	this.TextAdd = function(text, input){
//consoleLog("InputKeyFilter.TextAdd(...)");
		var element = MyTooltip.getMyTooltip();//document.getElementById(MyTooltip.idMyTooltip);
		if(!element){
			element = document.createElement("span");
			document.body.appendChild(element );
			element.id = MyTooltip.idMyTooltip;
			element.className = "downarrowdiv";
			var offsetSum = getOffsetSum(input);
			element.style.top = (offsetSum.top - input.offsetHeight - element.offsetHeight) + "px";
			element.style.left = offsetSum.left + "px";
			element.style.opacity = "1"; // Полупрозрачный фон. Attention!!! opacity = "0.9" is not allowed for Opera 9.5 for Windows Mobile
		}
		element.innerHTML = text;
		beep();
		setTimeout(function() { MyTooltip.RemoveMyTooltip() }, 3000);
	}
	
	this.filter = function(elementInput, value){
//consoleLog("InputKeyFilter.filter(...)");
		if(this.customFilter){
			if(typeof value == 'undefined')
				value = elementInput.value;
			return this.customFilter(elementInput, value);
		}
		consoleError("customFilter is not defined!");
	}
	
	//https://learn.javascript.ru/keyboard-events
	// event.type is keypress or keyup
	this.getChar = function(event){
	  if (event.which == null) { // IE
		if (event.keyCode < 32) return null; // Control codes. Examples: ArrowUp, ArrowLeft, Home, End, Backspace, Delete
		return String.fromCharCode(event.keyCode)
	  }

	  if (event.which != 0 && event.charCode != 0) { // все кроме IE
		if (event.which < 32) return null; // Control codes. Examples: ArrowUp, ArrowLeft, Home, End, Backspace, Delete
		return String.fromCharCode(event.which); // остальные
	  }

	  return null; //Control codes. Examples: ArrowUp, ArrowLeft, Home, End, Backspace, Delete
	}

	this.value = "";
	
	//The "key press" event of the input element
	//http://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input
	this.onKeyPress = function(evt){
		this.onkeypress = true;
		
		var elementInput = (evt.srcElement) ? evt.srcElement : evt.currentTarget;
		var charCode = this.getChar(evt);
//alert("onKeyPress(" + evt + "). elementInput.value = " + elementInput.value);
		
		//for FireFox, Windows Phone Opera
		if(!charCode)
			return true;//Control codes. Examples: ArrowUp, ArrowLeft, Home, End, Backspace, Delete
			
		var caretPos = getCaretPosition(elementInput);
		var value = elementInput.value.substr(0,caretPos) + charCode + elementInput.value.substr(caretPos);
		if(!this.filter(elementInput, value))
			return false;
		this.value = value;
		MyTooltip.RemoveMyTooltip();
			return true;
	}
	
	// The "key up" event of the input element
	// Sometimes the "key press" event is not fires.
	// For example if user press the control keys (ArrowUp, ArrowLeft, Home, End, Backspace, Delete etc).
	// Some browsers (Internet app в Samsung Galaxy S5) is not support the "key press" event.
	// The "key press" event is not fires in Android if you press a russian letter. see http://stackoverflow.com/questions/9302986/no-keypress-events-for-certain-keys-in-android-browser
	// For resolving of the problem I have added the onKeyUp(...) function for "key up" event
	// I can not to stop processing of the "key press" event because some browsers (Opera and IE in Windows Phone) do not support the "key up" event
	this.onKeyUp = function(evt){
//consoleLog("onKeyUp(" + evt + ")");
		if(this.onkeypress){
			this.onkeypress = false;
			return true;//Do not process the "key up" event if "key press" event fires
		}
//alert("onKeyUp(" + evt + "). charCode = " + this.getChar(evt));
		var elementInput = (evt.srcElement) ? evt.srcElement : evt.currentTarget;
		if(!this.filter(elementInput)){
			var caretPos = getCaretPosition(elementInput);
			elementInput.value = this.value;
			setCaretPosition(elementInput, caretPos);
			return false;
		}
		this.value = elementInput.value;
		MyTooltip.RemoveMyTooltip();
		return true;
	}

	// Set focus to the input element again if input value is NaN.
	// You can call this function during processing of the "onblur", "onfocusout" and "onchange" events of the input element.
	this.isNaN = function(value, elementInput){
//consoleLog("InputKeyFilter.isNaN(...)");
		this.onkeypress = true;
		if(!isNaN(value))
			return false;
			
		this.TextAdd(isRussian() ?
				"Не числовое значение: " + value
				: "number is an illegal number: " + value
			, elementInput);
			
		//do not works in Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=53579
		elementInput.focus();
/*		
		//for compatibility with FireFox https://bugzilla.mozilla.org/show_bug.cgi?id=53579
		if(elementInput.id == ""){
			consoleError("InputKeyFilter.isNaN(...). elementInput.id is empty");
			return;
		}
		setTimeout("document.getElementById(\"" + elementInput.id + "\").focus();", 0);
*/		
		return true;
	}
}//InputKeyFilter

//Negative and positive integer value of the input element is allowed
var intFilter = {
	inputKeyFilter: new InputKeyFilter(
		function(elementInput, value){
			if(value.match(/^(-?\d*)$/) == null){
				this.TextAdd(isRussian() ?
						"Допустимый формат: -[0...9]. Например: -1234 1234"
						: "Acceptable formats: -[0...9]. Examples: -1234 1234"
					, elementInput);
				return false;
			}
			return true;
		}
	)
	
	, onKeyPress: function(evt){
		return this.inputKeyFilter.onKeyPress(evt);
	}
	
	, onKeyUp: function(evt){
		return this.inputKeyFilter.onKeyUp(evt);
	}
	
	, isNaN: function(value, elementInput){
		return this.inputKeyFilter.isNaN(value, elementInput);
	}
}

//Positive integer value of the input element is allowed
var intPositiveFilter = {
	inputKeyFilter: new InputKeyFilter(
		function(elementInput, value){
			if(value.match(/^(\d*)$/) == null){
				this.TextAdd(isRussian() ?
						"Допустимый формат: [0...9]. Например: 1234"
						: "Acceptable formats: [0...9]. Examples: 1234"
					, elementInput);
				return false;
			}
			return true;
		}
	)
	
	, onKeyPress: function(evt){
		return this.inputKeyFilter.onKeyPress(evt);
	}
	
	, onKeyUp: function(evt){
		return this.inputKeyFilter.onKeyUp(evt);
	}
	
	, isNaN: function(value, elementInput){
		return this.inputKeyFilter.isNaN(value, elementInput);
	}
}

//Negative and positive float value of the input element is allowed
var floatFilter = {
	inputKeyFilter: new InputKeyFilter(
		function(elementInput, value){
			if(value.match(/^(-?\d*)((\e(-?\d*)?)?|(\.(\d*)?)?)$/i) == null){
				this.TextAdd(isRussian() ?
						"Допустимый формат: -[0...9].[0...9] или -[0...9]e-[0...9]. Например: -12.34 1234 12e34 -12E-34"
						: "Acceptable formats: -[0...9].[0...9] or -[0...9]e-[0...9]. Examples: -12.34 1234 12e34 -12E-34"
					, elementInput);
				return false;
			}
			return true;
		}
	)
	
	, onKeyPress: function(evt){
		return this.inputKeyFilter.onKeyPress(evt);
	}
	
	, onKeyUp: function(evt){
		return this.inputKeyFilter.onKeyUp(evt);
	}
	
	, isNaN: function(value, elementInput){
		return this.inputKeyFilter.isNaN(value, elementInput);
	}
}
