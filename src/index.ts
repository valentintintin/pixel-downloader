import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';

const zt = new ZoneTelechargementLol();

zt.search(process.argv[2]).subscribe(result => {
    result.forEach(page => {
        zt.details(page.url).subscribe(result => {
            console.log(page.title);
            console.log(result);
        });
    });
});
