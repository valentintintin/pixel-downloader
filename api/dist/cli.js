"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const jdownloader_1 = require("./jdownloader");
const config = require("./config");
const zone_warez_1 = require("./sites/zone-warez");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const enquirer_1 = require("enquirer");
const utils_1 = require("./utils");
const no_link_exception_1 = require("./models/no-link.exception");
const extreme_download_1 = require("./sites/extreme-download");
const zone_annuaire_1 = require("./sites/zone-annuaire");
const ora = require("ora");

class Cli {
    constructor() {
        this.jd = new jdownloader_1.Jdownloader(config.JDOWNLOADER_LOGIN, config.JDOWNLOADER_PASSWORD, config.JDOWNLOADER_DEVICE_NAME);
        this.sites = [
            new zone_warez_1.ZoneWarez(),
            new zone_annuaire_1.ZoneAnnuaire(),
            new extreme_download_1.ExtremeDownload()
        ];
        this.spinner = ora();
    }

    run(argv = []) {
        let query = null;
        let host = null;
        if (argv.length > 1) {
            query = argv[1].toLowerCase().trim();
        }
        if (argv.length > 2) {
            host = utils_1.Utils.getHostFromUrl(argv[2]);
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

    main() {
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
        ]).subscribe((choice) => {
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

    doSearch(query = null, host = null) {
        let start = this.ask('What would you to search ?');
        if (query) {
            start = rxjs_1.of(query.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
        }
        return start.pipe(operators_1.switchMap(query => {
            this.spinner.start('Searching on ' + this.sites.map(s => s.name).join(', '));
            const obsSites = [];
            this.sites.forEach(site => obsSites.push(site.search(query)));
            return rxjs_1.combineLatest(obsSites).pipe(operators_1.map(res => [].concat(...res)));
        }), operators_1.switchMap((result) => {
            this.spinner.succeed();
            return this.menu('Which one to choose ?', result.map(r => {
                return {
                    data: r,
                    text: r.toString() + ' - ' + r.site.name
                };
            }));
        }), operators_1.switchMap(result => this.selectPageVersionAndLinks(result[0], host)));
    }

    doJdownloaderFlush() {
        this.spinner = ora('Adding links to JDownloader');
        return rxjs_1.Observable.create(observer => {
            this.spinner.start();
            observer.next();
            observer.complete();
        }).pipe(operators_1.switchMap(() => this.jd.flushQueueToServer()), operators_1.tap(res => {
            this.spinner.succeed('Result: ' + res);
        }));
    }

    doJdownloaderGet() {
        this.spinner = ora('Getting links from JDownloader');
        return rxjs_1.Observable.create(observer => {
            this.spinner.start();
            observer.next();
            observer.complete();
        }).pipe(operators_1.switchMap(() => this.jd.getLinksFromServer()), operators_1.tap((res) => {
            this.spinner.succeed(res.length + ' links found !');
            console.log(res.map(l => l.toString() + ' - ' + l.url).join('\n'));
        }));
    }

    doRecents(query = null, host = null) {
        this.spinner.start('Getting recents in ' + this.sites.map(s => s.name).join(', '));
        const obsSites = [];
        this.sites.forEach(site => obsSites.push(site.getRecents()));
        return rxjs_1.combineLatest(obsSites).pipe(operators_1.map(res => [].concat(...res).filter((r) => !query || r.title.toLowerCase().includes(query))), operators_1.switchMap((result) => {
            this.spinner.succeed(result.length + ' pages found !');
            return this.menu('Which one to choose', result.map(r => {
                return {
                    data: r,
                    text: r.toString() + ' - ' + r.site.name
                };
            }).sort((a, b) => a.text < b.text ? -1 : 1));
        }), operators_1.switchMap(result => this.selectPageVersionAndLinks(result[0], host)));
    }

    selectPageVersionAndLinks(page, host = null) {
        if (!page) {
            throw new no_link_exception_1.NoLinkException('No link found :(');
        }
        console.log('Selected : ' + page.url);
        this.spinner.start('Loading details');
        return page.site.getDetails(page.url).pipe(operators_1.switchMap((result) => {
            this.spinner.succeed((result.relatedPage.length + 1) + ' versions found !');
            if (result.relatedPage.length === 0) {
                return rxjs_1.of(result);
            }
            return this.menu('Which version do you want ?', [
                {
                    text: result.toString(),
                    data: result
                }
            ].concat(result.relatedPage.map(r => {
                return {
                    text: r.toString(),
                    data: r
                };
            }).sort((a, b) => a.text < b.text ? -1 : 1))).pipe(operators_1.map(result => result[0]));
        }), operators_1.switchMap((r) => {
            let links = rxjs_1.of(r.fileLinks);
            if (r.url !== page.url) {
                this.spinner.start('Loading links ' + page.url);
                links = r.site.getDetails(r.url).pipe(operators_1.map((p) => {
                    this.spinner.succeed();
                    return p.fileLinks;
                }));
            }
            return links.pipe(operators_1.tap((linksPossible) => this.spinner.succeed(linksPossible.length + ' links found !')));
        }), operators_1.switchMap((links) => {
            return this.selectLinksToSave(links, host);
        }));
    }

    selectLinksToSave(links, hostUser = null) {
        const hosts = [];
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
            start = rxjs_1.of([hostUser]);
        } else if (hosts.length === 1) {
            start = rxjs_1.of(hosts);
        }
        return start.pipe(operators_1.switchMap((hostsSelected) => {
            const linksByHost = links.filter(l => hostsSelected.find(h => l.host.includes(h)));
            console.log(linksByHost.length + ' links found for ' + hostsSelected.join(', ') + ' !');
            return this.menu('Save links ?', linksByHost.map(l => {
                return {
                    data: l,
                    text: l.toString()
                };
            }).sort((a, b) => a.text < b.text ? -1 : 1), true).pipe(operators_1.map((linksToAdd) => {
                if (!linksToAdd.length) {
                    throw new no_link_exception_1.NoLinkException('No link found :(');
                }
                console.log('Links selected : ' + linksToAdd.map(l => l.toString() + ' : ' + l.url).join('\n'));
                const linksAdded = this.jd.addLinksToQueue(linksToAdd);
                console.log(linksAdded.length + ' links added to queue');
                return linksAdded;
            }));
        }));
    }

    menu(text, items, multiple = false) {
        if (items.length === 0) {
            return rxjs_1.of([]);
        }
        return new rxjs_1.Observable(observer => {
            enquirer_1.prompt({
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
                    let names;
                    if (!Array.isArray(value)) {
                        names = [value];
                    } else {
                        names = value;
                    }
                    return names.map(name => this.choices.find(choice => choice.name === name).value);
                }
            }).then((choosen) => {
                const items = choosen.choice;
                observer.next(items.map(c => c.data));
                observer.complete();
            }).catch(err => {
                observer.error(new Error('Back to menu'));
                observer.complete();
            });
        });
    }

    ask(text) {
        return rxjs_1.Observable.create(observer => {
            enquirer_1.prompt({
                type: 'input',
                name: 'typed',
                message: text
            }).then((answer) => {
                observer.next(answer.typed);
                observer.complete();
            }).catch(err => {
                observer.error(new Error('Back to menu'));
                observer.complete();
            });
        });
    }
}

exports.Cli = Cli;
//# sourceMappingURL=cli.js.map
