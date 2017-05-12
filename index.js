
var crypto = require('crypto');

function kipass(cfg, f) {
  if (!cfg) { return f(new Error("Missing configuration")); }
  if (typeof cfg.masterPassword !== 'string') { return f(new Error("Missing master password")); }
  if (cfg.masterPassword.length < 6) { return f(new Error("Master password is too short")); }
  if (typeof cfg.domain !== 'string') { return f(new Error("Domain should be a string")); }
  if (cfg.domain.length <= 0) { return f(new Error("Domain is too short")); }
  cfg.length = Number(cfg.length);
  if (cfg.length <= 0 || isNaN(cfg.length)) { return f(new Error("Missing password length")); }
  if (typeof cfg.alphabet !== 'string') { return f(new Error("Missing alphabet")); }
  if (cfg.alphabet.length < 10) { return f(new Error("Password alphabet is too small")); }

  var hashedPassword = sha512(cfg.masterPassword);
  var hashedDomain = sha512(cfg.domain);
  var salt = sha512(hashedPassword + hashedDomain);
  var domainPassword = sha512(hashedPassword + masterPassword);
  var iterations = 1024 * 256;

  crypto.pbkdf2(domainPassword, salt, iterations, cfg.length, 'sha256', function (err, key) {
    if (err) {
      f(err);
    } else if (key.length !== cfg.length) {
      f(new Error("Generated key is unexpected length"));
    } else {
      f(false, encode(cfg, key));
    }
  });
};

function encode(cfg, key) {
  var chars = [], pos = 0;

  while (chars.length < cfg.length) {
    chars.push(cfg.alphabet[(key[pos++] & 0xFF) % cfg.alphabet.length]);
  }

  return chars.join("");
}

function sha512(data) {
  return crypto.createHash('sha512').update(data, 'utf8').digest();
}

kipass.alphabets = {
  numeric: "0123456789",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  punctuation: "$.?!-_"
};

module.exports = kipass;
