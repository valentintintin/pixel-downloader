import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';

// ne fonctionne plus
export class ZoneAnnuaire extends Site {

    constructor() {
        super('https://www.zone-annuaire.com/', 'index.php', [
            [
                'do',
                'search'
            ],
            [
                'subaction',
                'search'
            ],
            [
                'q',
                'query'
            ]
        ], 'q');
    }

    getDetails(url: string): Observable<Page> {
        return this.runRequest(url).pipe(
            map(($: CheerioStatic) => {
                const pageEl = $('.corps .smallsep').next();
                const pageImg = $('.fr-fic.fr-dib');
                const pageImg2 = $('.corps center img:first-child');
                const pageDetail = new Page(
                    pageEl.text() + ' ' + pageEl.next().text(),
                    url,
                    this,
                    !pageImg.length ? !pageImg2.length ? null : pageImg2.attr('src') : pageImg.attr('src')
                );

                $('.otherversions a').each((index, element) => {
                    pageDetail.relatedPage.push(new Page(
                        this.findText(element),
                        element.attribs.href,
                        this)
                    );
                });

                pageDetail.fileLinks = [];
                let lastHost = null;
                $('.postinfo a').each((index, element) => {
                    if (element.parent.prev.firstChild !== null) {
                        lastHost = element.parent.prev.firstChild.firstChild.data;
                    }
                    pageDetail.fileLinks.push(new Link(element.firstChild.data, this.getLinkWithBaseIfNeeded(element.attribs.href), lastHost));
                });
                $('.postinfo form').each((index, element) => {
                    if (element.parent.prev.firstChild !== null) {
                        lastHost = element.parent.prev.firstChild.firstChild.data;
                    }
                    pageDetail.fileLinks.push(new Link('', pageDetail.url, lastHost));
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
                $('.cover_global').each((index, element) => {
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
