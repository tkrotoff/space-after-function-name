'use strict';

var NO_SPACE_AFTER_FUNCTION_NAME = /function\s+\w+\(/; // function foo(
var ONE_SPACE_AFTER_FUNCTION_NAME = /function\s+\w+\s\(/; // function foo (

module.exports = function(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  // Used to see what is the most used
  var noSpace = 0;
  var oneSpace = 0;

  str.split(/\n/g).forEach(function(line) {
    // Ignore empty lines
    if (line) {
      var matchesNoSpace = line.match(NO_SPACE_AFTER_FUNCTION_NAME);
      var matchesOneSpace = line.match(ONE_SPACE_AFTER_FUNCTION_NAME);

      if (matchesNoSpace) {
        noSpace++;
      }

      if (matchesOneSpace) {
        oneSpace++;
      }
    }
  });

  return {
    noSpaceAfterFunctionNameCount: noSpace,
    oneSpaceAfterFunctionNameCount: oneSpace
  };
};
