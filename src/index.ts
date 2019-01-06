import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { JDownloader } from './JDownloader';
import * as config from './config';

const zt = new ZoneTelechargementLol();
const jd = new JDownloader(config.JDOWNLOADER_LOGIN, config.JDOWNLOADER_PASSWORD, config.JDOWNLOADER_DEVICE_NAME);

// jd.addLinkToQueue('');
// jd.flushQueue().subscribe((res) => console.log(res));

zt.getRecents().subscribe(items => console.log(items));
zt.search(process.argv[2]).subscribe(result => {
    result.forEach(page => {
        zt.getDetails(page.url).subscribe(result => {
            console.log(page.title);
            console.log(result);
        });
    });
});
