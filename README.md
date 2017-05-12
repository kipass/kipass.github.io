
# kipass

`kipass` is a simple password manager. You keep or remember a single password
that you never share and derive passwords for each site you use from that.

## Features

* Serverless - Works offline or saved to a USB flash drive
* Secure - PBKDF2 used to derive passwords with SHA256 and SHA512
* Custom - Select individual rules for each site
* Minimal - All the important stuff is in `index.js` is ~50 lines of code

## Usage

* Online - [kipass.github.io](https://kipass.github.io)
* Offline - [Download a release](https://github.com/kipass/kipass.github.io/releases)

## Build Yourself

If you *really* don't trust anyone or anything you can build it yourself using
browserify:

    sudo make install-deps
    make

## FAQ

### Can I recover my master password?

No, without your master password there is no feasible way to recover any of your
passwords.

### Are my passwords stored on disk or in a server?

No, your passwords are based on your master password and the domain name.

### What happens if I lose my laptop or phone?

All of your passwords are based on your master password and the domain name you
are generating a password for. You also need to remember the alphabet and
password length if you changed them, although you can figure that out as long
as you remember the master password.

### Can I export a list of all my passwords?

No, currently you have to enter them in manually. This would be a great feature
for someone to make a pull request!
