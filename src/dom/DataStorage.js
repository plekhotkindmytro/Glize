
/**
 * @fileoverview Provides data persistence using HTML5 local storage mechanism.
 *
 * @see http://www.w3.org/TR/webstorage/
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * Provides a storage mechanism that uses HTML5 local storage.
 * @requires util.StringUtils.JSON
 * @requires util.StringUtils.URI
 * @requires compressors.LZW
 * @requires dom.Cookies
 * @requires util.Date
 * @constructor
 * @param {Object.<string, *>=} opt_options Optional configuration options.
 * @example
 * options: {
 *   'type': 'local'    // Storage types: local, session, cookie.
 *   'compress': false, // Enables LZW compression.
 *   'session': {
 *     'key': 'ds-sid', // Session cookie key.
 *     'ttl': 30        // Time to live.
 *   }
 * }
 */
dom.DataStorage = function(opt_options) {

  /**
   * Sets a value for a key.
   * @param {string} key The key to set.
   * @param {*} value The string to save.
   */
  this.set = function(key, value) {
    /** @type {string} */ var result = stringify_(value);
    if ('cookie' === options_['type']) {
      dom.Cookies.set(key, result, 365);
    } else if (nativeStorage_) {
      nativeStorage_.setItem(key, result);
    } else if (globalStorage_) {
      globalStorage_[key] = result;
    } else if (userData_) {
      userData_.setAttribute(util.StringUtils.URI.encode(key), result);
      userData_['save'](userData_.tagName);
    } else {
      data_[key] = result;
    }

    if ('session' === options_['type'] && !nativeStorage_) {
      dom.Cookies.set(options_['session']['key'], util.Date.now() + '', 1);
    }
  };

  /**
   * Gets the value stored under a key.
   * @param {string} key The key to get.
   * @return {?Object|string} The corresponding value, null if not found.
   */
  this.get = function(key) {
    /** @type {?string} */ var value = data_[key];
    if ('cookie' === options_['type']) {
      value = dom.Cookies.get(key);
    } else if (nativeStorage_) {
      value = nativeStorage_.getItem(key);
    } else if (globalStorage_) {
      value = globalStorage_[key] && globalStorage_[key].value;
    } else if (userData_) {
      value = userData_.getAttribute(util.StringUtils.URI.encode(key));
    }
    return parse_(value);
  };

  /**
   * Removes a key and its value.
   * @param {string} key The key to remove.
   */
  this.remove = function(key) {
    if ('cookie' === options_['type']) {
      dom.Cookies.remove(key);
    } else if (nativeStorage_) {
      nativeStorage_.removeItem(key);
    } else if (globalStorage_) {
      delete globalStorage_[key];
    } else if (userData_) {
      userData_.removeAttribute(util.StringUtils.URI.encode(key));
      userData_['save'](userData_.tagName);
    } else {
      delete data_[key];
    }
  };

  /**
   * Removes all key-value pairs.
   */
  this.clear = function() {
    /** @type {number} */ var i = 0;
    /** @type {string} */ var key;

    if ('cookie' === options_['type']) {
      dom.Cookies.clear();
    } else if (nativeStorage_) {
      nativeStorage_.clear();
    } else if (globalStorage_) {
      for (key in globalStorage_) {
        self_.remove(key);
      }
    } else if (userData_) {
      for (; i < userData_.attributes.length;) {
        userData_.removeAttribute(userData_.attributes[i++].nodeName);
      }
      userData_['save'](userData_.tagName);
    } else {
      data_ = {};
    }
  };

  /**
   * Gets list of stored keys.
   * @return {!Array.<string>} Returns list of stored keys.
   */
  this.keys = function() {
    /** @type {!Array.<string>} */ var keys = [];
    /** @type {number} */ var i = 0;
    /** @type {NamedNodeMap} */ var attributes =
        userData_ && userData_.attributes;
    /** @type {?Object} */ var storage =
        nativeStorage_ || globalStorage_ || data_;
    /** @type {string} */ var key;

    if ('cookie' === options_['type']) {
      keys = dom.Cookies.keys();
    } else if (attributes) {
      for (; i < attributes.length;) {
        keys.push(attributes[i++].nodeName);
      }
    } else {
      for (key in storage) {
        keys.push(key);
      }
    }
    keys.sort();
    return keys;
  };

  /**
   * @private
   */
  function init_() {
    initOptions_();

    /** @type {string} */ var key = options_['type'] + 'Storage';
    /** @preserveTry */
    try {
      nativeStorage_ = key in dom.context && dom.context[key];
    } catch (e) {}

    if (!nativeStorage_) {
      key = 'globalStorage';
      /** @preserveTry */
      try {
        globalStorage_ = key in dom.context && dom.context[key] &&
            dom.context[key][location.hostname];
      } catch (e) {}
    }

    if (!globalStorage_) {
      /** @preserveTry */
      try {
        userData_ = dom.createElement('userdata');
        userData_['addBehavior']('#default#userData');
        dom.appendChild(dom.document.body, userData_);
        userData_['load'](userData_.tagName);
      } catch (e) {}
    }

    checkSession_();
  }

  /**
   * Checks session expiration.
   * @private
   */
  function checkSession_() {
    if ('session' === options_['type'] && !nativeStorage_) {
      /** @type {!Object} */ var session = options_['session'];
      /** @type {string} */ var timestamp = dom.Cookies.get(session['key']);

      if (timestamp && +timestamp + session['ttl'] * 6e4 < util.Date.now()) {
        self_.clear();
      }
    }
  }

  /**
   * Initializes default options.
   * @private
   */
  function initOptions_() {
    opt_options = opt_options || {};
    options_['type'] = opt_options['type'] || 'local';
    options_['compress'] = opt_options['compress'] || false;
    options_['session'] = opt_options['session'] || {};
    options_['session']['key'] = opt_options['key'] || 'ds-sid';
    options_['session']['ttl'] = opt_options['ttl'] || 30;
  }

  /**
   * @param {*} value The string to save.
   * @return {string} Returns value as string.
   * @private
   */
  function stringify_(value) {
    /** @type {string} */ var result = util.StringUtils.JSON.stringify(value);
    if (options_['compress']) {
      result = util.StringUtils.UTF8.encode(result);
      result = compressors.LZW.compress(result);
    }
    return result;
  }

  /**
   * @param {?string} value The string to parse.
   * @return {?Object|string} The corresponding value or null.
   * @private
   */
  function parse_(value) {
    if (value && options_['compress']) {
      value = compressors.LZW.decompress(value);
      value = util.StringUtils.UTF8.decode(value);
    }

    return value ? util.StringUtils.JSON.parse(value) : dom.NULL;
  }

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @type {!dom.DataStorage}
   * @private
   */
  var self_ = this;

  /**
   * @dict
   * @private
   */
  var options_ = {};

  /**
   * @type {Object}
   * @private
   */
  var data_ = {};

  /**
   * @type {Storage}
   * @private
   */
  var nativeStorage_;

  /**
   * @type {Object}
   * @private
   */
  var globalStorage_;

  /**
   * @type {Element}
   * @private
   */
  var userData_;

  init_();
};
