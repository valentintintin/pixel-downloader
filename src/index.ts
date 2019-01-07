import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { JDownloader } from './JDownloader';
import { prompt } from 'enquirer';

import * as config from './config';
import { Site } from './sites/site';
import { LinkInterface } from './interfaces/link-interface';
import { Observable } from 'rxjs';
import ora = require('ora');

// const pkg = require('../package.json');

// const conf = new Configstore(pkg.name);

const jd = new JDownloader(config.JDOWNLOADER_LOGIN, config.JDOWNLOADER_PASSWORD, config.JDOWNLOADER_DEVICE_NAME);
const sites: Site[] = [
    new ZoneTelechargementLol()
];

// sites[0].getDetails('https://www.zone-telechargement2.lol/films-gratuit/8689--Pay-The-Ghost.html').subscribe();
main();

function selectLinksToSave(links: LinkInterface[]): Observable<LinkInterface[]> {
    return Observable.create(observer => {
        prompt({
            type: 'multiselect',
            name: 'choices',
            message: 'Save links ?',
            muliple: true,
            sort: true,
            initial: 0,
            choices: links.map(l => {
                return {
                    name: l.url,
                    message: (l.host ? l.host + ' - ' : '') + l.title + (l.size ? ' - ' + l.size : '') + (l.date ? ' - ' + l.date : '')
                };
            })
        }).then((linksToAdd: any) => {
            console.log(linksToAdd);
            linksToAdd.choices.forEach(link => jd.addLinkToQueue(link));
            observer.next(linksToAdd.choices);
            observer.complete();
        });
    });
}

function doJdownloaderFlush() {
    const spinner = ora('Adding links to JDownloader').start();
    jd.flushQueue().subscribe((res) => {
        spinner.succeed('Result: ' + res);
        main();
    });
}

function doRecents() {
    const spinner = ora('Searching in ' + sites[0].baseUrl).start();
    sites[0].getRecents().subscribe(result => {
        spinner.succeed();
        prompt({
            type: 'select',
            name: 'choice',
            message: 'Which one to choose',
            initial: 0,
            choices: result.map(r => {
                return {
                    name: r.link,
                    message: r.title + (r.category ? ' - ' + r.category : '') + (r.date ? ' - ' + r.date : '')
                };
            })
        }).then((page: any) => {
            spinner.start('Loading links');
            sites[0].getDetails(page.choice).subscribe(result => {
                spinner.succeed(result.fileLinks.length + ' links found !');
                selectLinksToSave(result.fileLinks).subscribe((linksAdded) => {
                    console.log(linksAdded.length + ' links added to queue');
                    main();
                });
            });
        });
    });
}

function doSearch() {
    prompt({
        type: 'input',
        name: 'query',
        message: 'What would you to search ?'
    }).then((query: any) => {
        const spinner = ora('Searching in ' + sites[0].baseUrl).start();
        sites[0].search(query.query).subscribe(result => {
            spinner.succeed();
            prompt({
                type: 'select',
                name: 'choice',
                message: 'Which one to choose',
                initial: 0,
                choices: result.map(r => {
                    return {
                        name: r.url,
                        message: r.title + (r.language ? ' ' + r.language : '') + (r.quality ? ' ' + r.quality : '')
                    };
                })
            }).then((page: any) => {
                spinner.start('Loading links');
                sites[0].getDetails(page.choice).subscribe(result => {
                    spinner.succeed(result.fileLinks.length + ' links found for ' + result.title + (result.language ? ' ' + result.language : '') + (result.quality ? ' ' + result.quality : ''));
                    selectLinksToSave(result.fileLinks).subscribe((linksAdded) => {
                        console.log(linksAdded.length + ' links added to queue');
                        main();
                    });
                });
            });
        });
    });
}

function main() {
    prompt({
        type: 'select',
        name: 'choice',
        message: 'What would you like to do ?',
        initial: 0,
        choices: [
            {
                name: 'search',
                message: 'Search for download'
            },
            {
                name: 'recents',
                message: 'Get recents downloads uploaded'
            },
            {
                name: 'jdownloadFlush',
                message: 'Add links selected to JDownloader'
            },
            {
                name: 'exit',
                message: 'Exit'
            }
        ]
    }).then((response: any) => {
        if (response.choice === 'search') {
            doSearch();
        } else if (response.choice === 'recents') {
            doRecents();
        } else if (response.choice === 'jdownloadFlush') {
            doJdownloaderFlush();
        } else {
            console.log('Bye !');
        }
    });
}

function groupBy(xs, key) {
    return xs.reduce((rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
}
