import { MegaTelechargement } from '../sites/mega-telechargement';

const site = new MegaTelechargement();

// site.getRecents().subscribe(res => console.log(res));
// site.search('doctor who').subscribe(res => console.log(res));
site.getDetails(site.baseUrl + '/films/films-bluray-hd/films-bluray-1080p/171393-comme-des-betes-2.html').subscribe(res => console.log(res));
// site.getDetails(site.baseUrl + '/series/series-vostfr-720p/139608-doctor-who-2005-saison-10.html').subscribe(res => console.log(res));
// site.getDetails(site.baseUrl + '/series/series-vf/142729-demain-nous-appartient-saison-1.html').subscribe(res => console.log(res));
