# pixel-downloader
Tools to search on french warez sites.

## Description

This tool search inside a few french warez website :
* Zone-telechargement
* Mega-telechargement
* Wawacity
* Extra-download

It can do :
* Search inside website
* Retrieve all versions of a link
* Retrieve all download link
* ~~Send links selected to your JDownloader~~
* ~~Get links from your JDownloader~~

Interface : Website with API (default: `http://localhost:3000`)

## Install & run

1. Install npm packaged with `npm install`.
2. Run with following command `npm start` or `ts-node dist/index.ts`

### Docker

You can use the `docker-compose.example.yml` with `docker-compose up -d` or
run `docker run -p 3000:3000 --name pixel-downloader pixel-downloader`
