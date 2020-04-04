"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mega_telechargement_1 = require("../sites/mega-telechargement");
describe('MegaTelechargement', () => {
    const site = new mega_telechargement_1.MegaTelechargement();
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
        site.getDetails(site.baseUrl + '/films/films-bluray-hd/films-bluray-1080p/171393-comme-des-betes-2.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 2', done => {
        site.getDetails(site.baseUrl + '/series/series-vostfr-720p/139608-doctor-who-2005-saison-10.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 3', done => {
        site.getDetails(site.baseUrl + '/series/series-vf/142729-demain-nous-appartient-saison-1.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
});
//# sourceMappingURL=test-mega-telechargement.spec.js.map