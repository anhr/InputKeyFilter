Cross-browser content filter of the text input element on your web page, using JavaScript language. You can filter the content as integer number, as float number, or write a custom filter, for example a phone number filter.

Example: https://googledrive.com/host/0B5hS0tFSGjBZfkhKS1VobnFDTkJKR0tVamxadmlvTmItQ2pxVWR0WDZPdHZxM2hzS1J3ejQ/InputKeyFilter/

My filter successfully tested on browsers:

IE6 and IE8. No beep: 'Audio' is undefined. See http://caniuse.com/#feat=audio for details

IE11

Chrome 43

Opera 30

Safari 5.1.7

FireFox 39. The "focus out" event is not happens.


The "key press" event is not happens in Android if you press a russian letter. see http://stackoverflow.com/questions/9302986/no-keypress-events-for-certain-keys-in-android-browser

Android 5.0 Chrome.

Android 5.0 Internet in Samsung Galaxy S5. The "key press" event is not happens.

Android 2.3.6. The "focus out" event is not happens.


Opera in Windows Phone. The "focus out" event is not happens. No beep.

IE in Windows Phone. No beep.