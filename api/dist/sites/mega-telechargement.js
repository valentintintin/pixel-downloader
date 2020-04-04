"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const site_1 = require("./site");
const page_1 = require("../models/page");
const operators_1 = require("rxjs/operators");
const link_1 = require("../models/link");
class MegaTelechargement extends site_1.Site {
    constructor() {
        super('https://www.mega-telechargements.com', 'index.php', [
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
    getDetails(url) {
        return this.runRequest(url).pipe(operators_1.map(($) => {
            const pageEl = $('.corps h1');
            const pageElInfo = $('.corps h2');
            const pageImg = $('.corps center img').first();
            const pageDetail = new page_1.Page(pageEl.text().trim() + ' ' + pageElInfo.text().trim(), url, this, pageImg.attr('src'));
            $('.otherversions a').each((index, element) => {
                pageDetail.relatedPage.push(new page_1.Page(this.findText(element), element.attribs.href, this));
            });
            pageDetail.fileLinks = [];
            $('.ilinx_global a').each((index, element) => {
                const linkInfo = element.parent.prev.prev;
                if (!element.attribs.href.includes('javascript')) {
                    pageDetail.fileLinks.push(new link_1.Link(element.firstChild.data, element.attribs.href, this.findText(linkInfo)));
                }
            });
            $('.corps center:last-of-type b:nth-child(odd)').each((index, element) => {
                const host = this.findText(element.children);
                const link = $('a', element.next.next);
                pageDetail.fileLinks.push(new link_1.Link('Premium', link.first().attr('href'), host));
            });
            return pageDetail;
        }));
    }
    getRecents() {
        const a = this.name;
        return this.runRss('rss.xml').pipe(operators_1.map(items => items.map(i => new page_1.Page(i.title, i.link, this))));
    }
    search(query) {
        return this.runRequest(this.getSearchUrl(query)).pipe(operators_1.map(($) => {
            const pages = [];
            $('.cover_global').each((index, element) => {
                const pageEl = $('a:last-child', element);
                const pageImg = $('img', element);
                pages.push(new page_1.Page(pageEl.text(), pageEl.attr('href'), this, !pageImg.length ? null : pageImg.attr('src')));
            });
            return pages;
        }));
    }
}
exports.MegaTelechargement = MegaTelechargement;
//# sourceMappingURL=mega-telechargement.js.map