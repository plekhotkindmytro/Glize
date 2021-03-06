
/**
 * @fileoverview Simple implementation of HTML5 place holder.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Simple implementation of HTML5 placeholder for non-supported browsers.
 * @constructor
 * @requires dom.events
 * @example
 * (new forms.PlaceHolder).init(document.forms[0]);
 */
forms.PlaceHolder = function() {

  /**
   * Initializes HTML5 form placeholder feature.
   * @param {Node} container The HTML container which contains form elements.
   */
  this.init = function(container) {
    if (!forms.hasFeature(forms.FEATURES.PLACEHOLDER)) {
      /** @type {number} */ var len = forms.TAGS.length;
      for (; len--;) {
        initPlaceHolder_(dom.getElementsByTagName(container, forms.TAGS[len]));
      }
    }
  };

  /**
   * Sets event listeners for elements with placeholder attribute.
   * @param {NodeList} elements Form elements.
   * @private
   */
  function initPlaceHolder_(elements) {
    /** @type {number} */ var len = elements.length;
    /** @type {Node|Element} */ var element;

    for (; len--;) {
      element = elements[len];

      if (element.getAttribute(attribute_)) {
        dom.events.addEventListener(
            element, dom.events.TYPE.FOCUS, handleEvent_);
        dom.events.addEventListener(
            element, dom.events.TYPE.BLUR, handleEvent_);

        handleEvent_({'target': element, 'type': dom.events.TYPE.BLUR});
      }
    }
  }

  /**
   * @param {Event|Object} e The blur or focus event object.
   * @private
   */
  function handleEvent_(e) {
    e = dom.events.getEvent(/** @type {Event} */ (e));
    /** @type {EventTarget} */ var element = dom.events.getEventTarget(e);
    /** @type {string} */ var type = e.type;
    /** @type {string} */ var value = element.value;
    /** @type {string} */ var placeholder;

    if (element) {
      dom.css.removeClass(/** @type {Node} */ (element), attribute_);
      placeholder = element.getAttribute(attribute_);
      if (dom.events.TYPE.FOCUS == type && placeholder == value) {
        element.value = '';
      } else if (dom.events.TYPE.BLUR == type && '' == value) {
        element.value = placeholder;
        dom.css.addClass(/** @type {Node} */ (element), attribute_);
      }
    }
  }

  /**
   * @type {string}
   * @private
   */
  var attribute_ = 'placeholder';
};
