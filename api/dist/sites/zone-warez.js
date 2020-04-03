"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const site_1 = require("./site");
const operators_1 = require("rxjs/operators");
const page_1 = require("../models/page");
const link_1 = require("../models/link");

class ZoneWarez extends site_1.Site {
    constructor() {
        super('https://www2.zone-warez.com/', 'index.php', [
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
                '0'
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

    search(query) {
        return this.runRequest(this.getSearchUrl(query)).pipe(operators_1.map(($) => {
            const pages = [];
            $('.mov > a:first-child').each((index, element) => {
                const pageImg = $('img', element);
                pages.push(new page_1.Page(element.attribs.title, element.attribs.href, this, !pageImg.length ? null : pageImg.attr('src')));
            });
            return pages;
        }));
    }

    getDetails(url) {
        return this.runRequest(url).pipe(operators_1.map(($) => {
            const pageEl = $('h2').find('b');
            const pageElInfo = pageEl.parent().next();
            let pageImg = $('.jaquette');
            if (pageImg.length === 0) {
                pageImg = $('center > img:first-child');
            }
            const pageDetail = new page_1.Page(pageEl.text().trim() + ' ' + pageElInfo.text().trim(), url, this, !pageImg.length ? null : (pageImg.attr('src') ? pageImg.attr('src') : pageImg.data('cfsrc')));
            $('.otherversions a').each((index, element) => {
                pageDetail.relatedPage.push(new page_1.Page(this.findText(element), element.attribs.href, this));
            });
            const hosts = $('table.downloadsortsonlink');
            hosts.find('thead th:first-child').each((index, element) => {
                $('.download', hosts.get(index)).each((index1, linkElement) => pageDetail.fileLinks.push(new link_1.Link(this.findText(linkElement), this.getLinkWithBaseIfNeeded(linkElement.attribs.href), this.findText(element))));
            });
            return pageDetail;
        }));
    }

    getRecents() {
        return this.runRss('rss.xml').pipe(operators_1.map(items => items.map(i => new page_1.Page(i.title, i.link, this))));
    }
}

exports.ZoneWarez = ZoneWarez;
//# sourceMappingURL=zone-warez.js.map
