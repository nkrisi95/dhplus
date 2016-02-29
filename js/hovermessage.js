/**
 * Hover Message v1.0
 *
 * Copyright 2012, Norbert Kele
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * @author	Norbert Kele
 * @since 	2012-09-10
 */
(function($) {
	
	var methods = {
	
		init : function(options) {

			var settings = $.extend({
				position	: 'top-left', 	// or 'top-right' or 'bottom-left' or 'bottom-right'
				width		: 260,			// px
				height		: 60,			// px
				zindex		: 50,
				clone		: false,
				close		: 'onclick', 	// or 'x-button'
				autoclose	: 0,			// milliseconds
				margin		: 5,			// px
				type		: 'none', 		// e.g. 'error', 'warning', etc. what you defined in the css
				onClose		: false
			}, options);
			
			var prefix = 'hovermsg_';
			var maincss = {
				'position' 	: 'fixed',
				'overflow'	: 'hidden'
			}
			
			var msg_main = $('#' + prefix + settings.position);
			if(msg_main.length == 0) {
				var msg_main = $('<div id="' + prefix + settings.position + '"></div>');
				if(settings.position == 'bottom-left') {
					msg_main.css({'bottom' : 0, 'left' : 0});
				} else if(settings.position == 'bottom-right') {
					msg_main.css({'bottom' : 0, 'right' : 0});
				} else if(settings.position == 'top-right') {
					msg_main.css({'top' : 0, 'right' : 0});
				} else {
					msg_main.css({'top' : 0, 'left' : 0});
				}
				msg_main.css(maincss).appendTo($('body'));
			}

			var msg_container = $('<div class="' + prefix + 'container"></div>').css({
				'width'		: settings.width + 'px',
				'height'	: settings.height + 'px',
				'margin'	: settings.margin + 'px',
				'z-index'	: settings.zindex,
				'display'	: 'none',
				'opacity'	: 0
			}).addClass(prefix + settings.type);
			
			if(settings.position == 'top-right' || settings.position == 'bottom-right') {
				msg_container.css('right',-(settings.width + 2 * settings.margin));
			} else {
				msg_container.css('left',-(settings.width + 2 * settings.margin));
			}
			
			if(settings.close == 'onclick') {
				msg_container.click(function() {
					$(this).hovermessage('hide', true, settings.onClose);
				});
			} else if(settings.close == 'x-button') {
				$('<span class="' + prefix + 'close">x</span>').appendTo(msg_container).click(function() {
					$(this).parent().hovermessage('hide', true, settings.onClose);
				}).css('cursor','pointer');
			}
			
			settings.clone ? this.clone().appendTo(msg_container) : this.appendTo(msg_container);
			
			if(settings.position == 'bottom-left' || settings.position == 'bottom-right') {
				msg_container.prependTo(msg_main);
			} else {
				msg_container.appendTo(msg_main);
			}
			
			if(settings.autoclose != 0) {
				setTimeout(function() {
					msg_container.hovermessage('hide', true, settings.onClose);
				}, settings.autoclose);
			}
			
			return msg_container.hovermessage('show');
		},
		
		show : function() {
			if(this.css('display') == 'none') {
				var msg_main = this.parent();
				if(msg_main.size() == 0) {
					return;
				}
				var totalheight = 0;
				var maxwidth = 0;
				msg_main.children(':visible').each(function() {
					totalheight += $(this).outerHeight(true);
					maxwidth = Math.max(maxwidth,$(this).outerWidth(true));
				});
				if(parseInt(msg_main.css('top'),10) == 0){
					this.css('top',totalheight).show();
				} else {
					this.css('bottom',totalheight).show();
				}
				msg_main.css('height',totalheight + this.outerHeight(true));
				msg_main.css('width',Math.max(maxwidth,this.outerWidth(true)));
				if(msg_main.position().left == 0) {
					this.animate({'left' : 0,'opacity' : 1},500);
				} else {
					this.animate({'right' : 0,'opacity' : 1},500);
				}
			}
			return this;
			
		},
		
		hide : function(remove,onend) {
			var msg_main = this.parent();
			if(msg_main.size() == 0) {
				return;
			}
			var msgheight = this.outerHeight(true);
			var animcss;
			
			if(msg_main.position().left == 0) {
				animcss = {'left' : -this.outerWidth(true), 'opacity' : 0};
			} else {
				animcss = {'right' : -this.outerWidth(true), 'opacity' : 0};
			}
			
			this.animate(animcss,500,function() {
				$(this).hide();
				moveRemain($(this));
				if(remove){
					$(this).remove();
				} else {
					return $(this).hide();
				}
			});
			
			function moveRemain(obj) {
				if(msg_main.children(':visible').size() > 0) {
					var pronto;
					if(parseInt(msg_main.css('top'),10) == 0) {
						if(obj.is(':last-child')) {
							pronto = true;
						} else {
							pronto = false;
							obj.nextAll(':visible').each(function() {
								$(this).animate({'top' : parseInt($(this).css('top'),10) - msgheight}, 400);
							});
						}
					} else {
						if(obj.is(':first-child')) {
							pronto = true;
						} else {
							pronto = false;
							obj.prevAll(':visible').each(function() {
								$(this).animate({'bottom' : parseInt($(this).css('bottom'),10) - msgheight}, 400);
							});
						}
					}
					pronto ? resizeMsgMain() : setTimeout(resizeMsgMain, 400);
				} else {
					resizeMsgMain();
				}
			}
			
			function resizeMsgMain() {
				var totalheight = 0;
				var maxwidth = 0;
				msg_main.children(':visible').each(function() {
					totalheight += $(this).outerHeight(true);
					maxwidth = Math.max(maxwidth,$(this).outerWidth(true));
				});
				msg_main.css({'width' : maxwidth, 'height' : totalheight});
				if(onend) {
					onend();
				}
			}
		},
		
		update : function(content) {
			if(this.children(':first').text() == 'x') {
				this.children(':not(:first)').remove();
			} else {
				this.children().remove();
			}
			return this.append($(content));
		}
		
	};
	
	$.fn.hovermessage = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.hovermessage' );
		} 
	};
  
	
})(jQuery);