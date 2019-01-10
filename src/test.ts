import { Site } from './sites/site';
import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { ZoneTelechargementWorld } from './sites/zone-telechargement-world';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page } from './models/page';

const sites: Site[] = [
    new ZoneTelechargementLol(),
    new ZoneTelechargementWorld()
];

const obsSites: Observable<Page[]>[] = [];
sites.forEach(site => obsSites.push(site.search('doctor who')));
combineLatest(obsSites).pipe(map(res => [].concat(...res))).subscribe(res => console.log(res));