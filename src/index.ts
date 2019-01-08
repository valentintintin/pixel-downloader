import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { JDownloader } from './JDownloader';
import { prompt } from 'enquirer';

import * as config from './config';
import { Site } from './sites/site';
import { LinkInterface } from './interfaces/link-interface';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { PageVersionInterface } from './interfaces/page-version-interface';
import { PageDetailInterface } from './interfaces/page-detail-interface';
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
    return menu('Save links ?', links.map(l => {
            return {
                data: l,
                text: (l.host ? l.host + ' - ' : '') + l.title + (l.size ? ' - ' + l.size : '') + (l.date ? ' - ' + l.date : '')
            };
        })
    ).pipe(
        map((linksToAdd: LinkInterface[]) => {
            const linksAdded = jd.addLinksToQueue(linksToAdd);
            console.log(linksAdded.length + ' links added to queue');
            return linksAdded;
        })
    );
}

function doJdownloaderFlush(): Observable<LinkInterface[]> {
    const spinner = ora('Adding links to JDownloader');
    return Observable.create(observer => {
        spinner.start();
        observer.next();
        observer.complete();
    }).pipe(
        switchMap(() => jd.flushQueue()),
        tap(res => {
            spinner.succeed('Result: ' + res);
        })
    );
}

function doRecents(): Observable<LinkInterface[]> {
    const spinner = ora('Searching in ' + sites[0].baseUrl).start();
    return sites[0].getRecents().pipe(
        switchMap(result => {
            spinner.succeed();
            return menu('Which one to choose', result.map(r => {
                return {
                    data: r.link,
                    text: r.title + (r.category ? ' - ' + r.category : '') + (r.date ? ' - ' + r.date : '')
                };
            }));
        }),
        switchMap((page: string[]) => {
            spinner.start('Loading links');
            return sites[0].getDetails(page[0]);
        }),
        switchMap((result: PageDetailInterface) => {
            spinner.succeed(result.fileLinks.length + ' links found !');
            return selectLinksToSave(result.fileLinks);
        })
    );
}

function doSearch(): Observable<LinkInterface[]> {
    const spinner = ora('Searching in ' + sites[0].baseUrl);
    return ask('What would you to search ?').pipe(
        switchMap(query => {
            spinner.start();
            return sites[0].search(query);
        }),
        switchMap((result: PageVersionInterface[]) => {
            spinner.succeed();
            return menu('Which one to choose ?', result.map(r => {
                return {
                    data: r.url,
                    text: r.title + (r.language ? ' ' + r.language : '') + (r.quality ? ' ' + r.quality : '')
                };
            }));
        }),
        switchMap((page: string[]) => {
            spinner.start('Loading links');
            return sites[0].getDetails(page[0]);
        }),
        switchMap(result => {
            spinner.succeed(result.fileLinks.length + ' links found for ' + result.title + (result.language ? ' ' + result.language : '') + (result.quality ? ' ' + result.quality : ''));
            return selectLinksToSave(result.fileLinks);
        })
    );
}

function main() {
    menu('What would you like to do ?', [
        {
            text: 'Search for download',
            data: doSearch
        },
        {
            text: 'Get recents downloads uploaded',
            data: doRecents
        },
        {
            text: 'Add links selected to JDownloader',
            data: doJdownloaderFlush
        },
        {
            text: 'Exit'
        }
    ]).subscribe((choice: Function[]) => {
        if (choice.length && typeof choice[0] === 'function') {
            choice[0]().subscribe((result) => console.log(result), (err) => {
                console.error(err);
            }, () => main());
        } else {
            console.log('Bye !');
            process.exit(0);
        }
    }, error => {
        console.error(error);
    });
}

function menu(text: string, items: MenuInterface[], none = false, multiple = false): Observable<any | any[]> {
    return Observable.create(observer => {
        prompt({
            type: multiple ? 'multiselect' : 'select',
            name: 'choice',
            muliple: multiple,
            message: text,
            initial: 0,
            choices: items.map(m => {
                return {
                    name: m.text,
                    message: m.text,
                    value: m
                };
            }),
            result(value) {
                // this will return the value choice
                return this.choices.filter(choice => choice.name === value).map(choice => choice.value);
            }
        }).then((choosen: any) => {
            const items: MenuInterface[] = choosen.choice;
            observer.next(items.map(c => c.data));
            observer.complete();
        });
    });
}

function ask(text: string): Observable<string> {
    return Observable.create(observer => {
        prompt({
            type: 'input',
            name: 'typed',
            message: text
        }).then((answer: any) => {
            observer.next(answer.typed);
            observer.complete();
        });
    });
}

interface MenuInterface {
    text: string;
    data?: any;
}
