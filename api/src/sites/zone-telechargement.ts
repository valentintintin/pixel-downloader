import { Site } from './site';
import { combineLatest, Observable, of } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';
import Selector = cheerio.Selector;
import TagElement = cheerio.TagElement;

export class ZoneTelechargement extends Site {

    constructor() {
        super('https://www.zone-telechargement.cloud/', 'index.php', [
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
                let pageEl = $('.corps .smallsep').next();

                let title = pageEl.text() + ' ' + pageEl.next().text();
                if (title.trim().length === 0) {
                    pageEl = $('.corps').children();
                    if (pageEl.length > 0) {
                        pageEl = pageEl.first().children();
                        if (pageEl.length > 0) {
                            title = pageEl.first().text();
                            if (pageEl.first().next()) {
                                title += ' ' + pageEl.first().next().text();
                            }
                        }
                    }
                }

                const pageImg = $('.fr-fic.fr-dib');
                const pageImg2 = $('.corps center img:first-child');
                const pageDetail = new Page(
                    title,
                    url,
                    this,
                    !pageImg.length ? !pageImg2.length ? null : pageImg2.attr('src') : pageImg.attr('src')
                );

                $('.otherversions a').each((index, element: TagElement) => {
                    pageDetail.relatedPage.push(new Page(
                        this.findText(element),
                        element.attribs.href,
                        this)
                    );
                });

                pageDetail.fileLinks = [];
                let lastHost = null;
                $('.postinfo a').each((index, element: TagElement) => {
                    const prev = element.parent.prev as TagElement;
                    if (prev.firstChild !== null) {
                        lastHost = (prev.firstChild as TagElement).firstChild.data;
                    }
                    pageDetail.fileLinks.push(new Link(element.firstChild.data, this.getLinkWithBaseIfNeeded(element.attribs.href), lastHost));
                });
                $('.postinfo form').each((index, element: TagElement) => {
                    const prev = element.parent.prev as TagElement;
                    if (prev.firstChild !== null) {
                        lastHost = (prev.firstChild as TagElement).firstChild.data;
                    }
                    pageDetail.fileLinks.push(new Link('', pageDetail.url, lastHost));
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
                $('.cover_global').each((index, element: TagElement) => {
                    const pageEl = $('.cover_infos_title a', element);
                    const pageElInfo = $('.cover_infos_title .detail_release', element);
                    const pageImg = $('.mainimg', element);
                    pages.push(new Page(
                        pageEl.text() + ' ' + pageElInfo.text(),
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
