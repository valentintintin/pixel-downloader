import { Jdownloader } from './jdownloader';
import * as config from './config';
import { Site } from './sites/site';
import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { Link } from './models/link';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { prompt } from 'enquirer';
import { Page } from './models/page';
import { RssItem } from './models/rss-item';
import ora = require('ora');

export class Cli {

    private readonly jd = new Jdownloader(config.JDOWNLOADER_LOGIN, config.JDOWNLOADER_PASSWORD, config.JDOWNLOADER_DEVICE_NAME);
    private readonly sites: Site[] = [
        new ZoneTelechargementLol()
    ];

    private spinner = ora();

    constructor() {
    }

    public run(argv: string[] = []) {
        switch (argv[0]) {
            case 'search':
                this.doSearch(argv.length > 1 ? argv[1] : null, argv.length > 2 ? argv[2] : null).subscribe(() => this.main());
                break;

            case 'recents':
                this.doRecents().subscribe(() => this.main());
                break;

            case 'addJdownload':
                this.doJdownloaderFlush().subscribe(() => this.main());
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
                text: 'Add links selected to Jdownloader',
                data: 'doJdownloaderFlush'
            },
            {
                text: 'Exit'
            }
        ]).subscribe((choice: string[]) => {
            if (choice.length && choice[0]) {
                this[choice[0]]().subscribe(
                    () => {
                    },
                    (err) => console.error(err), () => this.main());
            } else {
                console.log('Bye !');
                process.exit(0);
            }
        }, error => {
            console.error(error);
        });
    }

    private doSearch(query: string = null, host: string = null): Observable<Link[]> {
        // TODO : all sites
        let start: Observable<string> = this.ask('What would you to search ?');
        if (query) {
            start = of(query);
        }
        return start.pipe(
            switchMap(query => {
                this.spinner.start('Searching in ' + this.sites[0].baseUrl);
                return this.sites[0].search(query);
            }),
            switchMap((result: Page[]) => {
                this.spinner.succeed();
                return this.menu('Which one to choose ?', result.map(r => {
                    return {
                        data: r.url,
                        text: r.toString()
                    };
                }));
            }),
            switchMap((page: string[]) => {
                this.spinner.start('Loading details');
                return this.sites[0].getDetails(page[0]);
            }),
            switchMap((result: Page) => {
                this.spinner.succeed((result.relatedPage.length + 1) + ' versions found (all host) !');
                return this.selectPageVersionAndLinks(result, host);
            })
        );
    }

    private doJdownloaderFlush(): Observable<Link[]> {
        this.spinner = ora('Adding links to Jdownloader');
        return Observable.create(observer => {
            this.spinner.start();
            observer.next();
            observer.complete();
        }).pipe(
            switchMap(() => this.jd.flushQueue()),
            tap(res => {
                this.spinner.succeed('Result: ' + res);
            })
        );
    }


    private doRecents(): Observable<Link[]> {
        // TODO : all sites
        this.spinner.start('Searching in ' + this.sites[0].baseUrl);
        return this.sites[0].getRecents().pipe(
            switchMap((result: RssItem[]) => {
                this.spinner.succeed();
                return this.menu('Which one to choose', result.map(r => {
                    return {
                        data: r.link,
                        text: r.toString()
                    };
                }));
            }),
            switchMap((page: string[]) => {
                this.spinner.start('Loading details');
                return this.sites[0].getDetails(page[0]);
            }),
            switchMap((result: Page) => {
                this.spinner.succeed((result.relatedPage.length + 1) + ' versions found !');
                return this.selectPageVersionAndLinks(result);
            })
        );
    }

    private selectPageVersionAndLinks(page: Page, host: string = null): Observable<Link[]> {
        let start: Observable<Page> = this.menu('Which version do you want ?', [
                {
                    text: page.title + (page.language ? ' ' + page.language : '') + (page.quality ? ' ' + page.quality : ''),
                    data: page
                }
            ].concat(page.relatedPage.map(r => {
                return {
                    text: r.toString(),
                    data: r as Page
                };
            })).sort((a, b) => a.text < b.text ? -1 : 1)
        ).pipe(map(result => result[0]));
        if (page.relatedPage.length === 0) {
            start = of(page);
        }
        return start.pipe(
            switchMap((r: Page) => {
                let links = of(r.fileLinks);
                if (r !== page) {
                    this.spinner.start('Loading links');
                    links = this.sites[0].getDetails(r.url).pipe(map((p: Page) => p.fileLinks));
                }
                return links.pipe(tap((linksPossible) => this.spinner.succeed(linksPossible.length + ' links found !')));
            }),
            switchMap((links: Link[]) => {
                return this.selectLinksToSave(links, host);
            })
        );
    }

    private selectLinksToSave(links: Link[], hostUser: string = null): Observable<Link[]> {
        const hosts: string[] = [];
        links.forEach(link => {
            if (hosts.indexOf(link.host) === -1) {
                hosts.push(link.host);
            }
        });

        let start = this.menu('Which host would you like ?', hosts.map(h => {
            return {
                text: h,
                data: h
            };
        }), true);

        if (hostUser !== null) {
            start = of([hostUser]);
        } else if (hosts.length === 1) {
            start = of(hosts);
        }

        return start.pipe(
            switchMap((hostsSelected: string[]) => {
                const linksByHost = links.filter(l => hostsSelected.indexOf(l.host) !== -1);
                console.log(linksByHost.length + ' lins found for ' + hostsSelected.join(', ') + ' !');
                return this.menu('Save links ?', linksByHost.map(l => {
                        return {
                            data: l,
                            text: l.toString()
                        };
                    }).sort((a, b) => a.text < b.text ? -1 : 1), true
                ).pipe(
                    map((linksToAdd: Link[]) => {
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
                observer.error(err);
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
                observer.error(err);
                observer.complete();
            });
        });
    }
}

interface MenuInterface {
    text: string;
    data?: any;
}
