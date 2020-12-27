import { Site } from './site';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page } from '../models/page';
import { Link } from '../models/link';
import Selector = cheerio.Selector;
import TagElement = cheerio.TagElement;

// cloudflare ne fonctionne plus
export class ZoneWarez extends Site {

    constructor() {
        super('https://www.tirexo.pro/', 'index.php', [
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
                '0'
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
        ], 'story');
    }

    search(query: string): Observable<Page[]> {
        return this.runRequest(this.getSearchUrl(query)).pipe(
            map(($: Selector) => {
                const pages: Page[] = [];
                $('.mov > a:first-child').each((index, element: TagElement) => {
                    const pageImg = $('img', element);
                    pages.push(new Page(
                        element.attribs.title,
                        element.attribs.href,
                        this,
                        !pageImg.length ? null : pageImg.attr('src')
                    ));
                });
                return pages;
            })
        );
    }

    getDetails(url: string): Observable<Page> {
        return this.runRequest(url).pipe(
            map(($: Selector) => {
                const pageEl = $('h2').find('b');
                const pageElInfo = pageEl.parent().next();
                let pageImg = $('.jaquette');
                if (pageImg.length === 0) {
                    pageImg = $('center > img:first-child');
                }
                const pageDetail = new Page(
                    pageEl.text().trim() + ' ' + pageElInfo.text().trim(),
                    url,
                    this,
                    !pageImg.length ? null : (pageImg.attr('src') ? pageImg.attr('src') : pageImg.data('cfsrc'))
                );

                $('.otherversions a').each((index, element: TagElement) => {
                    pageDetail.relatedPage.push(new Page(
                        this.findText(element),
                        element.attribs.href,
                        this
                    ));
                });

                const hosts = $('table.downloadsortsonlink');
                hosts.find('thead th:first-child').each((index, element: TagElement) => {
                    $('.download', hosts.get(index)).each((index1, linkElement) => pageDetail.fileLinks.push(new Link(
                        this.findText(linkElement),
                        this.getLinkWithBaseIfNeeded((linkElement as TagElement).attribs.href),
                        this.findText(element)
                    )));
                });
                return pageDetail;
            })
        );
    }

    public getRecents(): Observable<Page[]> {
        return of([]);
        // return this.runRss('rss.xml').pipe(
        //     map(items => items.map(i => new Page(i.title, i.link, this)))
        // );
    }
}
