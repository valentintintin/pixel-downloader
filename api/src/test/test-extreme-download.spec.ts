import { ExtremeDownload } from '../sites/extreme-download';

describe('ExtremeDownload', () => {
    const site = new ExtremeDownload();

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
        site.getDetails(site.baseUrl + '/series-hd/hd-series-vf/47082-doctor-who-2005-saison-10-french-720p.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });

    test('Détails 2', done => {
        site.getDetails(site.baseUrl + '/films-new-hd/new-films-1080p-x265/60575-venom-multi-bluray-1080p-hdr-x265.html').subscribe(res => {
            console.log(res);
            expect(res.fileLinks.length).toBeGreaterThan(0);
            done();
        });
    });
});
