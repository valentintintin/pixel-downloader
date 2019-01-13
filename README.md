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

## Install & run

1. Install npm packaged with `npm install`.
2. Install `npm i -g ts-node` or transpile TypeScript files by your own.
3. Run with following command `ts-node src/index.ts` OR if you transpiled by your own with `node {dirDist}/index.js ...`.

### Arguments

`index.ts [search|recents] (("query") ("uploaderHost"))`

* `search` : run the search for query if specified
* `recents` : get all recents links added to sites (by RSS) and search with query if specified

If the `uploaderHost` is specified, only links with this one are taken.