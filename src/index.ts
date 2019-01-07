import { ZoneTelechargementLol } from './sites/zone-telechargement-lol';
import { JDownloader } from './JDownloader';
import { prompt } from 'enquirer';

import * as config from './config';
import { Site } from './sites/site';
import ora = require('ora');

// const pkg = require('../package.json');

// const conf = new Configstore(pkg.name);

const jd = new JDownloader(config.JDOWNLOADER_LOGIN, config.JDOWNLOADER_PASSWORD, config.JDOWNLOADER_DEVICE_NAME);

const sites: Site[] = [
    new ZoneTelechargementLol()
];

main();

function doJdownloaderFlush() {
    const spinner = ora('Adding links to JDownloader').start();
    jd.flushQueue().subscribe((res) => {
        spinner.succeed('Result: ' + res);
        main();
    });
}

function doRecents() {
    sites[0].getRecents().subscribe(items => console.log(items));
    main();
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
                    spinner.succeed(result.fileLinks.length + ' links found !');
                    prompt({
                        type: 'select',
                        name: 'choice',
                        message: 'Save links ?',
                        muliple: true,
                        initial: 0,
                        choices: result.fileLinks.map(l => {
                            return {
                                name: l.url,
                                message: l.title + (l.language ? ' ' + l.language : '') + (l.quality ? ' ' + l.quality : '')
                            };
                        })
                    }).then((linksToAdd: any) => {
                        console.log(linksToAdd);
                        linksToAdd.choices.forEach(link => jd.addLinkToQueue(link));
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
