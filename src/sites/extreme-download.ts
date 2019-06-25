import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';

export class ExtremeDownload extends Site {

    constructor() {
        super('https://www3.extreme-download.co', 'home.html', [
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
                const pageEl = $('#news-title');
                const pageImg = $('.image-block img');
                const pageDetail = new Page(
                    pageEl.text(),
                    url,
                    this,
                    !pageImg.length ? null : pageImg.attr('src')
                );

                $('.widget a.btn-other').each((index, element) => {
                    pageDetail.relatedPage.push(new Page(
                        this.findText(element),
                        element.attribs.href,
                        this
                    ));
                });

                pageDetail.fileLinks = [];
                $('.blockcontent div a').each((index, element) => {
                    if ((
                            !element.attribs.href.includes('shop') &&
                            !element.attribs.href.includes('prezup') &&
                            element.parent.name === 'div'
                        ) &&
                        (!element.attribs.title || !element.attribs.title.includes('Regarder'))) {
                        let title: string = this.findText(element);
                        let host: string = null;
                        let hostSplited: string[] = title.split(' ');
                        if (hostSplited.length <= 1) {
                            hostSplited = this.findText(element.parent).split(' ');
                        }
                        if (hostSplited.length > 1) {
                            title = hostSplited.slice(1).join().trim();
                            host = hostSplited[0].trim();
                        }
                        pageDetail.fileLinks.push(new Link(title, this.getLinkWithBaseIfNeeded(element.attribs.href), host));
                    }
                });
                return pageDetail;
            })
        );
    }

    getRecents(): Observable<Page[]> {
        return this.runRss('rss.xml').pipe(
            map(items => items.map(i => new Page(i.title, i.link, this)))
        );
    }

    search(query: string): Observable<Page[]> {
        return this.runRequest(this.getSearchUrl(query)).pipe(
            map(($: CheerioStatic) => {
                const pages: Page[] = [];
                $('#dle-content a.thumbnails').each((index, element) => {
                    const pageImg = $('img', element);
                    pages.push(new Page(
                        this.findText(element),
                        element.attribs.href,
                        this,
                        !pageImg.length ? null : pageImg.attr('src')
                    ));
                });
                return pages;
            })
        );
    }
}
