
exports = module.exports = evercli;

var path = require('path');
var crypto = require('crypto');
var clc = require('cli-color');
var thrift = require('thrift');
var async = require('async');
var userStore = require('./gen-nodejs/UserStore');
var userType = require('./gen-nodejs/UserStore_types');
var noteStore = require('./gen-nodejs/NoteStore');
var noteType = require('./gen-nodejs/NoteStore_types');
var everType = require('./gen-nodejs/Types_types');
//var connection = thrift.createConnection('sandbox.evernote.com', 443, '/edam/user');
var httpsConnection = require('./evernode/HttpsConnection');
var connection = httpsConnection.createHTTPSConnection('sandbox.evernote.com', 443, '/edam/user');
var client = thrift.createClient(userStore, connection);
var config = require(path.resolve(__dirname, '..', 'evercli.json'));
var everObj = {};

connection.on('error', function(err) {
  console.log(clc.red('Error on connection evernote api:'));
  console.log(err);
});

function evercli(options) {
  options = options || {};
  this.options = options;
}

evercli.prototype.create = function(title, content) {
  console.log(title + "|" + content);
  async.waterfall([
    function(done) {
      client.getUser(config.token, function(err, response) {
        if (err) {
          done(err);
        } else {
          done(null, response);
        }
      });
    },
    function(userObj, done) {
      var noteConnection = httpsConnection.createHTTPSConnection('sandbox.evernote.com', 443, '/edam/note/' + userObj.shardId);
      var noteClient = thrift.createClient(noteStore, noteConnection);
      var noteType = new everType.Note();
      var note = {
        title: title,
        content: content,
        created: new Date().getTime(),
        contentLength: content.length
      }
      var noteType = new everType.Note(note);
      noteClient.createNote(config.token, noteType, function(err, response) {
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
      client.getUser(config.token, function(err, response) {
        if (err) {
          done(err);
        } else {
          done(null, response);
        }
      });
    },
    function(userObj, done) {
      var noteConnection = httpsConnection.createHTTPSConnection('sandbox.evernote.com', 443, '/edam/note/' + userObj.shardId);
      var noteClient = thrift.createClient(noteStore, noteConnection);
      var noteFilter = new noteType.NoteFilter();
      noteFilter.words = keyword;
      noteClient.findNotes(config.token, noteFilter, 0, 10, function(err, response) {
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
