"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const extreme_download_1 = require("../sites/extreme-download");
const site = new extreme_download_1.ExtremeDownload();
site.getRecents().subscribe(res => console.log(res));
site.search('doctor who').subscribe(res => console.log(res));
site.getDetails(site.baseUrl + '/series-hd/hd-series-vf/59842-doctor-who-2005-saison-11-french-720p.html').subscribe(res => console.log(res));
site.getDetails(site.baseUrl + '/films-sd/dvdrip/58794-venom-french-bdrip.html').subscribe(res => console.log(res));
site.getDetails(site.baseUrl + '/series/vostfr/6060-multi-doctor-who-2005-saison-06-vostfr.html').subscribe(res => console.log(res));
site.getDetails(site.baseUrl + '/mangas/series-vostfr/62382-world-witches-series-501-butai-hasshin-shimasutsu-saison-01-vostfr-720p.html').subscribe(res => console.log(res));
site.getDetails(site.baseUrl + '/films-hd/bluray-720p/10315-chroniques-de-tchernobyl-french-bluray-720p.html').subscribe(res => console.log(res));
//# sourceMappingURL=test-extreme-download.js.map
