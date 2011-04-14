<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>jQuery selectBox (select replacement plugin)</title>
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"></script>
		<script type="text/javascript" src="jquery.selectBox.js"></script>
		<link type="text/css" rel="stylesheet" href="jquery.selectBox.css"></script>
		
		<script type="text/javascript">
			
			$(document).ready( function() {
				
				//
				// Enable selectBox control and bind events
				//
				
				$("#create").click( function() {
					$("SELECT").selectBox();
				});
				
				$("#destroy").click( function() {
					$("SELECT").selectBox('destroy');
				});
				
				$("#enable").click( function() {
					$("SELECT").selectBox('enable');
				});
				
				$("#disable").click( function() {
					$("SELECT").selectBox('disable');
				});
				
				$("#serialize").click( function() {
					$("#console").append('<br />-- Serialized data --<br />' + $("FORM").serialize().replace(/&/g, '<br />') + '<br /><br />');
					$("#console")[0].scrollTop = $("#console")[0].scrollHeight;
				});
				
				$("#value-1").click( function() {
					$("SELECT").selectBox('value', 1);
				});
				
				$("#value-2").click( function() {
					$("SELECT").selectBox('value', 2);
				});
				
				$("#value-2-4").click( function() {
					$("SELECT").selectBox('value', [2, 4]);
				});
				
				$("#options").click( function() {
					$("SELECT").selectBox('options', {
						
						'Opt Group 1': {
							'1': 'Value 1',
							'2': 'Value 2',
							'3': 'Value 3',
							'4': 'Value 4',
							'5': 'Value 5'
						},
						'Opt Group 2': {
							'6': 'Value 6',
							'7': 'Value 7',
							'8': 'Value 8',
							'9': 'Value 9',
							'10': 'Value 10'
						},
						'Opt Group 3': {
							'11': 'Value 11',
							'12': 'Value 12',
							'13': 'Value 13',
							'14': 'Value 14',
							'15': 'Value 15'
						}
						
					});
				});
				
				$("#default").click( function() {
					$("SELECT").selectBox('settings', {
						'menuTransition': 'default',
						'menuSpeed' : 0
					});
				});
				
				$("#fade").click( function() {
					$("SELECT").selectBox('settings', {
						'menuTransition': 'fade',
						'menuSpeed' : 'fast'
					});
				});
				
				$("#slide").click( function() {
					$("SELECT").selectBox('settings', {
						'menuTransition': 'slide',
						'menuSpeed' : 'fast'
					});
				});
				
				
				$("SELECT")
					.selectBox()
					.focus( function() {
						$("#console").append('Focus on ' + $(this).attr('name') + '<br />');
						$("#console")[0].scrollTop = $("#console")[0].scrollHeight;
					})
					.blur( function() {
						$("#console").append('Blur on ' + $(this).attr('name') + '<br />');
						$("#console")[0].scrollTop = $("#console")[0].scrollHeight;
					})
					.change( function() {
						$("#console").append('Change on ' + $(this).attr('name') + ': ' + $(this).val() + '<br />');
						$("#console")[0].scrollTop = $("#console")[0].scrollHeight;
					});
				
			});
			
		</script>
		
    </head>
    
    <body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px;">
        
        <form style="background: #FFF; padding: 20px; border: solid 2px #DDD;">
        
	    	<div id="console" style="width: 50%; font-family: 'Courier New', monospace; border: solid 2px #000; background: #000; color: #FFF; height: 350px; overflow: auto; padding: 10px; float: right;"></div>

			<div style="background: #FFFCCC; border: solid 2px #DDD999; padding: 1px 10px; width: 50%; float: right; clear: right; margin: 1em 0;">
				<p><strong>Note</strong></p>
				<p>
					Special thanks to Andrew Becker for providing inspiration and contributions to this project.
				</p>
				<p>
					Refer to <samp><a href="jquery.selectBox.js">jquery.selectBox.js</a></samp>
					for usage, known issues, change log, and more info.
				</p>
				<p>
					<a href="http://abeautifulsite.net/blog/2011/01/jquery-selectbox-plugin/">Go to the project homepage</a>
				</p>
			</div>
			
	        <h1>$("SELECT").selectBox();</h1>
			
	    	<p>
	    		Standard Dropdown<br />
		    	<select name="standard-dropdown">
		    		<option value="1">Item 1</option>
		    		<option value="2">Item 2</option>
		    		<option value="3">Item 3 has &lt;a&gt; really long label but it won't affect the control's display at all</option>
		    		<option value="4">Item 4</option>
		    		<option value="5" disabled="disabled">Item 5 (disabled)</option>
		    		<option value="6">Item 6</option>
		    		<option value="7">Item 7</option>
		    		<option value="8">Item 8</option>
		    		<option value="9">Item 9</option>
		    		<option value="10">Item 10</option>
		    		<option value="11">Item 11</option>
		    		<option value="12">Item 12</option>
		    		<option value="13">Item 13</option>
		    		<option value="14">Item 14</option>
		    		<option value="15" selected="selected">Item 15</option>
		    		<option value="16">Item 16</option>
		    		<option value="17">Item 17</option>
		    		<option value="18">Item 18</option>
		    		<option value="19">Item 19</option>
		    		<option value="20">Item 20</option>
		    	</select>
		    </p>
	    	
	    	<p>
	    		Multi-select Control<br />
		    	<select name="multi-select-control" multiple="multiple">
		    		<option value="1" selected="selected">Item 1</option>
		    		<option value="2">Item 2</option>
		    		<option value="3">Item 3</option>
		    		<option value="4">Item 4</option>
		    		<option value="5" disabled="disabled">Item 5 (disabled)</option>
		    	</select>
		    </p>
	    	
	    	<p>
	    		No multi-select, size = 4<br />
		    	<select name="no-multi-with-size-4" size="4">
		    		<option value="1" selected="selected">Item 1</option>
		    		<option value="2">Item 2</option>
		    		<option value="3">Item 3 has &lt;a&gt; really long label but it won't affect the control's display at all</option>
		    		<option value="4">Item 4</option>
		    		<option value="5" disabled="disabled">Item 5 (disabled)</option>
		    	</select>     	
	    	</p>
	    	
	    	<p>
	    		Standard control with OPTGROUPS<br />
		    	<select name="standard-with-optgroups">
		    		<optgroup label="Section 1">
			    		<option value="1">Item 1</option>
			    		<option value="2">Item 2</option>
			    		<option value="3">Item 3</option>
			    		<option value="4">Item 4</option>
		    		</optgroup>
		    		<optgroup label="Section 2">
			    		<option value="5">Item 5</option>
			    		<option value="6">Item 6</option>
			    		<option value="7">Item 7</option>
			    		<option value="8">Item 8</option>
		    		</optgroup>
		    		<optgroup label="Section 3">
			    		<option value="9">Item 9</option>
			    		<option value="10">Item 10</option>
			    		<option value="11">Item 11</option>
			    		<option value="12">Item 12</option>
		    		</optgroup>
		    		<optgroup label="Section 4">
			    		<option value="13">Item 13</option>
			    		<option value="14">Item 14</option>
			    		<option value="15">Item 15</option>
			    		<option value="16">Item 16</option>
		    		</optgroup>
		    		<optgroup label="Section 5">
			    		<option value="17">Item 17</option>
			    		<option value="18">Item 18</option>
			    		<option value="19">Item 19</option>
			    		<option value="20">Item 20</option>
		    		</optgroup>
		    		<optgroup label="Section 6">
			    		<option value="21">Item 21</option>
			    		<option value="22">Item 22</option>
			    		<option value="23">Item 23</option>
			    		<option value="24">Item 24</option>
		    		</optgroup>
		    	</select>
	    	</p>
	    	
	    	<p>
	    		Multi-select control with OPTGROUPS<br />
		    	<select name="multi-with-optgroups" multiple="multiple">
		    		<optgroup label="Section 1">
			    		<option value="1">Item 1</option>
			    		<option value="2">Item 2</option>
			    		<option value="3">Item 3</option>
			    		<option value="4">Item 4</option>
		    		</optgroup>
		    		<optgroup label="Section 2">
			    		<option value="5">Item 5</option>
			    		<option value="6">Item 6</option>
			    		<option value="7">Item 7</option>
			    		<option value="8">Item 8</option>
		    		</optgroup>
		    		<optgroup label="Section 3">
			    		<option value="9">Item 9</option>
			    		<option value="10">Item 10</option>
			    		<option value="11">Item 11</option>
			    		<option value="12">Item 12</option>
		    		</optgroup>
		    		<optgroup label="Section 4">
			    		<option value="13">Item 13</option>
			    		<option value="14">Item 14</option>
			    		<option value="15">Item 15</option>
			    		<option value="16">Item 16</option>
		    		</optgroup>
		    		<optgroup label="Section 5">
			    		<option value="17">Item 17</option>
			    		<option value="18">Item 18</option>
			    		<option value="19">Item 19</option>
			    		<option value="20">Item 20</option>
		    		</optgroup>
		    		<optgroup label="Section 6">
			    		<option value="21">Item 21</option>
			    		<option value="22">Item 22</option>
			    		<option value="23">Item 23</option>
			    		<option value="24">Item 24</option>
		    		</optgroup>
		    	</select>
	    	</p>	    	
	    	
	        <p>
	        	Big Control Test (2,000 items)<br />
				<select name="big-control">
					<?php
					for( $i = 1; $i <= 2000; $i++ ) echo "<option value=\"$i\">Item $i</option>";
					?>
				</select>
			</p>
			
			<p style="width: 40%; margin-top: 30px; padding-top: 20px; border-top: solid 1px #DDD;">
				Methods:
				<input type="button" id="destroy" value="Destroy" />
				<input type="button" id="create" value="Create" />
				<input type="button" id="enable" value="Enable" />
				<input type="button" id="disable" value="Disable" />
				<input type="button" id="serialize" value="Serialize Form" />
			</p>
			
			<p>
				Values:
				<input type="button" id="value-1" value="Value = 1" />
				<input type="button" id="value-2" value="Value = 2" />
				<input type="button" id="value-2-4" value="Value = [2, 4]" />
				<input type="button" id="options" value="Set New Options" />
			</p>
			
			<p>
				Transitions: 
				<input type="button" id="default" value="Default" />
				<input type="button" id="fade" value="Fade" />
				<input type="button" id="slide" value="Slide" />
			</p>
			
			<div style="clear: both;"></div>
				
    	</form>
    	
    </body>
    
</html>