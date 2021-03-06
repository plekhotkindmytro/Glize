
/**
 * @fileoverview ServletRequest utils test suite.
 * @link http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * @link https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @link https://code.google.com/p/js-test-driver/
 */


net.ServletRequestTestCase = TestCase('ServletRequestTestCase');

net.ServletRequestTestCase.prototype.testGetParameter = function() {
  net.URL = net.URL_; // clear native window.URL.
  var request = new net.ServletRequest;
  var url = 'http://localhost?a=1&b=2#c=3&d=4';
  assertEquals('1', request.getParameter('a', url));
  assertEquals('2', request.getParameter('b', url));
  assertEquals('3', request.getParameter('c', url));
  assertEquals('4', request.getParameter('d', url));
};


net.ServletRequestTestCase.prototype.testGetParameterNames = function() {
  net.URL = net.URL_; // clear native window.URL.
  var request = new net.ServletRequest;
  var url = 'http://localhost?a=1&b=2#c=3&d=4';
  var names = request.getParameterNames(url);
  assertNotNull(names);
  assertEquals(4, names.length);
};


net.ServletRequestTestCase.prototype.testGetParameterMap = function() {
  net.URL = net.URL_; // clear native window.URL.
  var request = new net.ServletRequest;
  var url = 'http://localhost?a=1&b=2#c=3&d=4';
  var map = request.getParameterMap(url);
  assertNotNull(map);
  assertEquals('1', map['a']);
  assertEquals('2', map['b']);
  assertEquals('3', map['c']);
  assertEquals('4', map['d']);
};
