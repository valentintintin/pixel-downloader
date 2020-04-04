import { AnnuaireTelechargement } from '../sites/annuaire-telechargement';

describe('AnnuaireTelechargement', () => {
    const site = new AnnuaireTelechargement();

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
        site.getDetails(site.baseUrl + '/?p=serie&id=364-doctor-who-2005-saison10').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });

    test('Détails 2', done => {
        site.getDetails(site.baseUrl + '/?p=film&id=10486-doctor-who-the-day-of-the-doctor').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
});
