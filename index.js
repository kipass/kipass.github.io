
var crypto = require('crypto');

function kipass(cfg, f) {
  if (!cfg) { return f(new Error("Missing configuration")); }
  if (typeof cfg.masterPassword !== 'string') { return f(new Error("Missing master password")); }
  if (cfg.masterPassword.length < 6) { return f(new Error("Master password is too short")); }
  if (!cfg.domain) { return f(new Error("Missing domain")); }
  if (typeof cfg.alphabet !== 'string') { return f(new Error("Missing alphabet")); }
  if (cfg.length <= 0) { return f(new Error("Missing password length")); }
  if (cfg.alphabet.length < 10) { return f(new Error("Password alphabet is too small")); }

  var hashedPassword = sha512(cfg.masterPassword);
  var hashedDomain = sha512(cfg.domain);
  var salt = sha512(hashedPassword + hashedDomain);
  var domainPassword = sha512(hashedPassword + masterPassword);
  var iterations = 1024 * 256;

  crypto.pbkdf2(domainPassword, salt, iterations, 256, 'sha256', function (err, key) {
    if (err) {
      f(err);
      return;
    }

    f(false, encode(cfg, key));
  });
};

function encode(cfg, key) {
  var chars = [];
  var pos = 0, offset = 0;
  var bytesPerChar = Math.floor(key.length / cfg.length);
  if (bytesPerChar < 1) { throw new Error("Password length is too long for selected hash function"); }

  while (chars.length < cfg.length) {
    for (var i=0; i < bytesPerChar; i++) { offset ^= key[pos++] & 0xFF; }
    chars.push(cfg.alphabet[offset % cfg.alphabet.length]);
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
