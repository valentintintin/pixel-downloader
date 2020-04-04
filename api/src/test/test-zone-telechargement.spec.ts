import { ZoneTelechargement } from '../sites/zone-telechargement';

describe('ZoneTelechargement', () => {
    const site = new ZoneTelechargement();

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
        site.getDetails(site.baseUrl + '/?p=films&id=10486-doctor-who-the-day-of-the-doctor').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
});
