import { Site } from './site';
import { Observable } from 'rxjs';
import { RssItem } from '../models/rss-item';
import { Page } from '../models/page';
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
        return undefined;
    }

    getRecents(): Observable<RssItem[]> {
        return Observable.create((observer) => {
            RssToJson.load(this.baseUrl + 'rss.xml', (err, res) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(res.items.map(i => new RssItem(i.title, i.link, i.description, new Date(i.created))));
                }
                observer.complete();
            });
        });
    }

    search(query: string): Observable<Page[]> {
        return undefined;
    }

}