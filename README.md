<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
    <title>Input Key Filter Test</title>
	<meta name="author" content="Andrej Hristoliubov anhr@mail.ru">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	
	<!-- For compatibility of IE browser with audio element in the beep() function.
	https://www.modern.ie/en-us/performance/how-to-use-x-ua-compatible -->
	<meta http-equiv="X-UA-Compatible" content="IE=9"/>

	<!-- http://stackoverflow.com/questions/17341122/link-and-execute-external-javascript-file-hosted-on-github -->
	<link rel="stylesheet" href="https://rawgit.com/anhr/InputKeyFilter/master/InputKeyFilter.css" type="text/css">		
	<script type="text/javascript" src="https://rawgit.com/anhr/InputKeyFilter/master/Common.js"></script>
	<script type="text/javascript" src="https://rawgit.com/anhr/InputKeyFilter/master/InputKeyFilter.js"></script>
	
</head>
<body>
	Filter the contents of the input element on your web page using JavaScript language.
	You can filter the content as integer number, as float number, or write a custom filter, for example a phone number filter.
	<h1>Input Key Filter Test</h1>
	Integer field: 
	<!-- ATTENTION!!! The "focus out" event is not happens in FireFox, Android 2.3.6, Opera in Windows Phone -->
	<input type="text"
		onchange="javascript: onChangeNumber(this)"
		onfocusout='javascript: onFocusOutNumber(this)'
		onkeypress='return intFilter.onKeyPress(event);'
		onkeyup='intFilter.onKeyUp(event);'/>
		
	<script>
		function onChangeNumber(input){
			MyTooltip.RemoveMyTooltip();
			var integer = parseInt(input.value);
			if(intFilter.isNaN(integer, input))
				return;
			setTimeout(function() { alert("integer = " + integer) }, 0);
		}
		
		function onFocusOutNumber(input){
			intFilter.isNaN(parseInt(input.value), input);
		}
	</script>
	<hr>
	Float field: 
	<input type="text"
		onchange="javascript: onChangeFloat(this)"
		onfocusout='javascript: onFocusOutFloat(this)'
		onkeypress='return floatFilter.onKeyPress(event);'
		onkeyup='floatFilter.onKeyUp(event);'/>
	<script>
		function onChangeFloat(input){
			MyTooltip.RemoveMyTooltip();
			var float = parseFloat(input.value);
			if(floatFilter.isNaN(float, input))
				return;
			setTimeout(function() { alert("float = " + float) }, 0);
		}
		
		function onFocusOutFloat(input){
			floatFilter.isNaN(parseFloat(input.value), input);
		}
	</script>
	<hr>
	Custom filter: 
	<input type="text" value="+()--"
		onchange="javascript: onChangePhoneNumber(this)"
		onfocusout='javascript: onFocusOutPhoneNumber(this)'
		onkeypress='return phoneNumberFilter.onKeyPress(event);'
		onkeyup='phoneNumberFilter.onKeyUp(event);'/>
		Please type a phone number in the +**(***)***-**-** format. Example: +1(23)456-78-90
	<script>
		var phoneNumberFilter = {
			arrayPhoneNumber: null
			
			, inputKeyFilter: new InputKeyFilter(
				function(elementInput, value){
					phoneNumberFilter.arrayPhoneNumber = value.match(/^(\+?\d*)\((\d*)\)(\d*)-?(\d*)-?(\d*)$/);
					if(phoneNumberFilter.arrayPhoneNumber == null){
						this.TextAdd(isRussian() ?
								"������������ ������ ����������� ������"
								: "Incorrect format of the phone number"
							, elementInput);
						if(elementInput.value == "")
							elementInput.value = elementInput.defaultValue;
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
		
		function getPhoneNumber(){
			if(!phoneNumberFilter.arrayPhoneNumber)
				return "";
				
			var phoneNumber =
				  phoneNumberFilter.arrayPhoneNumber[1]
				+ phoneNumberFilter.arrayPhoneNumber[2]
				+ phoneNumberFilter.arrayPhoneNumber[3]
				+ phoneNumberFilter.arrayPhoneNumber[4]
				+ phoneNumberFilter.arrayPhoneNumber[5]
				;
			return phoneNumber;
		}
		
		function onChangePhoneNumber(input){
			MyTooltip.RemoveMyTooltip();
			
			if(!phoneNumberFilter.arrayPhoneNumber || (phoneNumberFilter.arrayPhoneNumber.length != 6)){
				setTimeout(function() { alert("Incorrect format of the phone number") }, 0);
				return;
			}
			
			var phoneNumber = getPhoneNumber();
			
			if(phoneNumberFilter.isNaN(phoneNumber, input))
				return;
				
			setTimeout(function() { alert("phoneNumber = " + phoneNumber) }, 0);
		}
		
		function onFocusOutPhoneNumber(input){
			phoneNumberFilter.isNaN(parseInt(getPhoneNumber()), input);
		}
	</script>
	<hr>
</body>
</html>
