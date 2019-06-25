import { Jdownloader } from './jdownloader';
import * as config from './config';
import { Site } from './sites/site';
import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { MegaTelechargement } from './sites/mega-telechargement';
import { Page } from './models/page';
import * as express from 'express';
import { PageDto } from './models/dto/page-dto';
import * as path from 'path';
import { LinkDto } from './models/dto/link-dto';
import { Link } from './models/link';
import { ExtremeDownload } from './sites/extreme-download';
import { AnnuaireTelechargement } from './sites/annuaire-telechargement';

export class Api {

    private readonly app: express.Application = express();
    private readonly jd = new Jdownloader(config.JDOWNLOADER_LOGIN, config.JDOWNLOADER_PASSWORD, config.JDOWNLOADER_DEVICE_NAME);
    private readonly sites: Site[] = [
        new ZoneTelechargementLol(),
        new MegaTelechargement(),
        new AnnuaireTelechargement(),
        new ExtremeDownload()
    ];

    private getSiteByName(name: string): Site {
        return this.sites.find(s => s.host == name);
    }

    constructor() {
        this.app.use(express.json());

        this.app.use((req, res, next) => {
            console.log(new Date().toLocaleString(), req.method, req.path, 'start');
            res.on('finish', () => {
                console.log(new Date().toLocaleString(), req.method, req.path, 'stopped', res.statusCode);
            });

            next();
        });

        this.app.get('/', (req, res, next) => {
            res.sendFile(path.join(__dirname + '/../assets/index.html'));
        });

        this.app.get('/sites', (req, res, next) => {
            res.json(this.sites.map(s => s.host));
        });

        this.app.get('/jdownloader/get', (req, res, next) => {
            this.jd.getLinksFromServer().subscribe(results => res.json(results), err => next(err));
        });

        this.app.get('/jdownloader/get-queue', (req, res, next) => {
            res.json(this.jd.linksToAdd.map(l => LinkDto.fromObject(l)));
        });

        this.app.post('/jdownloader/add', (req, res, next) => {
            if (Array.isArray(req.body)) {
                this.jd.addLinksToQueue((req.body as any[]).map(l => new Link(l.title, l.url, l.host)));
            } else {
                this.jd.addLinkToQueue(new Link(req.body.title, req.body.url, req.body.host));
            }
            res.json(this.jd.linksToAdd.map(l => LinkDto.fromObject(l)));
        });

        this.app.get('/jdownloader/flush', (req, res, next) => {
            this.jd.flushQueueToServer().subscribe(results => res.json(results), err => next(err));
        });

        this.app.get('/recents/:siteName', (req, res, next) => {
            this.getSiteByName(req.params['siteName']).getRecents()
                .subscribe(results => {
                    res.json(results.map((p: Page) => PageDto.fromObject(p)));
                }, err => next(err));
        });

        this.app.get('/search/:siteName', (req, res, next) => {
            const query = req.query.query;

            this.getSiteByName(req.params['siteName']).search(query)
                .subscribe(results => {
                    res.json(results.map((p: Page) => PageDto.fromObject(p)));
                }, err => next(err));
        });

        this.app.get('/details', (req, res, next) => {
            const link = req.query.link;
            const site = req.query.site;

            this.getSiteByName(site).getDetails(link)
                .subscribe(result => {
                    res.json(PageDto.fromObject(result));
                }, err => next(err));
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
