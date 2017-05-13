
var crypto = require('crypto');

function kipass(cfg, f) {
  if (typeof f !== 'function') { throw new Error("Missing callback"); }
  if (!cfg) { return f(new Error("Missing configuration")); }
  if (typeof cfg.masterPassword !== 'string') { return f(new Error("Missing master password")); }
  if (cfg.masterPassword.length < 6) { return f(new Error("Master password is too short")); }
  if (typeof cfg.domain !== 'string') { return f(new Error("Domain should be a string")); }
  if (cfg.domain.length <= 0) { return f(new Error("Domain is too short")); }
  cfg.length = Number(cfg.length);
  if (cfg.length <= 0 || isNaN(cfg.length)) { return f(new Error("Missing password length")); }
  if (!cfg.encoder && !Array.isArray(cfg.alphabets)) { return f(new Error("Missing any alphabets")); }
  if (typeof cfg.condition !== 'function') { return f(new Error("Must pass a condition function")); }

  var seed = sha512(cfg.masterPassword);
  var hashedDomain = sha512(cfg.domain);
  var iterations = 1024 * 256;

  function checkAttempt(err, key) {
    var encoded;

    if (err) {
      f(err);
    } else if (key.length !== cfg.length) {
      f(new Error("Generated key is unexpected length"));
    } else {
      encoded = encode(cfg, key);

      if (cfg.condition(encoded, cfg)) {
        f(false, encoded);
      } else {
        seed = sha512(seed);
        attempt();
      }
    }
  }

  function attempt() {
    var salt = sha512(seed + hashedDomain);
    var domainPassword = sha512(seed + cfg.masterPassword);
    crypto.pbkdf2(domainPassword, salt, iterations, cfg.length, 'sha256', checkAttempt);
  }

  attempt();
};

function encode(cfg, key) {
  if (cfg.encoder) { return cfg.encoder(key, cfg); }
  var chars = [], alphabet = cfg.alphabets.join("");
  for (var i=0; i < cfg.length; i++) { chars.push(alphabet[(key[i] & 0xFF) % alphabet.length]); }
  return chars.join("");
}

function sha512(data) {
  return crypto.createHash('sha512').update(data, 'utf8').digest();
}

kipass.alphabets = {
  numbers: "0123456789",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  punctuation: "$.?!-_"
};

module.exports = kipass;
