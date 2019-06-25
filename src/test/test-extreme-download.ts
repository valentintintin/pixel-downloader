import { ExtremeDownload } from '../sites/extreme-download';

const site = new ExtremeDownload();

site.getRecents().subscribe(res => console.log(res));
site.search('doctor who').subscribe(res => console.log(res));
site.getDetails('https://www3.extreme-download.co/series-hd/hd-series-vf/59842-doctor-who-2005-saison-11-french-720p.html').subscribe(res => console.log(res));
site.getDetails('https://www3.extreme-download.co/films-sd/dvdrip/58794-venom-french-bdrip.html').subscribe(res => console.log(res));
site.getDetails('https://www3.extreme-download.co/series/vostfr/6060-multi-doctor-who-2005-saison-06-vostfr.html').subscribe(res => console.log(res));
site.getDetails('https://www3.extreme-download.co/mangas/series-vostfr/62382-world-witches-series-501-butai-hasshin-shimasutsu-saison-01-vostfr-720p.html').subscribe(res => console.log(res));
