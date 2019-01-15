import { Jdownloader } from './jdownloader';
import * as config from './config';
import { Site } from './sites/site';
import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { ZoneTelechargementWorld } from './sites/zone-telechargement-world';
import { AnnuaireTelechargement } from './sites/annuaire-telechargement';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page } from './models/page';
import * as express from 'express';
import { PageDto } from './models/dto/page-dto';
import { SiteNotFoundException } from './models/site-not-found.exception';
import * as path from 'path';
import { LinkDto } from './models/dto/link-dto';
import { Link } from './models/link';

const app: express.Application = express();
app.use(express.json());

const jd = new Jdownloader(config.JDOWNLOADER_LOGIN, config.JDOWNLOADER_PASSWORD, config.JDOWNLOADER_DEVICE_NAME);
const sites: Site[] = [
    new ZoneTelechargementLol(),
    new ZoneTelechargementWorld(),
    new AnnuaireTelechargement()
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../assets/index.html'));
});

app.get('/jdownloader/get', (req, res) => {
    jd.getLinksFromServer().subscribe(results => res.json(results));
});

app.post('/jdownloader/add', (req, res) => {
    jd.addLinkToQueue(new Link(req.body.title, req.body.url, req.body.host));
    res.json(jd.linksToAdd.map(l => LinkDto.fromObject(l)));
});

app.get('/jdownloader/flush', (req, res) => {
    jd.flushQueueToServer().subscribe(results => res.json(results));
});

app.get('/recents', (req, res) => {
    const obsSites: Observable<Page[]>[] = [];
    sites.forEach(site => obsSites.push(site.getRecents()));

    const query = req.query.query;

    console.log('Start /recents?query=' + query);

    combineLatest(obsSites).pipe(
        map(res => [].concat(...res).filter((r: Page) => !query || r.title.toLowerCase().includes(query)))
    ).subscribe(results => {
        console.log('Stop /recents?query=' + query + ' - ' + results.length + ' results');
        res.json(results.map((p: Page) => PageDto.fromObject(p)));
    });
});

app.get('/search', (req, res) => {
    const query = req.query.query;

    const obsSites: Observable<Page[]>[] = [];
    sites.forEach(site => obsSites.push(site.search(query)));

    console.log('Start /search?query=' + query);

    combineLatest(obsSites).pipe(
        map(res => [].concat(...res))
    ).subscribe(results => {
        console.log('Stop /search?query=' + query + ' - ' + results.length + ' results');
        res.json(results.map((p: Page) => PageDto.fromObject(p)));
    });
});

app.get('/details', (req, res) => {
    const link = req.query.link;

    console.log('Start /details/' + req.params.link);

    let site: Site = null;
    if (link.includes('zone-telechargement2.lol')) {
        site = sites[0];
    } else if (link.includes('zone-telechargement.world')) {
        site = sites[1];
    } else if (link.includes('annuaire-telechargement.com')) {
        site = sites[2];
    } else {
        throw new SiteNotFoundException(link);
    }

    site.getDetails(link).subscribe(result => {
        console.log('Stop /details/' + req.params.link);
        res.json(PageDto.fromObject(result));
    });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});