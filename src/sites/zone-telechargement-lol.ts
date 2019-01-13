import { Site } from './site';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page } from '../models/page';
import { Link } from '../models/link';
import RssToJson = require('rss-to-json');

export class ZoneTelechargementLol extends Site {
    
    constructor() {
        super('https://www.zone-telechargement2.lol', 'index.php', [
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

    // TODO : next page ?
    search(query: string): Observable<Page[]> {
        return this.runRequest(this.getSearchUrl(query)).pipe(
            map(($: CheerioStatic) => {
                const pages: Page[] = [];
                const resultsEls = $('.mov > a:first-child');
                for (let i = 0; i < resultsEls.length; i++) {
                    const page = resultsEls[i];
                    pages.push(new Page(page.attribs.title, page.attribs.href, this));
                }
                return pages;
            })
        );
    }

    getDetails(url: string): Observable<Page> {
        return this.runRequest(url).pipe(
            map(($: CheerioStatic) => {
                const pageEl = $('h2')[0];
                const pageElInfo = pageEl.next.next.children;
                const pageDetail = new Page(this.findText(pageEl) + ' ' + this.findText(pageElInfo), url, this);

                const versionsEls = $('.otherversions a');
                for (let i = 0; i < versionsEls.length; i++) {
                    const versionEl = versionsEls[i];
                    pageDetail.relatedPage.push(new Page(this.findText(versionEl), versionEl.attribs.href, this));
                }
                
                pageDetail.fileLinks = [];
                const links = $('.download');
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    const linkInfo = link.parent.parent;
                    pageDetail.fileLinks.push(new Link(
                        link.firstChild.data,
                        this.baseUrl + link.attribs.href,
                        linkInfo.parent.parent.children[1].children[1].children[1].children[1].data,
                        linkInfo.children[7].firstChild.data,
                        linkInfo.children[5].firstChild.data,
                    ));
                }
                return pageDetail;
            })
        );
    }

    public getRecents(): Observable<Page[]> {
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
}
