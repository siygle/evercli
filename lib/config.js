var fs = require('fs');
var path = require('path');

module.exports = {
  "key": prompt("key", 'EVERNOTE_KEY'),
  "secret": prompt("secret", 'EVERNOTE_SECRET')
}
