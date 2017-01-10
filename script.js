if (typeof xpathGetter === 'undefined') {
	xpathGetter = function(){
	    
		var isActive = false,
			mode = "XPATH";//0 - xpath, 1-css, 2-id
			version = "0.1",
			codeTemplate = null,
			iniatilized = false;
		var pub = {};
		var self = {
	        opts: {
	            namespace:  'DomOutline',
	            borderWidth: 2,
	            onClick:  false
	        },
	        keyCodes: {
	            BACKSPACE: 8,
	            ESC: 27,
	            DELETE: 46
	        },
	        active: false,
	        initialized: false,
	        elements: {}
	    };
		
		function importJS(src, look_for, onload) {
		  var s = document.createElement('script');
		  s.setAttribute('type', 'text/javascript');
		  s.setAttribute('src', src);
		  if (onload) wait_for_script_load(look_for, onload);
		  var head = document.getElementsByTagName('head')[0];
		  if (head) {
		    head.appendChild(s);
		  } else {
		    document.body.appendChild(s);
		  }
		}

		function importCSS(href, look_for, onload) {
		  var s = document.createElement('link');
		  s.setAttribute('rel', 'stylesheet');
		  s.setAttribute('type', 'text/css');
		  s.setAttribute('media', 'screen');
		  s.setAttribute('href', href);
		  if (onload) wait_for_script_load(look_for, onload);
		  var head = document.getElementsByTagName('head')[0];
		  if (head) {
		    head.appendChild(s);
		  } else {
		    document.body.appendChild(s);
		  }
		}

		function wait_for_script_load(look_for, callback) {
		  var interval = setInterval(function() {
		    if (eval("typeof " + look_for) != 'undefined') {
		      clearInterval(interval);
		      callback();
		    }
		  }, 50);
		}

		function getPath( element , method ){
			switch (method){
	    		case "CSS" : 
	    			var path = '';
				    for ( isFound = false; element && element.nodeType == 1 && !isFound; element = element.parentNode )
				    {	
				    	var temp = element.tagName.toLowerCase();
				    	var id = jQuery(element.parentNode).children(element.tagName).index(element) + 1;
				    	if (element.id){
				    		temp += "#"+element.id;
				    		isFound = true;
				    	}
				    	if (element.className){
				    		temp += "."+element.className.split(" ").join(".");	
				    		isFound = true;
				    	}
				    	id > 1 ? (id = ':nth-child(' + id + ')') : (id = '');
				        path = '>' + temp+id + path;
				    }
				    path = path.substr(1);
	    			break;
	    		case "XPATH":
				    var path = '';
				    for ( ; element && element.nodeType == 1; element = element.parentNode )
				    {
			    
		    		    var id = jQuery(element.parentNode).children(element.tagName).index(element) + 1;
				        id > 1 ? (id = '[' + id + ']') : (id = '');
				        path = '/' + element.tagName.toLowerCase() + id + path;
				    }
				    path = "/"+path
			    	break;
	    		case "ID":
	    			if (element.id){
	    				path = element.id;
				    }else{
				    	path = "ID not found";
				    }
	    			break;
		   	}
		    return path;
		}

		var seletectedElms = [];
		function unselect(elm){
			jQuery(elm).css('background','').css('border', '');
			seletectedElms = _.without(seletectedElms, _.findWhere(seletectedElms, elm));
		}

		function select(elm){
			var ret = '';
			var name = prompt("Enter the name of the element");
			seletectedElms.push(elm);
			jQuery(elm).css('background','red').css('border', '3px solid black');
			ret = getPath(elm,mode);
			ret = prompt("Genereted "+mode,mode+":"+ret);
			elm._pg = {
				name : name,
				code : ret.split(':')[1],
				selector : ret.split(':')[0],
			};
		}

		function generateCode(){
			var className = prompt('Enter the name of the page object');
			var packageName = prompt('Enter the name of the package');
			var extendsName = prompt('Enter the name class page object extends from');
			var context = {
				extendsName : extendsName,
				packageName : packageName,
				className  : className,
				items : _.pluck(seletectedElms, '_pg')
			};
			var code = xpathGetter.codeTemplate(context);
			// jQuery('body').append("<pre class='pg_page'></pre>");
			// jQuerytarget = jQuery('body pre.pg_page');
			// jQuerytarget.css({
	  //           position: 'absolute',
	  //           width: jQuery(window).width(),
	  //           height: jQuery(window).height(),
	  //           top : 0,
	  //           right : 0,
	  //       }).keyup(function(e) {
			//   if (e.which == 27) { jQuerytarget.remove(); }   // esc
			// });
		    // jQuerytarget.text(code);
			
			download(className, code);
			//jQuery("html").html("<pre>"+code+"</pre>");
		}

		function download(filename, text) {
		    var element = document.createElement('a');
		    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		    element.setAttribute('download', filename);

		    element.style.display = 'none';
		    document.body.appendChild(element);

		    element.click();

		    document.body.removeChild(element);
		}


		function react(e){
			if( e.button == 2 ) { //right click 
				var elm = e.target;
				if (!elm.selected){
					elm.selected = true;
					select(elm);
				}else{
					unselect(elm);
					elm.selected = false;
				}
			}
			return false;
		}
        var keyMap = function(event){
			switch ( event.which ) {
				case 88: //X
				case 120:  //x
					mode = "XPATH";
					break;
				case 67: //C
				case 99: //c
					mode = "CSS";
					break;
				case 73:  //I
				case 105:  //i
					mode = "ID";
					break;
				case 71: //G
				case 103: //g
					mode = 4;
					break;
			}
		};


    function writeStylesheet(css) {
        var element = document.createElement('style');
        element.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(element);

        if (element.styleSheet) {
            element.styleSheet.cssText = css; // IE
        } else {
            element.innerHTML = css; // Non-IE
        }
    }

    function initStylesheet() {
        if (self.initialized !== true) {
            var css = '' +
                '.' + self.opts.namespace + ' {' +
                '    background: #09c;' +
                '    position: absolute;' +
                '    z-index: 1000000;' +
                '}' +
                '.' + self.opts.namespace + '_label {' +
                '    background: #09c;' +
                '    border-radius: 2px;' +
                '    color: #fff;' +
                '    font: bold 12px/12px Helvetica, sans-serif;' +
                '    padding: 4px 6px;' +
                '    position: absolute;' +
                '    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
                '    z-index: 1000001;' +
                '}';

            writeStylesheet(css);
            self.initialized = true;
        }
    }

	function createOutlineElements() {
        self.elements.label = jQuery('<div></div>').addClass(self.opts.namespace + '_label').appendTo('body');
        self.elements.top = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.bottom = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.left = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.right = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
    }

    function removeOutlineElements() {
        jQuery.each(self.elements, function(name, element) {
            element.remove();
        });
    }


    function getScrollTop() {
        if (!self.elements.window) {
            self.elements.window = jQuery(window);
        }
        return self.elements.window.scrollTop();
    }

    function updateOutlinePosition(e) {
        if (e.target.className.indexOf(self.opts.namespace) !== -1) {
            return;
        }
        pub.element = e.target;

        var b = self.opts.borderWidth;
        var scroll_top = getScrollTop();
        var pos = pub.element.getBoundingClientRect();
        var top = pos.top + scroll_top;

        var label_text = getPath(pub.element,mode);
        var label_top = Math.max(0, top - 20 - b, scroll_top);
        var label_left = Math.max(0, pos.left - b);

        self.elements.label.css({ top: label_top, left: label_left }).text(label_text);
        self.elements.top.css({ top: Math.max(0, top - b), left: pos.left - b, width: pos.width + b, height: b });
        self.elements.bottom.css({ top: top + pos.height, left: pos.left - b, width: pos.width + b, height: b });
        self.elements.left.css({ top: top - b, left: Math.max(0, pos.left - b), width: b, height: pos.height + b });
        self.elements.right.css({ top: top - b, left: pos.left + pos.width, width: b, height: pos.height + (b * 2) });
    }









		function reg () {
			if (!xpathGetter.iniatilized)
				return;
			alert('xpathGetter is active');
			jQuery("body").on({
				'keydown' : keyMap,
				// 'mousedown' : react,
				// 'mousemove' : 
				
			});
			jQuery('body').bind('mousemove.' + self.opts.namespace, updateOutlinePosition);
			jQuery('body').bind('mousedown.' + self.opts.namespace, react);

			document.oncontextmenu = function(event){
			 	if(event.preventDefault != undefined)
			  		event.preventDefault();
				if(event.stopPropagation != undefined)
		  			event.stopPropagation();
			}
		}

		function unreg () {
			jQuery( "body" ).off( "mousedown", react).off( "keydown", keyMap).on('contextmenu');;
			alert('xpathGetter is inactive');
			document.oncontextmenu = null;
			generateCode();
		}
		var codeTemplateRaw = "%7B%7B%23if%20packageName%7D%7Dpackage%20%7B%7BpackageName%7D%7D%3B%20%7B%7B%2Fif%7D%7D%0A%0Aimport%20org.openqa.selenium.WebDriver%3B%0Aimport%20org.openqa.selenium.WebElement%3B%0Aimport%20org.openqa.selenium.support.FindBy%3B%0Aimport%20org.openqa.selenium.support.How%3B%0A%0Aimport%20com.leapset.test.www.cinco.helper.CincoKeyboardHelper%3B%0A%0Apublic%20class%20%7B%7BclassName%7D%7D%20%7B%7B%23if%20extendsName%7D%7D%20extends%20%7B%7BextendsName%7D%7D%20%7B%7B%2Fif%7D%7D%7B%20%20%0A%20%20%7B%7B%23each%20items%7D%7D%20%20%20%20%0A%0A%20%20%40FindBy(how%20%3D%20How.%7B%7Bcaps%20selector%7D%7D%2C%20using%20%3D%20%22%7B%7Bcode%7D%7D%22)%20%20%0A%20%20private%20WebElement%20%7B%7Bcamelcase%20name%7D%7D%3B%09%20%0A%20%20%7B%7B%2Feach%7D%7D%20%20%0A%0A%20%20public%20%7B%7BclassName%7D%7D(WebDriver%20driver)%7B%0A%09super(driver)%3B%0A%09this.driver%20%3D%20driver%3B%0A%20%20%7D%0A%20%20%7B%7B%23each%20items%7D%7D%20%20%20%20%0A%20%20%0A%20%20public%20WebElement%20get%7B%7Bcamelcase%20name%7D%7D()%20%7B%0A%09return%20%7B%7Bcamelcase%20name%7D%7D%3B%0A%20%20%7D%0A%20%20%7B%7B%2Feach%7D%7D%20%20%0A%20%20%7B%7B%23each%20items%7D%7D%0A%20%20%20%20%0A%20%20%7B%7B%23ifButton%7D%7D%0A%20%20public%20void%20click%7B%7Bcamelcase%20name%7D%7D()%20%7B%0A%09get%7B%7Bcamelcase%20name%7D%7D().click()%3B%0A%20%20%7D%20%20%0A%20%20%7B%7B%2FifButton%7D%7D%0A%20%20%7B%7B%23ifTextBox%7D%7D%0A%20%20public%20void%20set%7B%7Bcamelcase%20name%7D%7D(String%20value)%20%7B%0A%09get%7B%7Bcamelcase%20name%7D%7D().clear()%3B%0A%09CincoKeyboardHelper.sendKeys(getDriver()%2C%20value)%3B%0A%20%20%7D%20%20%20%20%0A%20%20%7B%7B%2FifTextBox%7D%7D%0A%20%20%7B%7B%2Feach%7D%7D%20%20%0A%7D"; 
		importJS('//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js', 'jQuery', function(){
			importJS('//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js', '_', function(){
				importJS('//cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0-alpha.2/handlebars.min.js', 'Handlebars', function(){
					xpathGetter.codeTemplate  = Handlebars.compile(unescape(codeTemplateRaw)); 
					Handlebars.registerHelper('camelcase', function(name){
						name = name.replace(/(?:^|\s)\w/g, function(match) {
   							 return match.toUpperCase();
						});
						name = name.replace(/\s/g, "")
						return name;
					});
					String.prototype.startsWith = function (str){
					    return this.toLowerCase().indexOf(str.toLowerCase()) == 0;
					};
					Handlebars.registerHelper('caps', function(word){
						return word.toUpperCase();
					});
					Handlebars.registerHelper('ifTextBox', function(block){
						if (this.name.startsWith('txt')){
							return block.fn(this);
						}
					});
					Handlebars.registerHelper('ifButton', function(block){
						if (this.name.startsWith('btn')){
							return block.fn(this);
						}
					});
				    xpathGetter.iniatilized = true;
				    xpathGetter.isActive = true;

				    createOutlineElements();
            		initStylesheet();
            		createOutlineElements();	
            		self.active = true;

				    xpathGetter.reg();
				});
			});
		});
		
		
		console.log(version + " Loaded");
		return {
			isActive : isActive,
			reg : reg,
			unreg : unreg,
			version : version,
			codeTemplate : codeTemplate,
			iniatilized : iniatilized
		};

	
	}();

}

if (xpathGetter.isActive){
	xpathGetter.unreg();
	xpathGetter.isActive = false;
}else{
    xpathGetter.reg();
    xpathGetter.isActive = true;
	
}