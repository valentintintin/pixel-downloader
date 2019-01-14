import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';
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
        return this.runRequest(url).pipe(
            map(($: CheerioStatic) => {
                const pageEl = $('.corps h1')[0];
                const pageElInfo = $('.corps h2')[0];
                const pageDetail = new Page(pageEl.firstChild.data + ' ' + this.findText(pageElInfo.firstChild), url, this);

                const versionsEls = $('.otherversions a');
                for (let i = 0; i < versionsEls.length; i++) {
                    const versionEl = versionsEls[i];
                    pageDetail.relatedPage.push(new Page(this.findText(versionEl), versionEl.attribs.href, this));
                }

                pageDetail.fileLinks = [];
                const links = $('.ilinx_global a');
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    const linkInfo = link.parent.prev.prev;
                    if (!link.attribs.href.includes('javascript')) {
                        pageDetail.fileLinks.push(new Link(link.firstChild.data, link.attribs.href, this.findText(linkInfo)));
                    }
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
                    observer.next(res.items.map(i => new Page(i.title, i.link, this)));
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
                    pages.push(new Page(page.firstChild.data + ' ' + this.findText(page.children[1]), page.attribs.href, this));
                }
                return pages;
            })
        );
    }

}