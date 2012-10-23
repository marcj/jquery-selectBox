/*
 *  jQuery selectBox - A cosmetic, styleable replacement for SELECT elements
 *
 *  Copyright 2012 Cory LaViska for A Beautiful Site, LLC.
 *
 *  https://github.com/claviska/jquery-selectBox
 *
 *  Licensed under both the MIT license and the GNU GPLv2 (same as jQuery: http://jquery.org/license)
 *
 */
if (jQuery)(function($) {
	$.extend($.fn, {
		selectBox: function(method, data) {
			var typeTimer, typeSearch = '',
				isMac = navigator.platform.match(/mac/i);
			//
			// Private methods
			//
			var init = function(select, data) {
					// Disable for iOS devices (their native controls are more suitable for a touch device)
					if (navigator.userAgent.match(/iPad|iPhone|Android|IEMobile|BlackBerry/i)) return false;
					// Element must be a select control
					if (select.tagName.toLowerCase() !== 'select') return false;
					select = $(select);
					if (select.data('selectBox-control')) return false;
					var control = $('<a class="selectBox" />'),
						options,
						settings = data || {},
						multiple = !!select.attr('multiple'),
						inline = multiple || parseInt(select.attr('size')) > 1,
						lastSelected,
						formLabel, 
						ariaLabelledBy = ''; 
					select.data('_tmp',0); /* Add temporary data so that $.expando variable gets created, which provides an id for the select box */
					control
						.width(select.outerWidth())
						.addClass(select.attr('class'))
						.attr('id','selectBox-control-'+(select.attr('id') ? select.attr('id') : select[0][$.expando]))
						.attr('tabindex', parseInt(select.attr('tabindex')))
						.css('display', 'inline-block')
						.bind('focus.selectBox', function() {
							if (this !== document.activeElement && document.body !== document.activeElement) $(document.activeElement).blur();
							if (control.hasClass('selectBox-active')) return;
							control.addClass('selectBox-active');
							if (control.data('selectBox-last-selected')) addHover(select,control.data('selectBox-last-selected'));
							select.trigger('focus');
						})
						.bind('blur.selectBox', function() {
							if (!control.hasClass('selectBox-active')) return;
							control.removeClass('selectBox-active').removeClass('selectBox-multiselect');
							select.trigger('blur');
						});
					if (!$(window).data('selectBox-bindings')) {
						$(window).data('selectBox-bindings', true).bind('scroll.selectBox', hideMenus).bind('resize.selectBox', hideMenus);
					}
					
					// Add title to control, but only if attribute exists on the select */
					if (select.attr('title')) control.attr('title', select.attr('title')); 
					// Add selectBox-disabled class and aria-disabled attribute to control if disabled attribute exists
					if (select.attr('disabled')) control.addClass('selectBox-disabled').attr('aria-disabled',true); 
					
					// Find any labels associated with the select, give them id's if neccessary, and add them to the control using aria-labelledby attribute.			
					$( 'label[for="'+select.attr('id')+'"]' )
						.each(function(index, element) {
							if (!element.id) element.id = control.attr('id')+'-label'+index;
							ariaLabelledBy = control.attr('aria-labelledby')||'';
							ariaLabelledBy = ariaLabelledBy.length ? ariaLabelledBy+' '+element.id : element.id;
							control.attr('aria-labelledby',ariaLabelledBy)
						});	
					
					// Find any parent label of the select, give it an id if neccessary, and add it to the control using aria-labelledby attribute.
					select.closest('label')
						.each(function(index, element) {
							if (!element.id) element.id = control.attr('id')+'-label'+index;
							ariaLabelledBy = control.attr('aria-labelledby')||'';
							ariaLabelledBy = ariaLabelledBy.length?ariaLabelledBy+' '+element.id:element.id;
							control.attr('aria-labelledby',ariaLabelledBy)
						});
					
					// If the select has an aria-labelledby attribute, append it to the controls's aria-labelledby attribute.
					if (select.attr('aria-labelledby'))
					{
						ariaLabelledBy = control.attr('aria-labelledby')||'';
						ariaLabelledBy = ariaLabelledBy.length ? ariaLabelledBy+' '+select.attr('aria-labelledby') : select.attr('aria-labelledby');
						control.attr('aria-labelledby',ariaLabelledBy);
					}
					
					// If the select has an aria-label attribute, add it to the control.
					if (select.attr('aria-label')) control.attr('aria-label',select.attr('aria-label'));
					
					// Focus on control when label is clicked
					select.bind('click.selectBox', function(event) {
						control.focus();
						event.preventDefault();
					});
					
					// Generate control
					if (inline) {
						//
						// Inline controls
						//
						options = getOptions(select, 'inline');
						control
							.attr('role','listbox')
							.attr('aria-multiselectable',multiple)
							.append(options)
							.data('selectBox-options', options)
							.addClass('selectBox-inline selectBox-menuShowing')
							.bind('keydown.selectBox', function(event) {
								handleKeyDown(select, event);
							})
							.bind('keypress.selectBox', function(event) {
								handleKeyPress(select, event);
							})
							.bind('mousedown.selectBox', function(event) {
								if ($(event.target).is('A.selectBox-inline')) event.preventDefault();
								if (!control.hasClass('selectBox-active')) control.focus();
							})
							.insertAfter(select);
						// Auto-height based on size attribute
						if (!select[0].style.height) {
							var size = select.attr('size') ? parseInt(select.attr('size')) : 5;
							// Draw a dummy control off-screen, measure, and remove it
							var tmp = control.clone().removeAttr('id').css({
								position: 'absolute',
								top: '-9999em'
							}).show().appendTo('body');
							tmp.find('.selectBox-options').html('<li><a>\u00A0</a></li>');
							var optionHeight = parseInt(tmp.find('.selectBox-options A:first').html('&nbsp;').outerHeight());
							tmp.remove();
							control.height(optionHeight * size);
						}
						disableSelection(control);
					} else {
						//
						// Dropdown controls
						//
						var label = $('<span class="selectBox-label" />'),
							arrow = $('<span class="selectBox-arrow"><span class="selectBox-arrow-icon"></span></span>');
						// Update label
						label.attr('id','selectBox-label-'+control.attr('id'))
							.attr('class', getLabelClass(select))
							.text(getLabelText(select));
						options = getOptions(select, 'dropdown');
						// Include the label as part of the control's label
						ariaLabelledBy = ariaLabelledBy.length?label.attr('id')+' '+ariaLabelledBy:label.attr('id'); 
						control
							.attr('role', 'combobox')
							.attr('aria-readonly', true)
							.attr('aria-expanded', false)
							.attr('aria-owns', 'selectBox-dropdown-menu-'+(select.attr('id') ? select.attr('id') : select[0][$.expando]))
							.attr('aria-labelledby', ariaLabelledBy)
							.data('selectBox-options', options)
							.addClass('selectBox-dropdown')
							.append(label)
							.append(arrow)
							.bind('mousedown.selectBox', function(event) {
								if (control.hasClass('selectBox-menuShowing')) {
									hideMenus();
								} else {
									event.stopPropagation();
									// Webkit fix to prevent premature selection of options
									options.data('selectBox-down-at-x', event.screenX).data('selectBox-down-at-y', event.screenY);
									showMenu(select);
								}
							})
							.bind('keydown.selectBox', function(event) {
								handleKeyDown(select, event);
							})
							.bind('keypress.selectBox', function(event) {
								handleKeyPress(select, event);
							})
							.bind('open.selectBox', function(event, triggerData) {
								if (triggerData && triggerData._selectBox === true) return;
								showMenu(select);
							})
							.bind('close.selectBox', function(event, triggerData) {
								if (triggerData && triggerData._selectBox === true) return;
								hideMenus();
							})
							.insertAfter(select);
						
						// Options are added to the DOM immediately after the control
						options.attr('aria-labelledby',ariaLabelledBy)
							.insertAfter(control);
																		
						// Set label width
						var labelWidth = control.width() - arrow.outerWidth() - parseInt(label.css('paddingLeft')) - parseInt(label.css('paddingLeft'));
						label.width(labelWidth);
						disableSelection(control);
					}
					
					// Store data for later use and show the control
					select.removeData('_tmp')
						.addClass('selectBox')
						.data('selectBox-control', control)
						.data('selectBox-settings', settings)
						.hide();
						
					// Store the last selected element to set cursor index position 
					lastSelected = options.find('.selectBox-selected').last();
					if (lastSelected.length) {
						control.data('selectBox-last-selected',lastSelected);
						control.attr('aria-activedescendant',lastSelected.attr('id'));
						keepOptionInView(select, lastSelected, true);
					}
				};
			var getOptions = function(select, type) {
					var options, option, i=0
					/* Private function to handle recursion in the getOptions function. */
						_getOptions = function(select, options) {
							// Loop through the set in order of element children.
							select.children('OPTION, OPTGROUP').each(function() {
								// If the element is an option, add it to the list.
								if ($(this).is('OPTION')) {
									var parentNode =$(this).parent().is('OPTGROUP') ? options.find('.selectBox-optgroup:last ul') : options;
									// Check for a value in the option found.
									if ($(this).length > 0) {
										// Create an option for the found element.
										option = generateOption($(this), parentNode);
										option.find('A').attr('id',options.attr('id')+'-'+(i++));
									} else {
										// No option information found, so add an empty.
										parentNode.append('<li role="presentation"><a>\u00A0</a></li>')
									}
								} else {
									// If the element is an option group, add the group and call this function on it.
									// The optgroup heading is a span element which labels a nested list containing the options.
									i++;
									var optgroup = $('<li id="selectBox-optgroup-'+i+'" class="selectBox-optgroup" role="presentation" />')
									.append('<span id="selectBox-optgroup-'+i+'-label">'+$(this).attr('label')+'</span>')
									.append('<ul aria-labelledby="selectBox-optgroup-'+i+'-label"></ul>');
									options.append(optgroup);
									options = _getOptions($(this), options);
								}
							});
							// Return the built string
							return options;
						};
					switch (type) {
					case 'inline':
						options = $('<ul class="selectBox-options" role="presentation" />');
						options.attr('id','selectBox-menu-'+(select.attr('id')?select.attr('id'):select[0][$.expando]));
						options = _getOptions(select, options);
						options.find('A')
							.bind('mouseover.selectBox', function(event) {
								addHover(select, $(this).parent());
							})
							.bind('mouseout.selectBox', function(event) {
								removeHover(select, $(this).parent());
							})
							.bind('mousedown.selectBox', function(event) {
								event.preventDefault(); // Prevent options from being "dragged"
								if (!select.selectBox('control').hasClass('selectBox-active')) select.selectBox('control').focus();
							})
							.bind('mouseup.selectBox', function(event) {
								hideMenus();
								addHover(select, $(this).parent());
								selectOption(select, $(this).parent(), event);
								keepOptionInView(select, $(this).parent());
							});
						disableSelection(options);
						return options;
					case 'dropdown':
						options = $('<ul class="selectBox-dropdown-menu selectBox-options" role="listbox" />');
						options.attr('id','selectBox-dropdown-menu-'+(select.attr('id')?select.attr('id'):select[0][$.expando]));
						options = _getOptions(select, options);
						options.data('selectBox-select', select).css('display','none').find('A')
							.bind('mousedown.selectBox', function(event) {
								event.preventDefault(); // Prevent options from being "dragged"
								if (event.screenX === options.data('selectBox-down-at-x') && event.screenY === options.data('selectBox-down-at-y')) {
									options.removeData('selectBox-down-at-x').removeData('selectBox-down-at-y');
									hideMenus();
								}
							})
							.bind('mouseup.selectBox', function(event) {
								if (event.screenX === options.data('selectBox-down-at-x') && event.screenY === options.data('selectBox-down-at-y')) {
									return;
								} else {
									options.removeData('selectBox-down-at-x').removeData('selectBox-down-at-y');
								}
								selectOption(select, $(this).parent(), event);
								hideMenus();
							})
							.bind('mouseover.selectBox', function(event) {
								addHover(select, $(this).parent());
							})
							.bind('mouseout.selectBox', function(event) {
								removeHover(select, $(this).parent());
							});
						// Inherit classes for dropdown menu
						var classes = select.attr('class') || '';
						if (classes !== '') {
							classes = classes.split(' ');
							for (var i in classes) options.addClass(classes[i] + '-selectBox-dropdown-menu');
						}
						disableSelection(options);
						return options;
					}
				};
			var getLabelClass = function(select) {
					var selected = $(select).find('OPTION:selected');
					return ('selectBox-label ' + (selected.attr('class') || '')).replace(/\s+$/, '');
				};
			var getLabelText = function(select) {
					var selected = $(select).find('OPTION:selected');
					return selected.text() || '\u00A0';
				};
			var setLabel = function(select) {
					select = $(select);
					var control = select.data('selectBox-control');
					if (!control) return;
					control.find('.selectBox-label').attr('class', getLabelClass(select)).text(getLabelText(select));
				};
			var destroy = function(select) {
					select = $(select);
					var control = select.data('selectBox-control');
					if (!control) return;
					var options = control.data('selectBox-options');
					options.remove();
					control.remove();
					select.removeClass('selectBox').removeData('selectBox-control').data('selectBox-control', null).removeData('selectBox-settings').data('selectBox-settings', null).show();
				};
			var refresh = function(select) {
					select = $(select);
					select.selectBox('options', select.html());
				};
			var showMenu = function(select) {
					select = $(select);
					var control = select.data('selectBox-control'),
						settings = select.data('selectBox-settings'),
						options = control.data('selectBox-options');
					if (control.hasClass('selectBox-disabled')) return false;
					hideMenus();
					var borderBottomWidth = isNaN(control.css('borderBottomWidth')) ? 0 : parseInt(control.css('borderBottomWidth'));
					// Menu position
					options.width(control.innerWidth()).css({
						top: control.offset().top + control.outerHeight() - borderBottomWidth,
						left: control.offset().left
					});
					if (select.triggerHandler('beforeopen')) return false;
					var dispatchOpenEvent = function() {
							select.triggerHandler('open', {
								_selectBox: true
							});
						};
					// Show menu
					switch (settings.menuTransition) {
					case 'fade':
						options.fadeIn(settings.menuSpeed, dispatchOpenEvent);
						break;
					case 'slide':
						options.slideDown(settings.menuSpeed, dispatchOpenEvent);
						break;
					default:
						options.show(settings.menuSpeed, dispatchOpenEvent);
						break;
					}
					if (!settings.menuSpeed) dispatchOpenEvent();
					// Center on selected option
					var li = control.data('selectBox-last-selected') ? control.data('selectBox-last-selected') : options.find('.selectBox-selected:last');
					keepOptionInView(select, li, true);
					addHover(select, li);
					control.addClass('selectBox-menuShowing').attr('aria-expanded',true);
					$(document).bind('mousedown.selectBox', function(event) {
						if ($(event.target).parents().andSelf().hasClass('selectBox-options')) return;
						hideMenus();
					});
				};
			var hideMenus = function() {
					if ($(".selectBox-dropdown-menu:visible").length === 0) return;
					$(document).unbind('mousedown.selectBox');
					$(".selectBox-dropdown-menu").each(function() {
						var options = $(this),
							select = options.data('selectBox-select'),
							control = select.data('selectBox-control'),
							settings = select.data('selectBox-settings'),
							lastSelected =options.find('.selectBox-selected');
						if (select.triggerHandler('beforeclose')) return false;
						var dispatchCloseEvent = function() {
								select.triggerHandler('close', {
									_selectBox: true
								});
							};
						// Restore last selected as active descendant
						control.data('selectBox-last-selected', lastSelected).attr('aria-expanded',false).attr('aria-activedescendant',lastSelected.find('A').attr('id'));
						options.attr('aria-activedescendant',control.attr('aria-activedescendant'));
						if (settings) {
							switch (settings.menuTransition) {
							case 'fade':
								options.fadeOut(settings.menuSpeed, dispatchCloseEvent);
								break;
							case 'slide':
								options.slideUp(settings.menuSpeed, dispatchCloseEvent);
								break;
							default:
								options.hide(settings.menuSpeed, dispatchCloseEvent);
								break;
							}
							if (!settings.menuSpeed) dispatchCloseEvent();
							control.removeClass('selectBox-menuShowing');
						} else {
							$(this).hide();
							$(this).triggerHandler('close', {
								_selectBox: true
							});
							$(this).removeClass('selectBox-menuShowing');
						}
					});
				};
			var selectOption = function(select, li, event) {
					select = $(select);
					li = $(li);
					var control = select.data('selectBox-control'),
						settings = select.data('selectBox-settings'),
						options = control.data('selectBox-options'),
						lis = options.find('li:not(.selectBox-optgroup, .selectBox-disabled)'),
						lastSelected = control.data('selectBox-last-selected'),
						dir = -1,
						affectedOptions,
						selectedOptions;
					if (control.hasClass('selectBox-disabled')) return false;
					if (li.length === 0 || li.hasClass('selectBox-disabled')) return false;
					if (select.attr('multiple')) {
						// If event.shiftKey is true, this will select all options between li and the last li selected
						if (event.shiftKey && lastSelected) {
							li.toggleClass('selectBox-selected');
							if (li.hasClass('selectBox-selected')) {
								li.find('A').attr('aria-selected',true);
							} else {
								li.find('A').removeAttr('aria-selected');
							}
							var affectedOptions;
							if (lis.index(li) > lis.index(lastSelected)) {
								affectedOptions = lis.slice(lis.index(lastSelected), lis.index(li));
							} else {
								affectedOptions = lis.slice(lis.index(li), lis.index(lastSelected)+1);
							}
							affectedOptions = affectedOptions.not('.selectBox-optgroup, .selectBox-disabled');
							if (li.hasClass('selectBox-selected')) {
								affectedOptions.addClass('selectBox-selected').find('A').attr('aria-selected',true);
							} else {
								affectedOptions.removeClass('selectBox-selected').find('A').removeAttr('aria-selected');
							}
							if (event.type=='keydown')
							{
								switch (event.keyCode)
								{
									case 37: // left
									case 38: // up
									{
										dir = 1;
										break;
									}
									case 39: // right
									case 40: // down
									{
										dir = 0;
										break;
									}
								}
															
								if (affectedOptions.index(lastSelected)==dir)
								{
									if (li.hasClass('selectBox-selected') && !lastSelected.hasClass('selectBox-selected')) {
										li.removeClass('selectBox-selected').find('A').removeAttr('aria-selected');
									} else {
										li.addClass('selectBox-selected').find('A').attr('aria-selected',true);
									}
								}
								
								if (event.keyCode != 13 && event.keyCode != 32)
								{
									/*
									 * The following block restricts selection with the shiftKey to contiguous selection
									 */
									selectedOptions = options.find('.selectBox-selected');
									
									var startSelected = selectedOptions.index(li), /* the index current selection within array of selected options */
										startLi = lis.index(li), /* the index of the current selection within all selectable options */ 
										lastIndex = startLi, /* the last index for comparison */
										testIndex, /* the current index for comparison */
										i, /* an iterator */ 
										contiguous=true /* boolean indication of contiguous selection */;
									
									/* first loop backwards through selected elements 
									   before the current selection */
									for(i=startSelected; i>=0; i--)
									{
										testIndex = lis.index(selectedOptions.eq(i));
										/* if the distance between the current selected option 
										   and the last selected option is greater than 1, they are not contiguous */ 
										if (Math.abs(testIndex-lastIndex)>1) 
											contiguous = false;
										/* if they're are not contiguous, any previous selections should be deselected */ 
										if (!contiguous)
											selectedOptions.eq(i).removeClass('selectBox-selected').find('A').removeAttr('aria-selected');
										lastIndex = testIndex; 
									}
									
									/* next, reset contiguous to true and loop forward through selected elements
									   starting with the current selection */
									contiguous=true;
									lastIndex=startLi;
									for(i=startSelected; i<selectedOptions.length; i++)
									{
										testIndex = lis.index(selectedOptions.eq(i))
										/* if the distance between the current selected option 
										   and the last selected option is greater than 1, they are not contiguous */ 
										if (Math.abs(testIndex-lastIndex)>1)
											contiguous = false;
										/* if they're are not contiguous, any further selections should be deselected */ 
										if (!contiguous)
											selectedOptions.eq(i).removeClass('selectBox-selected').find('A').removeAttr('aria-selected');
										lastIndex = testIndex; 
									}
								}
							}													
						} else if ((isMac && event.metaKey) 
									|| (!isMac && event.ctrlKey) 
									|| control.hasClass('selectBox-multiselect') /* SHIFT+F8 multiselect mode toggled */) {
							if (event.type!='keydown' /* CTRL+CLICK */
								|| (event.keyCode==13 /* CTRL+ENTER */ || event.keyCode==32 /* CTRL+SPACE */  || event.keyCode==65 /* CTRL+A */)) {
								if (event.keyCode==65) {
									li.addClass('selectBox-selected');
								} else {
									li.toggleClass('selectBox-selected');
								}
								if (li.hasClass('selectBox-selected')) {
									li.find('A').attr('aria-selected',true);
								} else {
									li.find('A').removeAttr('aria-selected');
								}
							}
						} else {
							lis.removeClass('selectBox-selected').find('A').removeAttr('aria-selected');
							li.addClass('selectBox-selected').find('A').attr('aria-selected',true);
						}
					} else if (event.type!='keydown' || !((isMac && event.metaKey) || (!isMac && event.ctrlKey))) {
						lis.removeClass('selectBox-selected').find('A').removeAttr('aria-selected');
						li.addClass('selectBox-selected').find('A').attr('aria-selected',true);
					}
					// Update the control's label
					if (control.hasClass('selectBox-dropdown') && li.hasClass('selectBox-selected')) {
						control.find('.selectBox-label').text(li.text());
					}
					// Update original control's value
					var i = 0,
						selection = [];
					if (select.attr('multiple')) {
						control.find('.selectBox-selected A').each(function() {
							selection[i++] = $(this).attr('rel');
						});
					} else {
						selection = options.find('.selectBox-selected A').attr('rel');
					}
					// Remember most recently selected item
					control.data('selectBox-last-selected', li).attr('aria-activedescendant',li.find('A').attr('id'));
					options.attr('aria-activedescendant',control.attr('aria-activedescendant'));
					// Change callback
					if (select.val() !== selection) {
						select.val(selection);
						setLabel(select);
						select.trigger('change');
					}
					return true;
				};
			var addHover = function(select, li) {
					select = $(select);
					li = $(li);
					var control = select.data('selectBox-control'),
						options = control.data('selectBox-options');
					options.find('.selectBox-hover').removeClass('selectBox-hover');
					li.addClass('selectBox-hover');
				};
			var removeHover = function(select, li) {
					select = $(select);
					li = $(li);
					var control = select.data('selectBox-control'),
						options = control.data('selectBox-options');
					options.find('.selectBox-hover').removeClass('selectBox-hover');
				};
			var keepOptionInView = function(select, li, center) {
					if (!li || li.length === 0) return;
					select = $(select);
					var control = select.data('selectBox-control'),
						options = control.data('selectBox-options'),
						scrollBox = control.hasClass('selectBox-dropdown') ? options : options.parent(),
						top = parseInt(li.offset().top - scrollBox.position().top),
						bottom = parseInt(top + li.outerHeight());
					if (center) {
						scrollBox.scrollTop(li.offset().top - scrollBox.offset().top + scrollBox.scrollTop() - (scrollBox.height() / 2));
					} else {
						if (top < 0) {
							scrollBox.scrollTop(li.offset().top - scrollBox.offset().top + scrollBox.scrollTop());
						}
						if (bottom > scrollBox.height()) {
							scrollBox.scrollTop((li.offset().top + li.outerHeight()) - scrollBox.offset().top + scrollBox.scrollTop() - scrollBox.height());
						}
					}
				};
			var handleKeyDown = function(select, event) {
					//
					// Handles open/close and arrow key functionality
					//
					select = $(select);
					var control = select.data('selectBox-control'),
						options = control.data('selectBox-options'),
						settings = select.data('selectBox-settings'),
						totalOptions = 0,
						i = 0,
						currentIndex = 0,						
						selectableOptions = options.find('LI:not(.selectBox-optgroup, .selectBox-disabled)'),
						lis = options.find('LI'),
						lastSelected = control.data('selectBox-last-selected'),
						lastHovered = options.find('.selectBox-hover:first'),
						multiple = !!select.attr('multiple'),
						pageHeight, optionHeight, size;
					if (control.hasClass('selectBox-disabled')) return;				
					switch (event.keyCode) {
					case 8:
						// backspace
						event.preventDefault();
						typeSearch = '';
						break;
					case 9:
						// tab
					case 27:
						// esc
						hideMenus();
						removeHover(select);
						control.focus();
						break;
					case 13:
						// enter
						if (control.hasClass('selectBox-menuShowing')) {
							event.preventDefault();
							selectOption(select, lastHovered, event);
							keepOptionInView(select, lastHovered);
							if (control.hasClass('selectBox-dropdown'))
							{
								 hideMenus();
								 control.focus();
							}
						} else {
							showMenu(select);
						}
						break;
					case 32:
						// space
						if (control.hasClass('selectBox-menuShowing')) {
							event.preventDefault();
							selectOption(select, lastHovered, event);
							keepOptionInView(select, lastHovered);
						}
						break;
					case 33:
						// page up
						event.preventDefault();
						currentIndex = lastSelected ? lis.index(lastSelected) : lis.index(options.find('.selectBox-hover'));
						pageHeight = control.hasClass('selectBox-dropdown') ? options.height() : control.height();
						optionHeight = parseInt(options.find('A:first').outerHeight());
						size = (select.attr('size')) ? parseInt(select.attr('size')) : Math.floor(pageHeight/optionHeight);
						console.log("{pageHeight:"+pageHeight+"px, optionHeight:"+optionHeight+"px, size:"+size+"}");
						var newIndex = Math.max(0, currentIndex-size),
							prev = lis.eq(newIndex);
						totalOptions = lis.length;
						i = newIndex;
						while (prev.length === 0 || prev.hasClass('selectBox-disabled') || prev.hasClass('selectBox-optgroup')) {
							prev = lis.eq(i-1);
							if (prev.length === 0 || i<=0) {
								prev = selectableOptions.eq(0);										
							}
							if (--i <= 0) break;
						}
						addHover(select, prev);			
						selectOption(select, prev, event);
						keepOptionInView(select, prev);
						break;
					case 34:
						// page down
						event.preventDefault();
						currentIndex = lastSelected ? lis.index(lastSelected) : lis.index(options.find('.selectBox-hover'));
						pageHeight = control.hasClass('selectBox-dropdown') ? options.height() : control.height();
						optionHeight = parseInt(options.find('A:first').outerHeight());
						size = (select.attr('size')) ? parseInt(select.attr('size')) : Math.floor(pageHeight/optionHeight);
						var newIndex = Math.min(lis.length-1, currentIndex+size),
							next = lis.eq(newIndex);
						totalOptions = lis.length;
						i = newIndex;
						while (next.length === 0 || next.hasClass('selectBox-disabled') || next.hasClass('selectBox-optgroup')) {
							next = lis.eq(i+1);
							if (next.length === 0 || i>=(totalOptions-1)) {
								next = selectableOptions.eq(selectableOptions.length-1);										
							}
							if (++i >= totalOptions) break;
						}
						addHover(select, next);
						selectOption(select, next, event);
						keepOptionInView(select, next);
						break;
					case 35:
						// end
						event.preventDefault();
						addHover(select, selectableOptions.last());			
						selectOption(select, selectableOptions.last(), event);
						keepOptionInView(select, selectableOptions.last());
						break;
					case 36:
						// home
						event.preventDefault();
						addHover(select, selectableOptions.first());			
						selectOption(select, selectableOptions.first(), event);
						keepOptionInView(select, selectableOptions.first());
						break;
					case 38:
						// up
					case 37:
						// left
						event.preventDefault();
						if (control.hasClass('selectBox-menuShowing') && !event.altKey) {
							currentIndex = lastSelected ? selectableOptions.index(lastSelected) : selectableOptions.index(options.find('.selectBox-hover'));
							
							if (currentIndex == 0 
								&& (!settings.loopOptions || select.attr('multiple'))) break;
							
							var prev = selectableOptions.eq(currentIndex-1);
							totalOptions = selectableOptions.length;
							i = currentIndex-1;
							while (prev.length === 0 || prev.hasClass('selectBox-disabled') || prev.hasClass('selectBox-optgroup')) {
								prev = selectableOptions.eq(i-1);
								if (prev.length === 0) {
									if (settings.loopOptions) {
										prev = selectableOptions.eq(selectableOptions.length-1);
									} else {
										prev = selectableOptions.eq(0);
									}
									break;
								}
								if (--i <= 0) break;
							}
							
							addHover(select, prev);			
							selectOption(select, prev, event);
							keepOptionInView(select, prev);
						} else if (event.altKey) {
							hideMenus();
						} else {
							showMenu(select);
						}
						break;
					case 40:
						// down
					case 39:
						// right
						event.preventDefault();
						if (control.hasClass('selectBox-menuShowing')) {
							currentIndex = lastSelected ? selectableOptions.index(lastSelected) : selectableOptions.index(options.find('.selectBox-hover'));
							
							if (currentIndex == selectableOptions.length-1 
								&& (!settings.loopOptions || select.attr('multiple'))) break;
							
							var next = selectableOptions.eq(currentIndex+1);
							totalOptions = selectableOptions.length;
							i = currentIndex+1;
							while (next.length === 0 || next.hasClass('selectBox-disabled') || next.hasClass('selectBox-optgroup')) {
								next = selectableOptions.eq(i+1);
								if (next.length === 0) {
									if (settings.loopOptions) {
										next = selectableOptions.eq(0);
									} else {
										next = selectableOptions.eq(selectableOptions.length-1);										
									}
								}
								if (++i >= totalOptions) break;
							}
							addHover(select, next);
							selectOption(select, next, event);
							keepOptionInView(select, next);
						} else {
							showMenu(select);
						}
						break;
					case 119:
						// F8
						if (multiple && event.shiftKey)
						{
							event.preventDefault();
							control.toggleClass('selectBox-multiselect');
						}
						break;
					
					case 65:
						if (multiple && ((isMac && event.metaKey) || (!isMac && event.ctrlKey)))
						{
							// CTRL+A
							event.preventDefault();
							event.stopPropagation();
							selectableOptions.not(lastHovered).each(function(index, element) {
								selectOption(select, $(element), event);
							});
							addHover(select, lastHovered);
							selectOption(select, lastHovered, event);
							keepOptionInView(select, lastHovered);
						}
						break;
					}
					
				};
			var handleKeyPress = function(select, event) {
					//
					// Handles type-to-find functionality
					//
					select = $(select);
					var control = select.data('selectBox-control'),
						options = control.data('selectBox-options'),
						i = 0,
						start = 0,
						o,
						label,
						found = false,
						selectableOptions = options.find('LI:not(.selectBox-optgroup, .selectBox-disabled)'),
						lastHovered = options.find('.selectBox-hover'),
						newString = String.fromCharCode(event.charCode || event.keyCode);
					if (control.hasClass('selectBox-disabled')) return;
					switch (event.keyCode) {
					case 9:
						// tab
					case 27:
						// esc
					case 13:
						// enter
					case 32:
						// space
					case 38:
						// up
					case 37:
						// left
					case 40:
						// down
					case 39:
						// right
						// Don't interfere with the keydown event!
						break;
					default:
						// Type to find
						if (!control.hasClass('selectBox-menuShowing')) showMenu(select);
						event.preventDefault();
						clearTimeout(typeTimer);
						typeSearch += newString!=typeSearch ? newString : '';					
						for (i=0; i<selectableOptions.length; i++)
						{
							o = selectableOptions.eq(i);
							if (o.is(lastHovered)) {
								start = (typeSearch.length==1) ? i+1 : i;
								break;
							}
						}
						
						for (i = start; i < selectableOptions.length; i++) {
							o = selectableOptions.eq(i);
							label = o.text();
							if (label.substring(0, typeSearch.length).toLowerCase() === typeSearch.toLowerCase())
							{
								found = true;
								addHover(select, o);
								keepOptionInView(select, o);
								break;
							}
						}
						if (!found)
						{
							for (i = 0; i < start; i++) {
								o = selectableOptions.eq(i);
								label = o.text();
								if (label.substring(0, typeSearch.length).toLowerCase() === typeSearch.toLowerCase())
								{
									addHover(select, o);
									keepOptionInView(select, o);
									break;
								}
							}
						}

						// Clear after a brief pause
						typeTimer = setTimeout(function() {
							typeSearch = '';
						}, 1000);
						break;
					}
				};
			var enable = function(select) {
					select = $(select);
					select.attr('disabled', false);
					var control = select.data('selectBox-control');
					if (!control) return;
					control.removeClass('selectBox-disabled').removeAttr('aria-disabled');
				};
			var disable = function(select) {
					select = $(select);
					select.attr('disabled', true);
					var control = select.data('selectBox-control');
					if (!control) return;
					control.addClass('selectBox-disabled').attr('aria-disabled',true);
				};
			var setValue = function(select, value) {
					select = $(select);
					select.val(value);
					value = select.val(); // IE9's select would be null if it was set with a non-exist options value
					if (value === null) { // So check it here and set it with the first option's value if possible
						value = select.children().first().val();
						select.val(value);
					}
					var control = select.data('selectBox-control');
					if (!control) return;
					var settings = select.data('selectBox-settings'),
						options = control.data('selectBox-options');
					// Update label
					setLabel(select);
					// Update control values
					options.find('.selectBox-selected').removeClass('selectBox-selected').find('A').removeAttr('aria-selected');
					options.find('A').each(function() {
						if (typeof(value) === 'object') {
							for (var i = 0; i < value.length; i++) {
								if ($(this).attr('rel') == value[i]) {
									$(this).attr('aria-selected',true).parent().addClass('selectBox-selected');
								}
							}
						} else {
							if ($(this).attr('rel') == value) {
								$(this).attr('aria-selected',true).parent().addClass('selectBox-selected');
							}
						}
					});
					if (settings.change) settings.change.call(select);
				};
			var setOptions = function(select, options) {
					select = $(select);
					var control = select.data('selectBox-control'),
						settings = select.data('selectBox-settings');
					switch (typeof(data)) {
					case 'string':
						select.html(data);
						break;
					case 'object':
						select.html('');
						for (var i in data) {
							if (data[i] === null) continue;
							if (typeof(data[i]) === 'object') {
								var optgroup = $('<optgroup label="' + i + '" />');
								for (var j in data[i]) {
									optgroup.append('<option value="' + j + '">' + data[i][j] + '</option>');
								}
								select.append(optgroup);
							} else {
								var option = $('<option value="' + i + '">' + data[i] + '</option>');
								select.append(option);
							}
						}
						break;
					}
					if (!control) return;
					// Remove old options
					control.data('selectBox-options').remove();
					// Generate new options
					var type = control.hasClass('selectBox-dropdown') ? 'dropdown' : 'inline';
					options = getOptions(select, type);
					control.data('selectBox-options', options);
					switch (type) {
					case 'inline':
						control.append(options);
						break;
					case 'dropdown':
						// Update label
						setLabel(select);
						options.insertAfter(control);
						break;
					}
				};
			var disableSelection = function(selector) {
					$(selector)
					.css({'MozUserSelect': 'none', 'WebkitUserSelect': 'none', 'MsUserSelect': 'none', 'OUserSelect':'none'})
					.bind('selectstart', function(event) {
						event.preventDefault();
					});
				};
			var generateOption = function(self, parentNode) {
					var li = $('<li role="presentation" />'),
						a = $('<a role="option" />');
					li.addClass(self.attr('class'));
					li.data(self.data());
					a.attr('rel', self.val()).text(self.text());
					li.append(a);
					if (self.attr('disabled')) li.addClass('selectBox-disabled').find('A').attr('aria-disabled',true);
					if (self.attr('selected')) li.addClass('selectBox-selected').find('A').attr('aria-selected',true);
					parentNode.append(li);
					return li;
				};

			//
			// Public methods
			//
			switch (method) {
			case 'control':
				return $(this).data('selectBox-control');
			case 'settings':
				if (!data) return $(this).data('selectBox-settings');
				$(this).each(function() {
					$(this).data('selectBox-settings', $.extend(true, $(this).data('selectBox-settings'), data));
				});
				break;
			case 'options':
				// Getter
				if (data === undefined) return $(this).data('selectBox-control').data('selectBox-options');
				// Setter
				$(this).each(function() {
					setOptions(this, data);
				});
				break;
			case 'value':
				// Empty string is a valid value
				if (data === undefined) return $(this).val();
				$(this).each(function() {
					setValue(this, data);
				});
				break;
			case 'refresh':
				$(this).each(function() {
					refresh(this);
				});
				break;
			case 'enable':
				$(this).each(function() {
					enable(this);
				});
				break;
			case 'disable':
				$(this).each(function() {
					disable(this);
				});
				break;
			case 'destroy':
				$(this).each(function() {
					destroy(this);
				});
				break;
			default:
				$(this).each(function() {
					init(this, method);
				});
				break;
			}
			return $(this);
		}
	});
})(jQuery);