
/**
 * @fileoverview DateRangePicker control.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Constructor of DateRangePicker.
 * @param {Object=} opt_options Optional options.
 * @extends {controls.DatePicker} controls.DatePicker
 * @constructor
 */
controls.DateRangePicker = function(opt_options) {
  opt_options = opt_options || {};
  opt_options['multiple'] = true;
  opt_options['separator'] = opt_options['separator'] || ' - ';
  opt_options['timeout'] = opt_options['timeout'] || 300;

  controls.DatePicker.apply(this, [opt_options]);

  /** @inheritDoc */
  this.clickHandler = function() {
    /** @type {controls.Calendar} */ var calendar = self_.getCalendar();
    /** @type {Array.<Date>} */ var dates = calendar.getDates();
    /** @type {number} */ var length = dates.length;
    if (length > 1) {
      /** @type {string} */ var format = self_.getFormat();
      /** @type {Date} */ var start = dates[0];
      /** @type {Date} */ var end = dates[length - 1];
      self_.setValue(
          formatters.DateFormatter.formatDate(start, format) +
          opt_options['separator'] +
          formatters.DateFormatter.formatDate(end, format));

      setTimeout(self_.hide, opt_options['timeout']);
    }
  };

  /** @inheritDoc */
  this.getDates = function() {
    /** @type {!Array.<Date>} */ var range = [];
    /** @type {Date} */ var start = util.Date.getDate();
    /** @type {Date} */ var end = util.Date.getDate();

    /** @type {Array.<string>} */
    var value = self_.getValue().split(opt_options['separator']);
    /** @type {number} */ var length = value.length;
    if (length == 2) {
      /** @type {string} */ var format = self_.getFormat();
      start = formatters.DateFormatter.parseDate(value[0], format);
      end = formatters.DateFormatter.parseDate(value[length - 1], format);
    }

    while (start <= end) {
      range.push(new util.Date.DateTime(start));
      start.setDate(start.getDate() + 1);
      //start = new util.Date.DateTime(+start + 864e5);
    }
    return range;
  };

  /**
   * The reference to current class instance. Used in private methods.
   * @type {!controls.DateRangePicker}
   * @private
   */
  var self_ = this;

  /**
   * Indicates first click, selecting start date.
   * @type {boolean}
   * @private
   */
  var first_ = true;
};


/**
 * @param {Node|Element} element The related element.
 * @static
 */
controls.DateRangePicker.show = function(element) {
  if (!element.picker_) {
    element.picker_ = new controls.DateRangePicker;
  }
  element.picker_.show(element);
};
