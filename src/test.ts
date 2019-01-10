import { Site } from './sites/site';
import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { ZoneTelechargementWorld } from './sites/zone-telechargement-world';
import { merge, Observable } from 'rxjs';
import { RssItem } from './models/rss-item';
import { concatAll } from 'rxjs/operators';

const sites: Site[] = [
    new ZoneTelechargementLol(),
    new ZoneTelechargementWorld()
];

const obsSites: Observable<RssItem[]>[] = [];
sites.forEach(site => obsSites.push(site.getRecents()));
merge(obsSites).pipe(concatAll()).subscribe(res => console.log(res));