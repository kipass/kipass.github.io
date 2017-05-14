
var crypto = require('crypto');

function isFunc(x) { return (typeof x) === 'function'; }
function isString(x) { return (typeof x) === 'string'; }
function isNumber(x) { return (typeof x) === 'number'; }
function isArrayOrString(x) { return isString(x) || Array.isArray(x); }

function kipass(cfg, f) {
  if (!isFunc(f)) { throw new Error("Missing callback"); }
  if (!cfg) { return f(new Error("Missing configuration")); }
  if (!isString(cfg.masterPassword)) { return f(new Error("Missing master password")); }
  if (cfg.masterPassword.length < 6) { return f(new Error("Master password is too short")); }
  if (!isString(cfg.domain)) { return f(new Error("Domain should be a string")); }
  if (cfg.domain.length <= 0) { return f(new Error("Domain is too short")); }
  cfg.length = Number(cfg.length);
  if (cfg.length <= 0 || isNaN(cfg.length)) { return f(new Error("Missing password length")); }
  if (!Array.isArray(cfg.alphabets) && !isFunc(cfg.formatter)) { return f(new Error("Missing any alphabets")); }
  if (!isFunc(cfg.condition)) { return f(new Error("Must pass a condition function")); }

  var seed = sha512(cfg.masterPassword);
  var hashedDomain = sha512(cfg.domain);
  var iterations = 1024 * 256;

  function checkAttempt(err, key) {
    if (err) {
      f(err);
    } else if (key.length !== cfg.length) {
      f(new Error("Generated key is unexpected length"));
    } else {
      acceptAttempt(key);
    }
  }

  function acceptAttempt(key) {
    var translated = translate(cfg, key);

    if (cfg.condition(translated, cfg)) {
      f(false, translated);
    } else {
      seed = sha512(seed);
      attempt();
    }
  }

  function attempt() {
    var salt = sha512(seed + hashedDomain);
    var domainPassword = sha512(seed + cfg.masterPassword);
    crypto.pbkdf2(domainPassword, salt, iterations, cfg.length, 'sha256', checkAttempt);
  }

  attempt();
}

function translate(cfg, key) {
  if (cfg.formatter) { return cfg.formatter(key, cfg); }
  var chars = [], alphabet = cfg.alphabets.join("");
  for (var i=0; i < cfg.length; i++) { chars.push(translateByte(alphabet, key[i])); }
  return chars.join("");
}

function translateByte(alphabet, value) {
  if (!isArrayOrString(alphabet)) { throw new Error("Alphabet must be a string or array"); }
  if (!isNumber(value)) { throw new Error("Expected a number to turn into a char"); }
  if (value < 0 || value > 255) { throw new Error("Value is outside expected range"); }
  return alphabet[Math.round((value / 255.0) * (alphabet.length - 1))];
}

kipass.translateByte = translateByte;

function sha512(data) {
  return crypto.createHash('sha512').update(data, 'utf8').digest();
}

kipass.alphabets = {
  numbers: "0123456789",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  punctuation: "!$-.?_"
};

module.exports = kipass;
