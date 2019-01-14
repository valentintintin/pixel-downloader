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

const app: express.Application = express();

const jd = new Jdownloader(config.JDOWNLOADER_LOGIN, config.JDOWNLOADER_PASSWORD, config.JDOWNLOADER_DEVICE_NAME);
const sites: Site[] = [
    new ZoneTelechargementLol(),
    new ZoneTelechargementWorld(),
    new AnnuaireTelechargement()
];

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/recents', (req, res) => {
    const obsSites: Observable<Page[]>[] = [];
    sites.forEach(site => obsSites.push(site.getRecents()));

    const query = req.query.search ? req.query.search : null;

    console.log('Start /recents?query=' + query);

    combineLatest(obsSites).pipe(
        map(res => [].concat(...res).filter((r: Page) => !query || r.title.toLowerCase().includes(query)))
    ).subscribe(results => {
        console.log('Stop /recents?query=' + query + ' - ' + results.length + ' results');
        res.json(results.map((s: Page) => {
            s.site = null; // bad !!
            return s;
        }));
    });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});