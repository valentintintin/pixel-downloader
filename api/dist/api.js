"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("./config");
const zone_warez_1 = require("./sites/zone-warez");
const express = require("express");
const page_dto_1 = require("./models/dto/page-dto");
const extreme_download_1 = require("./sites/extreme-download");
const zone_annuaire_1 = require("./sites/zone-annuaire");
const link_dto_1 = require("./models/dto/link-dto");
const zone_telechargement_1 = require("./sites/zone-telechargement");
const annuaire_telechargement_1 = require("./sites/annuaire-telechargement");
class Api {
    constructor() {
        this.app = express();
        this.sites = [
            new zone_warez_1.ZoneWarez(),
            new zone_annuaire_1.ZoneAnnuaire(),
            new extreme_download_1.ExtremeDownload(),
            new zone_telechargement_1.ZoneTelechargement(),
            new annuaire_telechargement_1.AnnuaireTelechargement(),
        ];
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use((req, res, next) => {
            console.log(new Date().toLocaleString(), req.method, req.path, 'start');
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.on('finish', () => {
                console.log(new Date().toLocaleString(), req.method, req.path, 'stopped', res.statusCode);
            });
            next();
        });
        this.app.options('*', (req, res) => {
            res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
            res.send();
        });
        this.app.get('/api/sites', (req, res, next) => {
            res.json(this.sites.map(s => new link_dto_1.LinkDto(s.name, s.baseUrl, s.baseUrl)));
        });
        this.app.get('/api/recents/:siteName', (req, res, next) => {
            this.getSiteByName(req.params['siteName']).getRecents()
                .subscribe(results => {
                res.json(results.map((p) => page_dto_1.PageDto.fromObject(p)));
            }, err => next(err));
        });
        this.app.get('/api/search/:siteName', (req, res, next) => {
            this.getSiteByName(req.params['siteName']).search(req.query.query)
                .subscribe(results => {
                res.json(results.map((p) => page_dto_1.PageDto.fromObject(p)));
            }, err => next(err));
        });
        this.app.get('/api/details', (req, res, next) => {
            const link = req.query.link;
            const host = req.query.site;
            if (link && host) {
                this.getSiteByName(host).getDetails(link)
                    .subscribe(result => {
                    res.json(page_dto_1.PageDto.fromObject(result));
                }, err => next(err));
            }
            else {
                console.error('Link and host must be valid');
                res.statusCode = 400;
                res.send('Link and host must be valid');
            }
        });
        this.app.use((error, req, res, next) => {
            console.error('Error : ' + error);
            res.statusCode = 500;
            res.send(error.message);
        });
    }
    getSiteByName(name) {
        return this.sites.find(s => s.name == name);
    }
    run() {
        this.app.listen(config.API_PORT, () => {
            console.log('Downloader - Server listening on port ' + config.API_PORT);
        });
    }
}
exports.Api = Api;
//# sourceMappingURL=api.js.map