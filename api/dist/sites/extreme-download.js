"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const site_1 = require("./site");
const page_1 = require("../models/page");
const operators_1 = require("rxjs/operators");
const link_1 = require("../models/link");

class ExtremeDownload extends site_1.Site {
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
            const pageEl = $('#news-title');
            const pageImg = $('.blockcontent img');
            const pageDetail = new page_1.Page(pageEl.text(), url, this, !pageImg.length ? null : pageImg.attr('src'));
            $('.widget a.btn-other').each((index, element) => {
                pageDetail.relatedPage.push(new page_1.Page(this.findText(element), element.attribs.href, this));
            });
            pageDetail.fileLinks = [];
            $('.blockcontent a').each((index, element) => {
                if (element.attribs.href &&
                    (!element.attribs.href.includes('javascript') &&
                        !element.attribs.href.includes('shop') &&
                        !element.attribs.href.includes('prezup') &&
                        !element.attribs.href.includes('register') &&
                        ['div', 'strong', 'p'].includes(element.parent.name)) &&
                    (!element.attribs.title || !element.attribs.title.includes('Regarder')) &&
                    element.attribs.target) {
                    let title = this.findText(element.parent);
                    let host = null;
                    let hostSplited = title.split(' ');
                    if (hostSplited.length >= 1) {
                        title = hostSplited.pop().trim();
                        host = hostSplited.join(' ').replace('-', '').trim();
                    }
                    pageDetail.fileLinks.push(new link_1.Link(title, this.getLinkWithBaseIfNeeded(element.attribs.href), host));
                }
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
            $('#dle-content a.thumbnails').each((index, element) => {
                const pageImg = $('img', element);
                pages.push(new page_1.Page(this.findText(element), element.attribs.href, this, !pageImg.length ? null : pageImg.attr('src')));
            });
            return pages;
        }));
    }
}

exports.ExtremeDownload = ExtremeDownload;
//# sourceMappingURL=extreme-download.js.map
