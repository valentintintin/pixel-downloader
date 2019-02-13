import { Jdownloader } from './jdownloader';
import * as config from './config';
import { Site } from './sites/site';
import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { ZoneTelechargementWorld } from './sites/zone-telechargement-world';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page } from './models/page';
import * as express from 'express';
import { PageDto } from './models/dto/page-dto';
import { SiteNotFoundException } from './models/site-not-found.exception';
import * as path from 'path';
import { LinkDto } from './models/dto/link-dto';
import { Link } from './models/link';
import { ExtremeDownload } from './sites/extreme-download';

export class Api {

    private readonly app: express.Application = express();
    private readonly jd = new Jdownloader(config.JDOWNLOADER_LOGIN, config.JDOWNLOADER_PASSWORD, config.JDOWNLOADER_DEVICE_NAME);
    private readonly sites: Site[] = [
        new ZoneTelechargementLol(),
        new ZoneTelechargementWorld(),
        // new AnnuaireTelechargement(),
        new ExtremeDownload()
    ];

    constructor() {
        this.app.use(express.json());

        this.app.get('/', (req, res, next) => {
            res.sendFile(path.join(__dirname + '/../assets/index.html'));
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

        this.app.get('/recents', (req, res, next) => {
            const obsSites: Observable<Page[]>[] = [];
            this.sites.forEach(site => obsSites.push(site.getRecents()));

            const query = req.query.query;

            combineLatest(obsSites).pipe(
                map(res => [].concat(...res).filter((r: Page) => !query || r.title.toLowerCase().includes(query)))
            ).subscribe(results => {
                res.json(results.map((p: Page) => PageDto.fromObject(p)));
            }, err => next(err));
        });

        this.app.get('/search', (req, res, next) => {
            const query = req.query.query;

            const obsSites: Observable<Page[]>[] = [];
            this.sites.forEach(site => obsSites.push(site.search(query)));

            combineLatest(obsSites).pipe(
                map(res => [].concat(...res))
            ).subscribe(results => {
                res.json(results.map((p: Page) => PageDto.fromObject(p)));
            }, err => next(err));
        });

        this.app.get('/details', (req, res, next) => {
            const link = req.query.link;

            let site: Site = null;
            if (link.includes('zone-telechargement.lol')) {
                site = this.sites[0];
            } else if (link.includes('zone-telechargement.world')) {
                site = this.sites[1];
            } /*else if (link.includes('annuaire-telechargement')) {
                site = this.sites[2];
            } */ else if (link.includes('extreme-download')) {
                site = this.sites[2];
            } else {
                throw new SiteNotFoundException(link);
            }

            site.getDetails(link).subscribe(result => {
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