# jQuery selectBox: A styleable replacement for SELECT elements

_Copyright 2011 Cory LaViska for A Beautiful Site, LLC. (http://abeautifulsite.net/)_

_Dual licensed under the MIT / GPLv2 licenses_


## Demo

http://labs.abeautifulsite.net/jquery-selectBox/


## Features

* Supports OPTGROUPS
* Supports standard dropdown controls
* Supports multi-select controls (i.e. multiple="multiple")
* Supports inline controls (i.e. size="5")
* Fully accessible via keyboard
* Shift + click (or shift + enter) to select a range of options in multi-select controls
* Type to search when the control has focus
* Auto-height based on the size attribute (to use, omit the height property in your CSS!)
* Tested in IE7-IE9, Firefox 3-4, recent WebKit browsers, and Opera


## Usage

Link to the JS file:

	<script src="jquery.selectbox.min.js" type="text/javascript"></script>

Add the CSS file (or append contents to your own stylesheet):

	<link href="jquery.selectbox.min.css" rel="stylesheet" type="text/css" />

To create:

	$("SELECT").selectBox([settings]);


## Settings

To specify settings, use this syntax:

	$("SELECT").selectBox('settings', { settingName: value, ... });

### Available settings

* __menuTransition__ _[default,slide,fade]_ - the show/hide transition for dropdown menus
* __menuSpeed__ _[slow,normal,fast]_ - the show/hide transition speed
* __loopOptions__ _[boolean]_ - flag to allow arrow keys to loop through options


## Methods

To call a method use this syntax:

	$("SELECT").selectBox('methodName', [options]);

### Available methods

* __create__ - Creates the control (default)
* __destroy__ - Destroys the selectBox control and reverts back to the original form control
* __disable__ - Disables the control (i.e. disabled="disabled")
* __enable__ - Enables the control
* __value__ - if passed with a value, sets the control to that value; otherwise returns the current value
* __options__ - if passed either a string of HTML or a JSON object, replaces the existing options; otherwise returns the options container element as a jQuery object
* __control__ - returns the selectBox control element (an anchor tag) for working with directly
* __refresh__ - updates the selectBox control's options based on the original controls options


## Events

Events are fired on the original select element. You can bind events like this:

	$("SELECT").selectBox().change( function() { alert( $(this).val() ); } );

### Available events

* __focus__ - Fired when the control gains focus
* __blur__ - Fired when the control loses focus
* __change__ - Fired when the value of a control changes
* __beforeopen__ - Fired before a dropdown menu opens (cancelable)
* __open__ - Fired after a dropdown menu opens (not cancelable)
* __beforeclose__ - Fired before a dropdown menu closes (cancelable)
* __close__ - Fired after a dropdown menu closes (not cancelable)

### Known Issues

* The blur and focus callbacks are not very reliable in IE7. The change callback works fine.
