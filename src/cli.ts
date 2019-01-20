import { Jdownloader } from './jdownloader';
import * as config from './config';
import { Site } from './sites/site';
import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { Link } from './models/link';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { prompt } from 'enquirer';
import { Page } from './models/page';
import { ZoneTelechargementWorld } from './sites/zone-telechargement-world';
import { Utils } from './utils';
import { NoLinkException } from './models/no-link.exception';
import { AnnuaireTelechargement } from './sites/annuaire-telechargement';
import { ExtremeDownload } from './sites/extreme-download';
import ora = require('ora');

export class Cli {

    private readonly jd = new Jdownloader(config.JDOWNLOADER_LOGIN, config.JDOWNLOADER_PASSWORD, config.JDOWNLOADER_DEVICE_NAME);
    private readonly sites: Site[] = [
        new ZoneTelechargementLol(),
        new ZoneTelechargementWorld(),
        new AnnuaireTelechargement(),
        new ExtremeDownload()
    ];

    private spinner = ora();

    constructor() {
    }

    public run(argv: string[] = []) {
        let query: string = null;
        let host: string = null;
        if (argv.length > 1) {
            query = argv[1].toLowerCase().trim();
        }
        if (argv.length > 2) {
            host = Utils.getHostFromUrl(argv[2]);
        }
        switch (argv[0]) {
            case 'search':
                this.doSearch(query, host).subscribe(null, (err => {
                    console.error(err.message);
                    this.main();
                }), () => this.main());
                break;

            case 'recents':
                this.doRecents(query, host).subscribe(null, (err => {
                    console.error(err.message);
                    this.main();
                }), () => this.main());
                break;

            case 'addJdownload':
                this.doJdownloaderFlush().subscribe(null, (err => {
                    console.error(err.message);
                    this.main();
                }), () => this.main());
                break;

            case 'getJdownload':
                this.doJdownloaderGet().subscribe(null, (err => {
                    console.error(err.message);
                    this.main();
                }), () => this.main());
                break;

            default:
                this.main();
                break;
        }
    }

    private main() {
        this.menu('What would you like to do ?', [
            {
                text: 'Search for download',
                data: 'doSearch'
            },
            {
                text: 'Get recents downloads uploaded',
                data: 'doRecents'
            },
            {
                text: 'Add links selected to your JDownloader',
                data: 'doJdownloaderFlush'
            },
            {
                text: 'Get links from your JDownloader',
                data: 'doJdownloaderGet'
            },
            {
                text: 'Exit'
            }
        ]).subscribe((choice: string[]) => {
            if (choice.length && choice[0]) {
                this[choice[0]]().subscribe(null, (err => {
                    console.error(err.message);
                    this.main();
                }), () => this.main());
            } else {
                console.log('Bye !');
                process.exit(0);
            }
        }, error => {
            console.log('Bye !');
            process.exit(0);
        });
    }

    private doSearch(query: string = null, host: string = null): Observable<Link[]> {
        let start: Observable<string> = this.ask('What would you to search ?');

        if (query) {
            start = of(query);
        }

        return start.pipe(
            switchMap(query => {
                this.spinner.start('Searching in the first page of ' + this.sites.map(s => s.host).join(', '));
                const obsSites: Observable<Page[]>[] = [];
                this.sites.forEach(site => obsSites.push(site.search(query)));
                return combineLatest(obsSites).pipe(map(res => [].concat(...res)));
            }),
            switchMap((result: Page[]) => {
                this.spinner.succeed();
                return this.menu('Which one to choose ?', result.map(r => {
                    return {
                        data: r,
                        text: r.toString() + ' - ' + r.site.host
                    };
                }));
            }),
            switchMap(result => this.selectPageVersionAndLinks(result[0], host))
        );
    }

    private doJdownloaderFlush(): Observable<Link[]> {
        this.spinner = ora('Adding links to JDownloader');
        return Observable.create(observer => {
            this.spinner.start();
            observer.next();
            observer.complete();
        }).pipe(
            switchMap(() => this.jd.flushQueueToServer()),
            tap(res => {
                this.spinner.succeed('Result: ' + res);
            })
        );
    }

    private doJdownloaderGet(): Observable<string[]> {
        this.spinner = ora('Getting links from JDownloader');
        return Observable.create(observer => {
            this.spinner.start();
            observer.next();
            observer.complete();
        }).pipe(
            switchMap(() => this.jd.getLinksFromServer()),
            tap((res: Link[]) => {
                this.spinner.succeed(res.length + ' links found !');
                console.log(res.map(l => l.toString() + ' - ' + l.url).join('\n'));
            })
        );
    }

    private doRecents(query: string = null, host: string = null): Observable<Link[]> {
        this.spinner.start('Getting recents in ' + this.sites.map(s => s.host).join(', '));

        const obsSites: Observable<Page[]>[] = [];
        this.sites.forEach(site => obsSites.push(site.getRecents()));

        return combineLatest(obsSites).pipe(
            map(res => [].concat(...res).filter((r: Page) => !query || r.title.toLowerCase().includes(query))),
            switchMap((result: Page[]) => {
                this.spinner.succeed(result.length + ' pages found !');
                return this.menu('Which one to choose', result.map(r => {
                    return {
                        data: r,
                        text: r.toString() + ' - ' + r.site.host
                    };
                }).sort((a, b) => a.text < b.text ? -1 : 1));
            }),
            switchMap(result => this.selectPageVersionAndLinks(result[0], host))
        );
    }

    private selectPageVersionAndLinks(page: Page, host: string = null): Observable<Link[]> {
        if (!page) {
            throw new NoLinkException('No link found :(');
        }
        console.log('Selected : ' + page.url);
        this.spinner.start('Loading details');

        return page.site.getDetails(page.url).pipe(
            switchMap((result: Page) => {
                this.spinner.succeed((result.relatedPage.length + 1) + ' versions found !');

                if (result.relatedPage.length === 0) {
                    return of(result);
                }
                return this.menu('Which version do you want ?', [
                        {
                            text: result.toString(),
                            data: result
                        }
                    ].concat(result.relatedPage.map(r => {
                        return {
                            text: r.toString(),
                            data: r as Page
                        };
                    }).sort((a, b) => a.text < b.text ? -1 : 1))
                ).pipe(map(result => result[0]));
            }),
            switchMap((r: Page) => {
                let links = of(r.fileLinks);
                if (r.url !== page.url) {
                    this.spinner.start('Loading links ' + page.url);
                    links = r.site.getDetails(r.url).pipe(map((p: Page) => {
                        this.spinner.succeed();
                        return p.fileLinks;
                    }));
                }
                return links.pipe(tap((linksPossible) => this.spinner.succeed(linksPossible.length + ' links found !')));
            }),
            switchMap((links: Link[]) => {
                return this.selectLinksToSave(links, host);
            })
        );
    }

    private selectLinksToSave(links: Link[], hostUser: string = null): Observable<Link[]> {
        const hosts: HostLinksInterface[] = [];
        links.forEach(link => {
            if (!hosts.find(h => h.host.includes(link.host))) {
                hosts.push({
                    host: link.host,
                    nb: links.filter(l => l.host.includes(link.host)).length
                });
            }
        });

        let start = this.menu('Which host would you like ?', hosts.map(h => {
            return {
                text: h.host + ' - ' + h.nb + ' links',
                data: h.host
            };
        }).sort((a, b) => a.text < b.text ? -1 : 1), true);

        if (hostUser !== null) {
            start = of([hostUser]);
        } else if (hosts.length === 1) {
            start = of(hosts);
        }

        return start.pipe(
            switchMap((hostsSelected: string[]) => {
                const linksByHost = links.filter(l => hostsSelected.find(h => l.host.includes(h)));
                console.log(linksByHost.length + ' links found for ' + hostsSelected.join(', ') + ' !');
                return this.menu('Save links ?', linksByHost.map(l => {
                        return {
                            data: l,
                            text: l.toString()
                        };
                    }).sort((a, b) => a.text < b.text ? -1 : 1), true
                ).pipe(
                    map((linksToAdd: Link[]) => {
                        if (!linksToAdd.length) {
                            throw new NoLinkException('No link found :(');
                        }
                        console.log('Links selected : ' + linksToAdd.map(l => l.toString() + ' : ' + l.url).join('\n'));
                        const linksAdded = this.jd.addLinksToQueue(linksToAdd);
                        console.log(linksAdded.length + ' links added to queue');
                        return linksAdded;
                    })
                );
            })
        );
    }


    private menu(text: string, items: MenuInterface[], multiple = false): Observable<any | any[]> {
        if (items.length === 0) {
            return of([]);
        }

        return Observable.create(observer => {
            prompt({
                type: multiple ? 'multiselect' : 'select',
                name: 'choice',
                muliple: multiple,
                message: text,
                choices: items.map(m => {
                    return {
                        name: m.text,
                        message: m.text,
                        value: m
                    };
                }),
                result(value) {
                    let names: string[];
                    if (!Array.isArray(value)) {
                        names = [value];
                    } else {
                        names = value;
                    }
                    return names.map(name => this.choices.find(choice => choice.name === name).value) as any;
                }
            }).then((choosen: any) => {
                const items: MenuInterface[] = choosen.choice;
                observer.next(items.map(c => c.data));
                observer.complete();
            }).catch(err => {
                observer.error(new Error('Back to menu'));
                observer.complete();
            });
        });
    }

    private ask(text: string): Observable<string> {
        return Observable.create(observer => {
            prompt({
                type: 'input',
                name: 'typed',
                message: text
            }).then((answer: any) => {
                observer.next(answer.typed);
                observer.complete();
            }).catch(err => {
                observer.error(new Error('Back to menu'));
                observer.complete();
            });
        });
    }
}

interface MenuInterface {
    text: string;
    data?: any;
}

interface HostLinksInterface {
    host: string;
    nb: number;
}