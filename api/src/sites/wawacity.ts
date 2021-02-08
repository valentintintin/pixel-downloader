import { Site } from './site';
import { combineLatest, Observable, of } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';
import TagElement = cheerio.TagElement;
import Selector = cheerio.Selector;

export class Wawacity extends Site {

    constructor() {
        super('https://www.wawacity.video/', 'index.php', [
            [
                'p',
                'type'
            ],
            [
                'search',
                'query'
            ],
        ], 'search', 'p');
    }

    getDetails(url: string): Observable<Page> {
        return this.runRequest(url).pipe(
            map(($: Selector) => {
                const pageImg = $('.wa-block-body.detail.row img.img-responsive');
                const pageDetail = new Page(
                    pageImg.attr('alt'),
                    url,
                    this,
                    pageImg.length ? pageImg.attr('src') : null
                );

                $('.wa-post-list-ofLinks a').each((index, element: TagElement) => {
                    pageDetail.relatedPage.push(new Page(
                        this.findText(element),
                        element.attribs.href,
                        this)
                    );
                });

                pageDetail.fileLinks = [];
                $('#DDLLinks .link-row').each((index, element: TagElement) => {
                    const pageEl = $('a', element);
                    const title = pageEl.text();
                    if (!title.includes('Lien Premium')) {
                        pageDetail.fileLinks.push(new Link(title, this.getLinkWithBaseIfNeeded(pageEl.attr('href')), this.findText($('td', element).get(1))));
                    }
                });
                return pageDetail;
            })
        );
    }

    getRecents(): Observable<Page[]> {
        return of([]);
        // return this.runRss('rss.xml').pipe(
        //     map(items => items.map(i => new Page(i.title, i.link, this)))
        // );
    }

    search(query: string): Observable<Page[]> {
        return combineLatest(['films', 'series', 'mangas'].map(type => this.searchPageProcess(query, type))).pipe(
            map(results => [].concat.apply([], results).sort((a, b) => a.title < b.title ? -1 : 1)),
        );
    }

    private searchPageProcess(query: string, type: string): Observable<Page[]> {
        return this.runRequest(this.getSearchUrl(query, type)).pipe(
            map(($: Selector) => {
                const pages: Page[] = [];
                $('.wa-post-detail-item .content .cover a').each((index, element: TagElement) => {
                    const pageEl = $(element);
                    const pageImg = $('img', element);
                    pages.push(new Page(
                        pageImg.attr('alt'),
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
