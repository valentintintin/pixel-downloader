import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';

export class AnnuaireTelechargement extends Site {

    constructor() {
        super('https://www.annuaire-telechargement.cc', 'index.php', [
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
                const pageEl = $('.corps .smallsep').next();
                const pageImg = $('.fr-fic.fr-dib');
                const pageDetail = new Page(pageEl.text() + ' ' + pageEl.next().text(), url, this, null, pageImg.attr('src'));

                $('.otherversions a').each((index, element) => {
                    pageDetail.relatedPage.push(new Page(this.findText(element), this.baseUrl + element.attribs.href, this));
                });

                pageDetail.fileLinks = [];
                let lastHost = null;
                $('.postinfo a').each((index, element) => {
                    if (element.parent.prev.firstChild !== null) {
                        lastHost = element.parent.prev.firstChild.firstChild.data;
                    }
                    pageDetail.fileLinks.push(new Link(element.firstChild.data, element.attribs.href, lastHost));
                });
                return pageDetail;
            })
        );
    }

    getRecents(): Observable<Page[]> {
        return this.runRss(this.baseUrl + '/rss.xml').pipe(
            map(items => items.map(i => new Page(i.title, i.link, this)))
        );
    }

    // TODO : next page ?
    search(query: string): Observable<Page[]> {
        return this.runRequest(this.getSearchUrl(query)).pipe(
            map(($: CheerioStatic) => {
                const pages: Page[] = [];
                $('.cover_infos_title').each((index, element) => {
                    pages.push(new Page(this.findText(element), element.children[1].attribs.href, this));
                });
                return pages;
            })
        );
    }

}
