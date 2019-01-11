import { Site } from './sites/site';
import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { ZoneTelechargementWorld } from './sites/zone-telechargement-world';

const sites: Site[] = [
    new ZoneTelechargementLol(),
    new ZoneTelechargementWorld()
];

// const obsSites: Observable<Page[]>[] = [];
// sites.forEach(site => obsSites.push(site.search('doctor who')));
// combineLatest(obsSites).pipe(map(res => [].concat(...res))).subscribe(res => console.log(res));

// sites[1].getDetails('https://www.zone-telechargement.world/series/series-vostfr-720p/139608-doctor-who-2005-saison-10.html').subscribe();
sites[1].getDetails('https://www.zone-telechargement.world/films/dvdrip-mkv-x264/163918-les-vikings.html\n').subscribe();

console.log('end');