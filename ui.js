"use strict";

var kipass = require('./index.js');
if (!kipass) { return alert("Failed to load kipass module"); }

function reset() {
  $('#domainPassword').val('');
  $('#integrity *').text('');
}

function generate() {
  kipass({
    masterPassword: $('#masterPassword').val(),
    domain: $('#domain').val(),
    length: $('#passwordLength').val(),
    alphabets: getSelectedAlphabets(),
    condition: hasEachAlphabet
  }, function (err, pass) {
    if (err) {
      alert("Unable to generate password because: " + String(err));
      reset();
      return;
    }

    $('#domainPassword').val(pass);
  });
}

function checkIntegrity() {
  reset();

  if ($('#masterPassword').val().length <= 0) {
    return;
  }

  var icons = {
    cow: "🐄",
    pig: "🐖",
    goat: "🐐",
    monkey: "🐒",
    horse: "🐎",
    snake: "🐍",
    chicken: "🐔",
    cat: "🐱",
    dog: "🐶",
    whale: "🐳"
  };

  kipass({
    masterPassword: $('#masterPassword').val(),
    domain: "kipass.github.io",
    length: 2,
    encoder: encodeIntegrity,
    condition: function () { return true; }
  }, function (err, integrity) {
    if (err) {
      alert("Unable to check integrity of password: " + String(err));
      reset();
      return;
    }

    var parts = integrity.split(' ');
    var color = parts[0];
    var animal = parts[1];
    $('#integrity').css('color', color);
    $('#integrity-text').text(integrity);
    $('#integrity-icon').text(icons[animal]);
  });
}

function encodeIntegrity(key) {
  var colors = ["yellow", "purple", "orange", "black", "green", "pink", "red", "blue"];
  var animals = ["pig", "goat", "chicken", "cow", "cat", "dog", "snake", "monkey", "horse", "whale"];
  var x = (key[0] & 0xFF) % colors.length;
  var y = (key[1] & 0xFF) % animals.length;
  return colors[x] + " " + animals[y];
}

function hasEachAlphabet(pass, cfg) {
  var lookup = {}, count = 0, c;

  for (var i=0; i < pass.length; i++) {
    c = pass[i];

    for (var j=0; j < cfg.alphabets.length; j++) {
      if (lookup[j]) { continue; }
      lookup[j] = cfg.alphabets[j].indexOf(c) >= 0;
      if (cfg.alphabets[j].indexOf(c) >= 0) { count++; lookup[j] = true; break; }
    }

    if (count === cfg.alphabets.length) { break; }
  }

  return count === cfg.alphabets.length;
}

function getSelectedAlphabets() {
  return [
     getAlphabet('#alphabet-uppercase', kipass.alphabets.uppercase),
     getAlphabet('#alphabet-lowercase', kipass.alphabets.lowercase),
     getAlphabet('#alphabet-numbers', kipass.alphabets.numbers),
     getAlphabet('#alphabet-punctuation', kipass.alphabets.punctuation),
     getAlphabet('#alphabet-custom', $('#alphabet-custom-input').val())
  ].filter(function (x) { return (typeof x) === 'string'; });
}

function getAlphabet(selector, alphabet) {
  return $(selector).is(':checked') ? alphabet : null;
}

$(function () {
  $('#masterPassword')
    .keydown(reset)
    .change(checkIntegrity);

  $('#showPassword').click(function () {
    if ($('#masterPassword').attr('type') === 'text') {
      $('#masterPassword').attr('type', 'password');
      $(this).find('.glyphicon').removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
    } else {
      $('#masterPassword').attr('type', 'text');
      $(this).find('.glyphicon').removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
    }
  });

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
