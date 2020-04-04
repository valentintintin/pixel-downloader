import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { map } from 'rxjs/operators';
import { Link } from '../models/link';

export class ExtremeDownload extends Site {

    constructor() {
        super('https://www3.extremedownload.ninja/', 'home.html', [
            [
                'do',
                'search'
            ],
            [
                'subaction',
                'search'
            ],
            [
                'story',
                'query'
            ],
        ], 'story');
    }

    getDetails(url: string): Observable<Page> {
        return this.runRequest(url).pipe(
            map(($: CheerioStatic) => {
                const pageEl = $('#news-title');
                const pageImg = $('.blockcontent img');
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
                $('.blockcontent a').each((index, element) => {
                    if (
                        element.attribs.href &&
                        (
                            !element.attribs.href.includes('javascript') &&
                            !element.attribs.href.includes('shop') &&
                            !element.attribs.href.includes('prezup') &&
                            !element.attribs.href.includes('register') &&
                            ['div', 'strong', 'p'].includes(element.parent.name)
                        ) &&
                        (!element.attribs.title || !element.attribs.title.includes('Regarder')) &&
                        element.attribs.target
                    ) {
                        let title: string = this.findText(element.parent);
                        let host: string = null;
                        let hostSplited: string[] = title.split(' ');
                        if (hostSplited.length >= 1) {
                            title = hostSplited.pop().trim();
                            host = hostSplited.join(' ').replace('-', '').trim();
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
