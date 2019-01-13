import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';
import RssToJson = require('rss-to-json');

export class AnnuaireTelechargement extends Site {

    constructor() {
        super('https://www.annuaire-telechargement.com', 'index.php', [
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
        return this.runRequest(url).pipe(
            map(($: CheerioStatic) => {
                const pageEl = $('.corps .smallsep')[0].next;
                const pageDetail = new Page(pageEl.firstChild.data + ' ' + this.findText(pageEl.next.firstChild), url, this);

                const versionsEls = $('.otherversions a');
                for (let i = 0; i < versionsEls.length; i++) {
                    const versionEl = versionsEls[i];
                    pageDetail.relatedPage.push(new Page(this.findText(versionEl), this.baseUrl + versionEl.attribs.href, this));
                }

                pageDetail.fileLinks = [];
                const links = $('.postinfo a');
                let lastHost = null;
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    if (link.parent.prev.firstChild !== null) {
                        lastHost = link.parent.prev.firstChild.firstChild.data;
                    }
                    pageDetail.fileLinks.push(new Link(link.firstChild.data, link.attribs.href, lastHost));
                }
                return pageDetail;
            })
        );
    }

    getRecents(): Observable<Page[]> {
        return Observable.create((observer) => {
            RssToJson.load(this.baseUrl + 'rss.xml', (err, res) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(res.items.map(i => new Page(i.title, i.link, this, null, new Date(i.created))));
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
                const resultsEls = $('.cover_global');
                for (let i = 0; i < resultsEls.length; i++) {
                    const page = resultsEls[i].children[7].firstChild.children[1];
                    pages.push(new Page(this.findText(page), page.children[1].attribs.href, this));
                }
                return pages;
            })
        );
    }

}