"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const site_1 = require("./site");
const page_1 = require("../models/page");
const operators_1 = require("rxjs/operators");
const link_1 = require("../models/link");

class ZoneAnnuaire extends site_1.Site {
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

    getDetails(url) {
        return this.runRequest(url).pipe(operators_1.map(($) => {
            const pageEl = $('.corps .smallsep').next();
            const pageImg = $('.fr-fic.fr-dib');
            const pageImg2 = $('.corps center img:first-child');
            const pageDetail = new page_1.Page(pageEl.text() + ' ' + pageEl.next().text(), url, this, !pageImg.length ? !pageImg2.length ? null : pageImg2.attr('src') : pageImg.attr('src'));
            $('.otherversions a').each((index, element) => {
                pageDetail.relatedPage.push(new page_1.Page(this.findText(element), element.attribs.href, this));
            });
            pageDetail.fileLinks = [];
            let lastHost = null;
            $('.postinfo a').each((index, element) => {
                if (element.parent.prev.firstChild !== null) {
                    lastHost = element.parent.prev.firstChild.firstChild.data;
                }
                pageDetail.fileLinks.push(new link_1.Link(element.firstChild.data, this.getLinkWithBaseIfNeeded(element.attribs.href), lastHost));
            });
            $('.postinfo form').each((index, element) => {
                if (element.parent.prev.firstChild !== null) {
                    lastHost = element.parent.prev.firstChild.firstChild.data;
                }
                pageDetail.fileLinks.push(new link_1.Link('', pageDetail.url, lastHost));
            });
            return pageDetail;
        }));
    }

    getRecents() {
        return this.runRss('rss.xml').pipe(operators_1.map(items => items.map(i => new page_1.Page(i.title, i.link, this))));
    }

    search(query) {
        return this.runRequest(this.getSearchUrl(query)).pipe(operators_1.map(($) => {
            const pages = [];
            $('.cover_global').each((index, element) => {
                const pageEl = $('.cover_infos_title a', element);
                const pageElInfo = $('.cover_infos_title .detail_release', element);
                const pageImg = $('.mainimg', element);
                pages.push(new page_1.Page(pageEl.text() + ' ' + pageElInfo.text(), pageEl.attr('href'), this, !pageImg.length ? null : pageImg.attr('src')));
            });
            return pages;
        }));
    }
}

exports.ZoneAnnuaire = ZoneAnnuaire;
//# sourceMappingURL=zone-annuaire.js.map
