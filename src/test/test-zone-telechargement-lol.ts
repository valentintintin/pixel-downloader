import { ZoneTelechargementLol } from '../sites/zone-telechargement-lol';

const site = new ZoneTelechargementLol();

// site.getRecents().subscribe(res => console.log(res));
// site.search('doctor who').subscribe(res => console.log(res));
// site.getDetails('https://ww22.zone-telechargement.lol/telecharger-series/14483-doctor-who-2005-saison-1-hdtv-french.html').subscribe(res => console.log(res));
// site.getDetails('https://ww22.zone-telechargement.lol/films-gratuit/463061-hippocrate-HDLight%201080p-French.html').subscribe(res => console.log(res));
site.getDetails('https://ww22.zone-telechargement.lol/films-gratuit/485759-x-men-dark-phoenix-TS%20MD-TrueFrench.html').subscribe(res => console.log(res));
