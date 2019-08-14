import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';

export class MegaTelechargement extends Site {

    constructor() {
        super('https://www.mega-telechargements.com', 'index.php', [
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
                '0'
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
                const pageEl = $('.corps h1');
                const pageElInfo = $('.corps h2');
                const pageImg = $('.corps center img').first();
                const pageDetail = new Page(
                    pageEl.text().trim() + ' ' + pageElInfo.text().trim(),
                    url, this,
                    pageImg.attr('src')
                );

                $('.otherversions a').each((index, element) => {
                    pageDetail.relatedPage.push(new Page(
                        this.findText(element),
                        element.attribs.href,
                        this
                    ));
                });

                pageDetail.fileLinks = [];
                $('.ilinx_global a').each((index, element) => {
                    const linkInfo = element.parent.prev.prev;
                    if (!element.attribs.href.includes('javascript')) {
                        pageDetail.fileLinks.push(new Link(element.firstChild.data, element.attribs.href, this.findText(linkInfo)));
                    }
                });
                $('.corps center:last-of-type b:nth-child(odd)').each((index, element) => {
                    const host = this.findText(element.children);
                    const link = $('a', element.next.next);
                    pageDetail.fileLinks.push(new Link('Premium', link.first().attr('href'), host));
                });
                return pageDetail;
            })
        );
    }

    getRecents(): Observable<Page[]> {
        const a = this.host;
        return this.runRss('rss.xml').pipe(
            map(items => items.map(i => new Page(i.title, i.link, this)))
        );
    }

    search(query: string): Observable<Page[]> {
        return this.runRequest(this.getSearchUrl(query)).pipe(
            map(($: CheerioStatic) => {
                const pages: Page[] = [];
                $('.cover_global').each((index, element) => {
                    const pageEl = $('a:last-child', element);
                    const pageImg = $('img', element);
                    pages.push(new Page(
                        pageEl.text(),
                        pageEl.attr('href'),
                        this,
                        !pageImg.length ? null : pageImg.attr('src')
                    ));
                });
                return pages;
            })
        );
    }
}
