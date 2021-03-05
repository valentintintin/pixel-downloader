import { Site } from './site';
import { combineLatest, Observable, of } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';
import TagElement = cheerio.TagElement;
import Selector = cheerio.Selector;

export class AnnuaireTelechargement extends Site {

    constructor() {
        super('https://www.annuaire-telechargement.ninja/', 'index.php', [
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
                const pageImg = $('.affichefiche');
                const pageDetail = new Page(
                    $('.hr-divider-heading').text(),
                    url,
                    this,
                    pageImg.length ? pageImg.attr('src') : null
                );

                $('.liste_saisons a').each((index, element: TagElement) => {
                    pageDetail.relatedPage.push(new Page(
                        this.findText(element),
                        element.attribs.href,
                        this)
                    );
                });

                pageDetail.fileLinks = [];
                $('a.list-group-item').each((index, element: TagElement) => {
                    const pageEl = $(element).children('span');
                    const title = pageEl.children('b').text();
                    if (!title.includes('LIEN PREMIUM')) {
                        pageDetail.fileLinks.push(new Link(title, this.getLinkWithBaseIfNeeded(element.attribs.href), pageEl.children('.providers').attr('title')));
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
                $('.row .statcards a').each((index, element: TagElement) => {
                    const pageEl = $(element);
                    const pageImg = $('.affiche', element);
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
