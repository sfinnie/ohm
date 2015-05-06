'use strict';

// --------------------------------------------------------------------
// Imports
// --------------------------------------------------------------------

var test = require('tape-catch');

var ohm = require('..');
var errors = require('../src/errors');
var util = require('./util');

// --------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------

test('non-string input', function(t) {
  var g = ohm.makeGrammar('G { start = 5 }');

  var e = g.match(42);
  t.equal(e.failed(), true);
  t.equal(e.message, 'match failed at position 0');
  t.equal(e.getPos(), 0);
  t.end();
});

test('basic match failure', function(t) {
  var g = ohm.makeGrammar('G { start = "a" "b" "c" "d" }');

  var e = g.match('ab');
  t.equal(e.failed(), true);
  t.equal(e.message, [
    'Line 1, col 3:',
    '> | ab',
    '      ^',
    "Expected 'c'"].join('\n'));
  t.equal(e.getPos(), 2);

  e = g.match('abcde');
  t.equal(e.failed(), true);
  t.equal(e.message, [
    'Line 1, col 5:',
    '> | abcde',
    '        ^',
    'Expected end of input'].join('\n'));
  t.equal(e.getPos(), 4);
  t.end();
});

test('infinite loops', function(t) {
  function matchExpr(expr, input) {
    var g = util.makeGrammar('G { start = ' + expr + '}');
    return g.match(input);
  }
  t.throws(function() { matchExpr('("a"*)*', 'aaa'); }, errors.InfiniteLoop);
  t.throws(function() { matchExpr('("a"?)*', 'aaa'); }, errors.InfiniteLoop);
  t.throws(function() { matchExpr('("a"*)+', 'aaa'); }, errors.InfiniteLoop);
  t.throws(function() { matchExpr('("a"?)+', 'aaa'); }, errors.InfiniteLoop);

  try {
    matchExpr('("a"*)*', 'aaa');
    t.fail('Expected an exception to be thrown');
  } catch (e) {
    t.equal(e.message, [
      'Line 1, col 4:',
      '> | aaa',
      '       ^',
      'Infinite loop detected when matching \'("a"*)*\''].join('\n'));
  }
  t.end();
});
