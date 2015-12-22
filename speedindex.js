// "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
// ASP is dead, but ASP.NET is alive! ASP {2}
// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}
/*
* Speedindex: by D.H.J. Speelman - www.dspeelman.nl
* Free to use or to improve.
* Usage: $('#container>ul').speedindex();
* html: '<div id='container'><ul><li></li> ... lots <li></li></ul></div>
* version: 1.0.1
*/
// http://msdn.microsoft.com/en-us/magazine/ff608209.aspx
(function($) {
    var first = '';
    var count = 0;
    var group = '';
    var text = '';
    var idx = 0;

    $.speedindex = function(element, options) {
        this.options = {};

        element.data('speedindex', this);

        this.init = function(element, options) {
            this.options = $.extend({}, $.speedindex.defaultOptions, options);
            var self = this;

			self.setTextFilter(element, options);
			if (!this.options.speedindex) {
				return;
			}
			
            this.$lielements = element.find(this.options.childSelector);

			//Calc triggercount based on number of list elements
            var _size = this.$lielements.size();
            if (_size < this.options.triggercount) {
                return;
            }
			var _groupcount = 0;
			for ( idx = this.options.triggercountset.length-1; idx >=0 ; idx--) {
				var _item = this.options.triggercountset[idx];
				console.log('li size[' + _size + '] triggercount li[' + _item.lisize + '] group[' + _item.groupcount + ']');
				if (_item.lisize < _size) {
					_groupcount = _item.groupcount;
					break;
				} 
			}
			if (_groupcount<=0) {
				return;
			}
			
            // Get all li text + count 'first' occurences
            this._litext = [];
            this._lifirsts = [];
            this._lifirstsGrouped = [];
            this._licount = {};

            this.$lielements.each(function(idx, value) {
                text = $(this).text().trim().toLowerCase();
                self._litext.push(text);
                first = text.substring(0, self.options.sampletextlength);
                if (jQuery.inArray(first, self._lifirsts) == -1) {
                    self._lifirsts.push(first);
                    self._licount[first] = 1;
                } else {
                    self._licount[first] = self._licount[first] + 1;
                }
            });

            this._lifirsts.sort();
            // Group 'first' occurence together < groupcount
            count = 0;
            group = '';
            for ( idx = 0; idx < this._lifirsts.length; idx++) {
                first = this._lifirsts[idx];
                if (count + this._licount[first] > _groupcount) {
                    this._lifirstsGrouped.push(group);
                    group = '';
                    count = 0;
                }
                count = count + this._licount[first];
                if (group == '') {
                    group = first;
                } else {
                    group = group + this.options.groupseparator + first;
                }
            }
            if (group != '') {
                this._lifirstsGrouped.push(group);
            }

            if (this.options.wildcard != '') {
                this._lifirstsGrouped.push(this.options.wildcard);
            }

            var html = '';
            var idx = 0;
            var key = '';
            for ( idx = 0; idx < this._lifirstsGrouped.length; idx++) {
                first = this._lifirstsGrouped[idx];
                console.log(first);
                key = first.charAt(0).toUpperCase() + first.charAt(1);
                html = html + this.options.htmlIdx.format(first, key);
            }

            // Index
            var classContainerIdx = '.' + this.options.classContainerIdx;
            if (element.find(classContainerIdx).size() == 0) {
                html = this.options.htmlContainerIdx.format(this.options.classContainerIdx, html);
                // Place speedindex before ul tag
                element.prepend(html);
            } else {
                element.find(classContainerIdx).html(html);
            }

            
            // Bind events
            element.find('.speedidx').click(function() {
                var active = $(this).hasClass('active');
                if (!active) {
                    element.find('.speedidx').removeClass('active');
                    // Move to active
                    self.setActive(this, self.$lielements);
                }
            });
			
            // Set first idx-entry active
            this.setActive(element.find('.speedidx:first'), this.$lielements);
        };

		this.setTextFilter = function(element, options) {
			var self = this;
			
			// Text filter
            var classFilter = this.options.classFilter;
            if (this.options.filter) {
                this.options.htmlFilter = this.options.htmlFilter.format(this.options.classFilter);
                var htmlFilter = this.options.htmlContainerIdx.format(classFilter, this.options.htmlFilter);
                if (element.find('.' + classFilter).size() == 0) {
                    element.prepend(htmlFilter);
                } else {
                    element.find('.' + classFilter).html(htmlFilter);
                }
            } else {
                element.find('.' + classFilter).remove();
            }
	
			/* keypress backspace key won't fire on chrome */
            element.find('input.' + this.options.classFilter).keyup(function() {
                var exp = $(this).val();
                self.findActive(exp, self.$lielements);
            });
		};
		
		
        //Public function
        this.setActive = function(item, lielements) {
            var self = this;
            $(item).addClass('active');
            var first = $(item).get(0).getAttribute('data-first');
            // Ex. Be||Bi
            var tmpArray = first.split(this.options.groupseparator);
            var tmpExp = '^' + tmpArray.join('|^');
            // ^Be|^Bi

            lielements.each(function(idx, value) {
                var text = $(this).text().trim().toLowerCase();

                if ((self.options.wildcard != '' && first == self.options.wildcard) || text.match(tmpExp)) {
                    $(this).addClass(self.options.classactive).removeClass(self.options.classinactive).show();
                } else {
                    $(this).addClass(self.options.classinactive).removeClass(self.options.classactive).hide();
                }
            });
        };

        this.findActive = function(exp, lielements) {
            var self = this;

            lielements.each(function(idx, value) {
                var text = $(this).text().trim().toLowerCase();
                if (text.match(exp)) {
                    $(this).addClass(self.options.classactive).removeClass(self.options.classinactive).show();
                } else {
                    $(this).addClass(self.options.classinactive).removeClass(self.options.classactive).hide();
                }
            });
        };

        //Public function
        this.greet = function(name) {
            console.log('Hello, ' + name + ', welcome');
        };

        this.init(element, options);
    };

    $.fn.speedindex = function(options) {//Using only one method off of $.fn
        return this.each(function() {(new $.speedindex($(this), options));
        });
    };

    $.speedindex.defaultOptions = {
    	speedindex : true,	
        triggercount : 25, /* minimal # of list elements */
        triggercountset : [        			
        			{lisize:25, groupcount:5},
        			{lisize:80, groupcount:10},
        			{lisize:150, groupcount:15},
        			{lisize:200, groupcount:20},
        			{lisize:300, groupcount:30},
        				  ],        
        sampletextlength : 2,
        groupseparator : '||',
        wildcard : '*',
        childSelector : 'li',
        htmlIdx : '<span data-first="{0}" class="speedidx label label-default" style="display:inline-block">{1}</span>',
        htmlContainerIdx : '<div class="{0}">{1}</div>',
        classContainerIdx : 'speedidx-labels', /* specify element to place the html speedindex labels */
        
        filter : true,
        htmlFilter : ' <input class="{0}" type="text" placeholder="Filter">',
        classFilter : 'speedidx-filter',
        classactive : 'speedidx-active',
        classinactive : 'speedidx-inactive'

    };

})(jQuery);
