"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const extreme_download_1 = require("../sites/extreme-download");
describe('ExtremeDownload', () => {
    const site = new extreme_download_1.ExtremeDownload();
    test('Recents', done => {
        site.getRecents().subscribe(res => {
            console.log(res);
            expect(res.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Search Doctor Who', done => {
        site.search('doctor who').subscribe(res => {
            console.log(res);
            expect(res.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 1', done => {
        site.getDetails(site.baseUrl + '/series-hd/hd-series-vf/59842-doctor-who-2005-saison-11-french-720p.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 2', done => {
        site.getDetails(site.baseUrl + '/films-sd/dvdrip/58794-venom-french-bdrip.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 3', done => {
        site.getDetails(site.baseUrl + '/series/vostfr/6060-multi-doctor-who-2005-saison-06-vostfr.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 4', done => {
        site.getDetails(site.baseUrl + '/mangas/series-vostfr/62382-world-witches-series-501-butai-hasshin-shimasutsu-saison-01-vostfr-720p.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 5', done => {
        site.getDetails(site.baseUrl + '/films-hd/bluray-720p/10315-chroniques-de-tchernobyl-french-bluray-720p.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 6', done => {
        site.getDetails(site.baseUrl + '/series/vostfr/10006-doctor-who-2005-saison-07-vostfr.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            expect(res.image).not.toBeNull();
            done();
        });
    });
});
//# sourceMappingURL=test-extreme-download.spec.js.map
