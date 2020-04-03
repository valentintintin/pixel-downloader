"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const zone_annuaire_1 = require("../sites/zone-annuaire");
describe('AnnuraireTelechargement', () => {
    const site = new zone_annuaire_1.ZoneAnnuaire();
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
        site.getDetails(site.baseUrl + '/films-gratuit/55107-telecharger-sans-lendemain-dvdrip-avi-french.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
    test('Détails 2', done => {
        site.getDetails(site.baseUrl + '/telecharger-series/page,1,2,3786-sense8-saison-2-hdtv-french.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
});
//# sourceMappingURL=annuaire-telechargement.spec.js.map
