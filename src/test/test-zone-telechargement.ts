import { ZoneTelechargement } from '../sites/zone-telechargement';

const site = new ZoneTelechargement();

// site.getRecents().subscribe(res => console.log(res));
// site.search('doctor who').subscribe(res => console.log(res));
// site.getDetails(site.baseUrl + '/telecharger-series/14483-doctor-who-2005-saison-1-hdtv-french.html').subscribe(res => console.log(res));
// site.getDetails(site.baseUrl + '/films-gratuit/463061-hippocrate-HDLight%201080p-French.html').subscribe(res => console.log(res));
site.getDetails(site.baseUrl + '/films-gratuit/485759-x-men-dark-phoenix-TS%20MD-TrueFrench.html').subscribe(res => console.log(res));
