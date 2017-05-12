"use strict";

var kipass = require('./index.js');
if (!kipass) { return alert("Failed to load kipass module"); }

function generate() {
  kipass({
    masterPassword: $('#masterPassword').val(),
    domain: $('#domain').val(),
    length: $('#passwordLength').val(),
    alphabet: createAlphabet()
  }, function (err, pass) {
    if (err) {
      alert("Unable to generate password because: " + String(err));
      $('#domainPassword').val('');
      return;
    }

    $('#domainPassword').val(pass);
  });
}

function createAlphabet() {
  return (
     getAlphabet('#alphabet-uppercase', kipass.alphabets.uppercase) +
     getAlphabet('#alphabet-lowercase', kipass.alphabets.lowercase) +
     getAlphabet('#alphabet-numbers', kipass.alphabets.numbers) +
     getAlphabet('#alphabet-punctuation', kipass.alphabets.punctuation)
  );
}

function getAlphabet(selector, alphabet) {
  return $(selector).is(':checked') ? alphabet : "";
}

$(function () {
  $('#generateButton').click(function () {
    $('#domainPassword').val('Generating...');

    try {
      generate();
    } catch (ex) {
      console.trace(ex);
      $('#domainPassword').val('');
      alert("An error was thrown. Check the console to see what happened and file a bug");
    }
  });
});
