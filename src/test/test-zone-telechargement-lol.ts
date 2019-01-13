import { ZoneTelechargementLol } from '../sites/zone-telechargement-lol';

const site = new ZoneTelechargementLol();

site.getRecents().subscribe(res => console.log(res));
site.search('doctor who').subscribe(res => console.log(res));
site.getDetails('https://www.zone-telechargement2.lol/telecharger-series/14483-doctor-who-2005-saison-1-hdtv-french.html').subscribe(res => console.log(res));
site.getDetails('https://www.zone-telechargement2.lol/films-gratuit/463061-hippocrate-HDLight%201080p-French.html').subscribe(res => console.log(res));