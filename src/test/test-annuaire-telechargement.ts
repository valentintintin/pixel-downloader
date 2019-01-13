import { AnnuaireTelechargement } from '../sites/annuaire-telechargement';

const site = new AnnuaireTelechargement();

site.getRecents().subscribe(res => console.log(res));
site.search('doctor who').subscribe(res => console.log(res));
site.getDetails('https://www.annuaire-telechargement.com/films-gratuit/55107-telecharger-sans-lendemain-dvdrip-avi-french.html').subscribe(res => console.log(res));
site.getDetails('https://www.annuaire-telechargement.com/telecharger-series/page,1,2,3786-sense8-saison-2-hdtv-french.html').subscribe(res => console.log(res));