var evercli = require('../lib/evercli');

var test = new evercli();
test.search('Evernote');
//
test.create('title', '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd"><en-note><p>TEST!</p></en-note>');
