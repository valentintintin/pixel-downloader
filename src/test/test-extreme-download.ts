import { ExtremeDownload } from '../sites/extreme-download';

const site = new ExtremeDownload();

site.getRecents().subscribe(res => console.log(res));
site.search('doctor who').subscribe(res => console.log(res));
site.getDetails('https://www1.extreme-download.me/series-hd/hd-series-vf/59842-doctor-who-2005-saison-11-french-720p.html').subscribe(res => console.log(res));
site.getDetails('https://www1.extreme-download.me/films-sd/dvdrip/58794-venom-french-bdrip.html').subscribe(res => console.log(res));
site.getDetails('https://www1.extreme-download.me/series/vostfr/6060-multi-doctor-who-2005-saison-06-vostfr.html').subscribe(res => console.log(res));
