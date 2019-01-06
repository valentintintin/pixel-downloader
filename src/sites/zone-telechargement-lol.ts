import { Site } from './site';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageDetailInterface } from '../interfaces/page-detail-interface';
import { PageVersionInterface } from '../interfaces/page-version-interface';
import { LinkInterface } from '../interfaces/link-interface';
import * as RssToJson from 'rss-to-json';
import { RssItemInterface } from '../interfaces/rss-item-interface';

export class ZoneTelechargementLol extends Site {
    
    constructor() {
        super('https://www.zone-telechargement2.lol', 'index.php', [
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
    
    search(query: string): Observable<LinkInterface[]> {
        return this.runRequest(this.getSearchUrl(query)).pipe(
            map(($: CheerioStatic) => {
                const links: LinkInterface[] = [];
                const resultsEls = $('.mov > a:first-child');
                // resultsEls = resultsEls.filter(i => resultsEls[i].tagName === 'a' && resultsEls[i].attribs !== null && resultsEls[i].attribs.href !== null);
                for (let i = 0; i < resultsEls.length; i++) {
                    const page = resultsEls[i];
                    links.push({
                        title: page.attribs.title,
                        url: page.attribs.href
                    });
                }
                return links;
            })
        );
    }
    
    getDetails(url: string): Observable<PageDetailInterface> {
        return this.runRequest(url).pipe(
            map(($: CheerioStatic) => {
                const pageEl = $('h2')[0];
                const pageElInfo = pageEl.nextSibling.children;
                const pageDetail: PageDetailInterface = {
                    title: pageEl.children[1].firstChild.data, // + (pageElInfo. > 2 ? ' ' + pageElInfo[2].data.trim() : ''),
                    url: url + '',
                    quality: pageElInfo ? pageElInfo[0].data.split('|')[0].replace('Qualité', '').trim() + '' : '',
                    language: pageElInfo ? pageElInfo[0].data.split('|')[1].trim() + '' : '',
                    relatedPage: []
                };
                
                const versionsEls = $('.otherversions a');
                for (let i = 0; i < versionsEls.length; i++) {
                    const versionEl = versionsEls[i];
                    const version: PageVersionInterface = {
                        url: versionEl.attribs.href,
                        title: '',
                        quality: '',
                        language: ''
                    };
                    const versionInfosEls = versionEl.firstChild.children;
                    version.title = this.findText(versionInfosEls[0]);
                    version.quality = this.findText(versionInfosEls[1]);
                    version.language = this.findText(versionInfosEls[2]);
                    if (!version.quality) {
                        version.language = '';
                        version.quality = this.findText(versionInfosEls[2]);
                    }
                    pageDetail.relatedPage.push(version);
                }
                
                pageDetail.fileLinks = [];
                const pages = $('.mov > a:first-child');
                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    pageDetail.fileLinks.push({
                        title: page.attribs.title,
                        url: page.attribs.href
                    });
                }
                return pageDetail;
            })
        );
    }
    
    public getRecents(): Observable<RssItemInterface[]> {
        return Observable.create((observer) => {
            RssToJson.load(this.baseUrl + 'rss.xml', (err, res) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(res.items);
                }
                observer.complete();
            });
        });
    }
}
