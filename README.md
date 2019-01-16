# download-sites-automation
Tools to search from warez sites.

Monitor and auto download are for a next version.

## Description

This tool only search inside :
* https://www.zone-telechargement2.lol
* https://www.zone-telechargement.world
* https://www.annuaire-telechargement.com

It can do :
* Search inside website
* Retrieve all versions of a link
* Retrieve all download link
* Send links selected to your JDownloader
* Get links from your JDownloader

Interface :
* Command Line
* Web with API (default: `http://localhost:3000`)

## Install & run

1. Install npm packaged with `npm install`.
2. Run with following command `npm start` or `npm run start-pi` or `ts-node dist/index.ts`

### Arguments

`index.ts [api|search|recents] ("query" ("uploaderHost"))`

* `api` : run the server with simple HTML page and API on port (default: `3000`)

Only for command line :
* `search` : run the search for query if specified
* `recents` : get all recents links added to sites (by RSS) and search with query if specified

If the `uploaderHost` is specified, only links with this one are taken.