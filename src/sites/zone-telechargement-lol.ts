import { Site } from './site';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page } from '../models/page';
import { Link } from '../models/link';

export class ZoneTelechargementLol extends Site {

    constructor() {
        super('https://ww11.zone-telechargement.lol', 'index.php', [
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
                $('.mov > a:first-child').each((index, element) => {
                    pages.push(new Page(element.attribs.title, element.attribs.href, this));
                });
                return pages;
            })
        );
    }

    getDetails(url: string): Observable<Page> {
        return this.runRequest(url).pipe(
            map(($: CheerioStatic) => {
                const pageEl = $('h2').find('b');
                const pageElInfo = pageEl.parent().next();
                const pageImg = $('.jaquette');
                const pageDetail = new Page(pageEl.text().trim() + ' ' + pageElInfo.text().trim(), url, this, null, this.baseUrl + '/' + (pageImg.attr('src') ? pageImg.attr('src') : pageImg.data('cfsrc')));

                $('.otherversions a').each((index, element) => {
                    pageDetail.relatedPage.push(new Page(this.findText(element), element.attribs.href, this));
                });

                const hosts = $('table.downloadsortsonlink');
                hosts.find('thead th:first-child').each((index, element) => {
                    $('.download', hosts.get(index)).each((index1, element1) => pageDetail.fileLinks.push(new Link(
                        this.findText(element1),
                        this.baseUrl + element1.attribs['href'],
                        this.findText(element)
                    )));
                });
                return pageDetail;
            })
        );
    }

    public getRecents(): Observable<Page[]> {
        return this.runRss(this.baseUrl + '/rss.xml').pipe(
            map(items => items.map(i => new Page(i.title, i.link, this)))
        );
    }
}
