import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import RssToJson = require('rss-to-json');

export class ZoneTelechargementWorld extends Site {

    constructor() {
        super('https://www.zone-telechargement.world', 'index.php', [
            [
                'do',
                'search'
            ],
            [
                'subaction',
                'search'
            ],
            [
                'search_start',
                '1'
            ],
            [
                'full_search',
                '1'
            ],
            [
                'result_from',
                '1'
            ],
            [
                'story',
                'query'
            ],
            [
                'all_word_seach',
                '1'
            ],
            [
                'titleonly',
                '3'
            ],
            [
                'searchuser',
                ''
            ],
            [
                'replyless',
                '0'
            ],
            [
                'replylimit',
                '0'
            ],
            [
                'searchdate',
                '0'
            ],
            [
                'beforeafter',
                'after'
            ],
            [
                'sortby',
                'date'
            ],
            [
                'resorder',
                'desc'
            ],
            [
                'showposts',
                '0'
            ],
            [
                'catlist%5B%5D',
                '0'
            ]
        ], 'story');
    }

    getDetails(url: string): Observable<Page> {
        throw new Error('Not implemented');
    }

    getRecents(): Observable<Page[]> {
        return Observable.create((observer) => {
            RssToJson.load(this.baseUrl + 'rss.xml', (err, res) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(res.items.map(i => new Page(i.title, i.link, null, null, null, new Date(i.created), null, this)));
                }
                observer.complete();
            });
        });
    }

    // TODO : next page ?
    search(query: string): Observable<Page[]> {
        return this.runRequest(this.getSearchUrl(query)).pipe(
            map(($: CheerioStatic) => {
                const pages: Page[] = [];
                const resultsEls = $('.cover_infos_title a:nth-child(2)');
                for (let i = 0; i < resultsEls.length; i++) {
                    const page = resultsEls[i];
                    pages.push(new Page(page.firstChild.data, page.attribs.href, null, page.children[1].firstChild.data, null, null, null, this));
                }
                return pages;
            })
        );
    }

}