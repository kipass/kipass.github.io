"use strict";

var kipass = require('./index.js');
var animals = require('./animals.js');
if (!kipass) { return showError("Failed to load kipass module"); }

function generatePassword() {
  var domain, alphabets;

  domain = parseDomain($('#url').val());

  if (domain.length <= 0) {
    showError("Domain is invalid");
    return;
  }

  alphabets = getSelectedAlphabets();

  if (alphabets.length <= 0) {
    showError("Alphabet is empty");
    return;
  }

  kipass({
    masterPassword: $('#masterPassword').val(),
    domain: domain,
    length: $('#passwordLength').val(),
    alphabets: alphabets,
    condition: hasEachAlphabet
  }, function (err, pass) {
    if (err) {
      showError(err);
      return;
    }

    $('#domainPassword').val(pass);
  });
}

function showError(err) {
  if (err instanceof Error) { err = err.message; }
  err = $('<div class="alert alert-danger">').text(err);
  $("#error").append(err);
}

function clearError() {
  $("#error").empty();
}

function parseDomain(str) {
  str = str.trim();
  if (str.indexOf('.') < 0) { return ""; }
  if (str.indexOf('//') < 0) { str = "http://" + str; }
  try {
    return new URL(str).host.toLowerCase();
  } catch (err) {
    return "";
  }
}

function resetIntegrity() {
  $('#integrity *').text('');
  clearError();
}

function checkIntegrity() {
  resetIntegrity();

  if ($('#masterPassword').val().length <= 0) {
    return;
  }

  kipass({
    masterPassword: $('#masterPassword').val(),
    domain: "kipass.github.io",
    length: 2,
    formatter: function (key) {
      return {
        color: kipass.translateByte(animals.colors, key[0]),
        animal: kipass.translateByte(animals.names, key[1])
      };
    },
    condition: function () { return true; }
  }, function (err, integrity) {
    if (err) {
      showError(err);
      return;
    }

    $('#integrity').css('color', integrity.color);
    $('#integrity-text').text(integrity.color + " " + integrity.animal);
    $('#integrity-icon').text(animals.icons[integrity.animal]);
  });
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

function togglePreview() {
  if (isPreviewEnabled()) {
    disablePreview();
  } else {
    enablePreview();
  }
}

function isPreviewEnabled() {
  return $('#masterPassword').attr('type') === 'text';
}

function disablePreview() {
  $('#masterPassword').attr('type', 'password');
  $('#showPassword').find('.glyphicon').addClass('glyphicon-eye-open').removeClass('glyphicon-eye-close');
}

function enablePreview() {
  $('#masterPassword').attr('type', 'text');
  $('#showPassword').find('.glyphicon').addClass('glyphicon-eye-close').removeClass('glyphicon-eye-open');
}

function generate() {
  $('#domainPassword').val('Generating...');
  clearError();

  try {
    generatePassword();
  } catch (ex) {
    console.trace(ex);
    $('#domainPassword').val('');
    showError(ex);
  }
}

$(function () {
  $('#masterPassword')
    .keydown(resetIntegrity)
    .change(checkIntegrity);

  $('#showPassword').click(togglePreview);
  $('#generateButton').click(generate);
});
