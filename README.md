# EVERCLI

It's a simple CLI tool which let you could use and manage evernote easily on terminal. Not going to support full functions of evernote only the necessary parts.

## Usage

> evercli [options] [data]

If you're first time use the tool, it'll ask you input evernote developer token first, please go [evernote](http://dev.evernote.com/) and apply one first. (Note: They provide develop and production token, apply production if you want to use in real environment)

### search

> evercli search {keyword}

Search your notes which contains specific keyword.

## Reference

* evernote thrift from [cloudsnap](https://github.com/cloudsnap/evernode)
* bugfix version under thrift 0.9 and evernote api 1.23 by [berryboy](https://github.com/berryboy/evernode)
