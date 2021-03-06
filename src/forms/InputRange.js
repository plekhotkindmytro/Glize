
/**
 * @fileoverview Simple implementation of HTML5 input
 *               <code>type="range"</code> control.
 *
 * @see http://www.w3.org/TR/html-markup/input.range.html
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Simple implementation of HTML5 input <code>type="range"</code> control.
 * @param {string|HTMLInputElement} input The input element or its ID attribute.
 * @constructor
 * @requires dom.css
 * @requires dom.events
 * @see http://www.w3.org/TR/html-markup/input.range.html
 */
forms.InputRange = function(input) {

  /**
   * The "<code>.range-track</code>" css class should emulate
   * following pseudo-classes:<pre>
   *     input[type=range]::-webkit-slider-runnable-track {}
   *     input[type=range]::-moz-range-track {}
   *     input[type=range]::-ms-track {}</pre>
   * @type {string}
   * @const
   */
  var RANGE_TRACK_CLASS = forms.FEATURES.TYPE_RANGE + '-track';

  /**
   * The "<code>.range-thumb</code>" css class should emulate
   * following pseudo-classes:<pre>
   *     input[type=range]::-webkit-slider-thumb {}
   *     input[type=range]::-moz-range-thumb {}
   *     input[type=range]::-ms-thumb {}</pre>
   * @type {string}
   * @const
   */
  var RANGE_THUMB_CLASS = forms.FEATURES.TYPE_RANGE + '-thumb';

  /**
   * The "<code>.range-track-focus</code>" css class should emulate
   * following pseudo-classes:<pre>
   *     input[type=range]:focus::-webkit-slider-runnable-track {}
   *     input[type=range]:focus::-webkit-slider-thumb {}
   *     input[type=range]:focus::-moz-range-track {}
   *     input[type=range]:focus::-moz-range-thumb {}</pre>
   * @type {string}
   * @const
   */
  var RANGE_TRACK_FOCUS_CLASS = RANGE_TRACK_CLASS + '-focus';

  /**
   * The "<code>.range-control</code>" css class for control container.
   * @type {string}
   * @const
   * @example
   * <span class="range-control">
   *   <input />
   *   <div class="range-track">
   *     <div class="range-thumb"></div>
   *   </div>
   * </span>
   */
  var RANGE_CONTROL_CLASS = forms.FEATURES.TYPE_RANGE + '-control';

  /**
   * @private
   */
  function init_() {
    if (!forms.hasFeature(forms.FEATURES.TYPE_RANGE, input_)) {
      /** @type {number} */ var value = +(input_.value || 0);
      /** @type {string} */ var type = maxTouchPoints_ ?
          dom.events.TYPE.TOUCHSTART : dom.events.TYPE.MOUSEDOWN;
      input_.value = '0';

      track_ = dom.createElement('DIV');
      dom.css.setClass(track_, RANGE_TRACK_CLASS);
      dom.appendChild(getControl_(), track_);

      thumb_ = dom.createElement('DIV');
      dom.css.setClass(thumb_, RANGE_THUMB_CLASS);
      dom.appendChild(track_, thumb_);

      interval_ = (track_.offsetWidth - thumb_.offsetWidth) /
          (max_ - min_) * step_;
      setValue_(value > max_ ? max_ : value < min_ ? min_ : value);

      dom.events.addEventListener(track_, type, mousedown_);
      dom.events.addEventListener(thumb_, type, mousedown_);
    }
  }

  /**
   * @return {Element} Returns reference to control element.
   * @private
   */
  function getControl_() {
    if (!control_) {
      control_ = dom.createElement('SPAN');
      dom.css.setClass(control_, RANGE_CONTROL_CLASS);
      input_.parentNode.insertBefore(control_, input_);
      dom.appendChild(control_, input_);
    }
    return control_;
  }

  /**
   * @param {Event} e The mousedown event.
   * @private
   */
  function mousedown_(e) {
    if (dom.events.getEventTarget(e) == thumb_) {
      /** @type {string} */ var move = maxTouchPoints_ ?
          dom.events.TYPE.TOUCHMOVE : dom.events.TYPE.MOUSEMOVE;
      /** @type {string} */ var end = maxTouchPoints_ ?
          dom.events.TYPE.TOUCHEND : dom.events.TYPE.MOUSEUP;

      dom.events.addEventListener(dom.document, move, mousemove_);
      dom.events.addEventListener(dom.document, end, mouseup_);
      dom.css.addClass(track_, RANGE_TRACK_FOCUS_CLASS);
    }
    mousemove_(e);
  }

  /**
   * @param {Event} e The mouseup event.
   * @private
   */
  function mouseup_(e) {
    /** @type {string} */ var move = maxTouchPoints_ ?
        dom.events.TYPE.TOUCHMOVE : dom.events.TYPE.MOUSEMOVE;
    /** @type {string} */ var end = maxTouchPoints_ ?
        dom.events.TYPE.TOUCHEND : dom.events.TYPE.MOUSEUP;

    dom.events.removeEventListener(dom.document, move, mousemove_);
    dom.events.removeEventListener(dom.document, end, mouseup_);
    dom.css.removeClass(track_, RANGE_TRACK_FOCUS_CLASS);
  }

  /**
   * @param {Event} e The mousemove event.
   * @private
   */
  function mousemove_(e) {
    e = dom.events.getEvent(e);
    /** @type {Object} */ var rect = dom.getBoundingClientRect(track_);
    /** @type {number} */ var margin = thumb_.offsetWidth / 2;
    /** @type {number} */ var x = e['changedTouches'] ?
        e['changedTouches'][0].clientX : e.clientX;

    if (x >= rect['left'] + margin && x <= rect['right'] - margin) {
      setValue_((x - margin - rect['left']) / interval_);
    }

    // Prevent text selection.
    dom.events.preventDefault(e);
  }

  /**
   * Sets new input's value.
   * @param {number} value The new value to set.
   * @private
   */
  function setValue_(value) {
    value = ~~(value + 0.5); // value = Math.ceil(value);
    if (value != input_.value && value + min_ >= min_ && value + min_ <= max_) {
      input_.value = '' + value;
      thumb_.style.left = value * interval_ + 'px';
      dispatchEvents_();
    }
  }

  /**
   * Dispatches input events.
   * @private
   */
  function dispatchEvents_() {
    dom.events.dispatchEvent(input_, dom.events.TYPE.INPUT);
    dom.events.dispatchEvent(input_, dom.events.TYPE.CHANGE);
  }

  /**
   * The reference to control element.
   * @type {Element}
   * @private
   */
  var control_ = dom.NULL;

  /**
   * The reference to slider thumb element.
   * @type {Element}
   * @private
   */
  var thumb_ = dom.NULL;

  /**
   * The reference to slider track element.
   * @type {Element}
   * @private
   */
  var track_ = dom.NULL;

  /**
   * The reference to input element.
   * @type {HTMLInputElement}
   * @private
   */
  var input_ = 'string' === typeof input ?
      /** @type {HTMLInputElement} */ (dom.getElementById(input)) : input;

  /**
   * The expected lower bound for the input value.
   * @type {number}
   * @private
   */
  var min_ = +(input_.getAttribute('min') || -1e6);

  /**
   * The expected upper bound for the input value.
   * @type {number}
   * @private
   */
  var max_ = +(input_.getAttribute('max') || 1e6);

  /**
   * Specifies the value granularity of the input value.
   * @type {number}
   * @private
   */
  var step_ = +(input_.getAttribute('step') || 1);

  /**
   * The step interval in pixels.
   * @type {number}
   * @private
   */
  var interval_;

  /**
   * Detects touch screen.
   * @type {number}
   * @private
   */
  var maxTouchPoints_ = +dom.device['maxTouchPoints'] ||
                        +dom.device['msMaxTouchPoints'] ||
                        +('ontouchstart' in dom.context);

  init_();
};
