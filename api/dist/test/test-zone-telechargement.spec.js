"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const zone_warez_1 = require("../sites/zone-warez");
describe('ZoneTelechargement', () => {
    const site = new zone_warez_1.ZoneWarez();
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
        site.getDetails(site.baseUrl + '/telecharger-series/14483-doctor-who-2005-saison-1-hdtv-french.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 2', done => {
        site.getDetails(site.baseUrl + '/films-gratuit/463061-hippocrate-HDLight%201080p-French.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 3', done => {
        site.getDetails(site.baseUrl + '/films-gratuit/14045-tchernobyl-truefrench-dvdrip.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
});
//# sourceMappingURL=test-zone-telechargement.spec.js.map
