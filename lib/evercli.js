
exports = module.exports = evercli;

// nodejs core module
var path = require('path');
var crypto = require('crypto');

// third-party module
var clc = require('cli-color');
var thrift = require('thrift');
var async = require('async');
var _ = require('underscore.string');

// nodejs thrift library
var userStore = require('./gen-nodejs/UserStore');
var userType = require('./gen-nodejs/UserStore_types');
var noteStore = require('./gen-nodejs/NoteStore');
var noteType = require('./gen-nodejs/NoteStore_types');
var everType = require('./gen-nodejs/Types_types');
var httpsConnection = require('./evernode/HttpsConnection');
var config = require(path.resolve(__dirname, '..', 'evercli.json'));

// private function for internal usage
function getUserClient () {
  var conn = httpsConnection.createHTTPSConnection('sandbox.evernote.com', 443, '/edam/user');

  conn.on('error', function(err) {
    console.log(clc.red('Error on connection evernote api:'));
    console.log(err);
  });

  return thrift.createClient(userStore, conn);
}
function getNoteClient (userObj) {
  var conn = httpsConnection.createHTTPSConnection('sandbox.evernote.com', 443, '/edam/note/' + userObj.shardId);

  conn.on('error', function(err) {
    console.log(clc.red('Error on connection evernote api:'));
    console.log(err);
  });

  return thrift.createClient(noteStore, conn);
}


function evercli(options) {
  options = options || {};
  this.options = options;
}

evercli.prototype.create = function(title, content) {
  async.waterfall([
    function(done) {
      var client = getUserClient();
      client.getUser(config.token, function(err, response) {
        if (err) {
          done(err);
        } else {
          done(null, response);
        }
      });
    },
    function(userObj, done) {
      var enml_format = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd"><en-note>%s</en-note>';
      var note = {
        title: title,
        content: _.sprintf(enml_format, content),
        created: new Date().getTime(),
        contentLength: content.length
      }
      var noteType = new everType.Note(note);

      var client = getNoteClient(userObj);
      client.createNote(config.token, noteType, function(err, response) {
        if (err) {
          done(err);
        } else {
          done(null, response);
        }
      });
    }
  ], function(err, result) {
    if (err) {
      console.error(clc.red("Error return from API: "));
      console.error(err);
    } else {
      console.log('success create note!');
      console.log(result);
    }
  });
}

evercli.prototype.search = function(keyword, cb) {
  async.waterfall([
    function(done) {
      var client = getUserClient();
      client.getUser(config.token, function(err, response) {
        if (err) {
          done(err);
        } else {
          done(null, response);
        }
      });
    },
    function(userObj, done) {
      var noteFilter = new noteType.NoteFilter();
      noteFilter.words = keyword;

      var client = getNoteClient(userObj);
      client.findNotes(config.token, noteFilter, 0, 10, function(err, response) {
        if (err) {
          done(err);
        } else {
          done(null, response);
        }
      });
    }
  ], function(err, result) {
    if (err) {
      console.error(clc.red("Error back from API: "));
      console.error(err);
    } else {
      if (result.notes) {
        console.log(clc.green("Total notes have [" + keyword + "] : " + result.totalNotes + "\n"));
        for (var i = 0; i < result.notes.length; i++) {
          var note = result.notes[i];
          console.log(clc.white("Id: " + note.guid + " Title: " + note.title));
        }
      }
    }
  });
}
