import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';
import RssToJson = require('rss-to-json');

export class ExtremeDownload extends Site {

    constructor() {
        super('https://www1.extreme-download.me', 'home.html', [
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
                const pageEl = $('#dle-content .blockbox')[0];
                const pageDetail = new Page(this.findText(pageEl.children[1]), url, this);

                const versionsEls = $('.widget a.btn-other');
                for (let i = 0; i < versionsEls.length; i++) {
                    const versionEl = versionsEls[i];
                    pageDetail.relatedPage.push(new Page(this.findText(versionEl), this.baseUrl + versionEl.attribs.href, this));
                }

                pageDetail.fileLinks = [];
                const links = $('.blockcontent div a');
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    if ((
                            !link.attribs.href.includes('shop') &&
                            !link.attribs.href.includes('prezup') &&
                            link.parent.name === 'div'
                        ) &&
                        (!link.attribs.title || !link.attribs.title.includes('Regarder'))) {
                        let title: string = this.findText(link);
                        let host: string = null;
                        let hostSplited: string[] = title.split(' ');
                        if (hostSplited.length <= 1) {
                            hostSplited = this.findText(link.parent).split(' ');
                        }
                        if (hostSplited.length > 1) {
                            title = hostSplited[hostSplited.length - 1].trim();
                            host = hostSplited[0].trim();
                        }
                        pageDetail.fileLinks.push(new Link(title, link.attribs.href, host));
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
                    observer.next(res.items.map(i => new Page(i.title, this.baseUrl + i.link, this)));
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
                const resultsEls = $('#dle-content a.thumbnails');
                for (let i = 0; i < resultsEls.length; i++) {
                    const page = resultsEls[i];
                    pages.push(new Page(this.findText(page), this.baseUrl + page.attribs.href, this));
                }
                return pages;
            })
        );
    }

}