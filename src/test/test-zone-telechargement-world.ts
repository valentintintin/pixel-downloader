import { ZoneTelechargementWorld } from '../sites/zone-telechargement-world';

const site = new ZoneTelechargementWorld();

site.getRecents().subscribe(res => console.log(res));
site.search('doctor who').subscribe(res => console.log(res));
site.getDetails('https://www.zone-telechargement.world/films/exclue/161972-venom.html').subscribe(res => console.log(res));
site.getDetails('https://www.zone-telechargement.world/series/series-vostfr-720p/139608-doctor-who-2005-saison-10.html').subscribe(res => console.log(res));