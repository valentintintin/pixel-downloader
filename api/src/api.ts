import * as config from './config';
import { Site } from './sites/site';
import { ZoneWarez } from './sites/zone-warez';
import { Page } from './models/page';
import * as express from 'express';
import { PageDto } from './models/dto/page-dto';
import { ExtremeDownload } from './sites/extreme-download';
import { ZoneAnnuaire } from './sites/zone-annuaire';
import { LinkDto } from './models/dto/link-dto';
import { ZoneTelechargement } from './sites/zone-telechargement';
import { AnnuaireTelechargement } from './sites/annuaire-telechargement';

export class Api {

    private readonly app: express.Application = express();
    private readonly sites: Site[] = [
        new ZoneWarez(),
        new ZoneAnnuaire(),
        new ExtremeDownload(),
        new ZoneTelechargement(),
        new AnnuaireTelechargement(),
    ];

    private getSiteByName(name: string): Site {
        return this.sites.find(s => s.name == name);
    }

    constructor() {
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
            res.json(this.sites.map(s => new LinkDto(s.name, s.baseUrl, s.baseUrl)));
        });

        this.app.get('/api/recents/:siteName', (req, res, next) => {
            this.getSiteByName(req.params['siteName']).getRecents()
                .subscribe(results => {
                    res.json(results.map((p: Page) => PageDto.fromObject(p)));
                }, err => next(err));
        });

        this.app.get('/api/search/:siteName', (req, res, next) => {
            this.getSiteByName(req.params['siteName']).search(req.query.query)
                .subscribe(results => {
                    res.json(results.map((p: Page) => PageDto.fromObject(p)));
                }, err => next(err));
        });

        this.app.get('/api/details', (req, res, next) => {
            const link = req.query.link;
            const host = req.query.site;

            if (link && host) {
                this.getSiteByName(host).getDetails(link)
                    .subscribe(result => {
                        res.json(PageDto.fromObject(result));
                    }, err => next(err));
            } else {
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

    public run() {
        this.app.listen(config.API_PORT, () => {
            console.log('Downloader - Server listening on port ' + config.API_PORT);
        });
    }
}
