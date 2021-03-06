/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

'use strict';

var Etherpad = require('./etherpad').Etherpad;
var etherpad = new Etherpad('urlbar-sayings');
var prefs = require('sdk/simple-prefs');
var tabs = require('sdk/tabs');
var winutils = require('sdk/window/utils');

etherpad.setDefaults([
  'Where do you want to go today?',
  'Just type ”google.com“.  You know you’re going to.',
  'Let’s do this thing!',
  'Hey, I wonder what we should have for lunch?',
  'Where to, boss?',
  'I hear Facebook is nice this time of year…',
  'You know you can search from here, right?',
  'Have you thought about trying Private Browsing Mode?',
  'You are in a maze of twisty web pages, all alike.',
  'Hi!  My name is Url.'
]);

var original = 'Search or enter address';

var tabActivate = function (tab) {
  var window = winutils.getMostRecentBrowserWindow();
  var placeholder = tab.placeholder;
  if (!placeholder) {
    placeholder = etherpad.getItem(tab.id);
  }
  window.gURLBar.placeholder = placeholder;
};

var tabReady = function (tab) {
  var window = winutils.getMostRecentBrowserWindow();
  if (!tab.placeholder) {
    tab.placeholder = etherpad.getItem(tab.id);
  } else {
    tab.placeholder = etherpad.getRandomItem();
  }
  window.gURLBar.placeholder = tab.placeholder;
};

var run = function () {
  var window = winutils.getMostRecentBrowserWindow();
  original = window.gURLBar.placeholder;
  window.gURLBar.placeholder = etherpad.getItem(0);
  etherpad.loadPlaceholders();
  tabs.on('activate', tabActivate);
  tabs.on('ready', tabReady);
  tabActivate(tabs.activeTab);
};

var stop = function () {
  tabs.removeListener('activate', tabActivate);
  tabs.removeListener('ready', tabReady);
  var window = winutils.getMostRecentBrowserWindow();
  if (!window) {
    return;
  }
  window.gURLBar.placeholder = original;
};

var listener = function () {
  if (prefs.prefs.urlbar) {
    run();
  } else {
    stop();
  }
};

exports.load = function () {
  prefs.on('urlbar', listener);
  listener('urlbar');
};

exports.unload = function () {
  stop();
  prefs.removeListener('urlbar', listener);
};
