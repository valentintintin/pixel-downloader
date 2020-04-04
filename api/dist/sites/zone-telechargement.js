"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const site_1 = require("./site");
const rxjs_1 = require("rxjs");
const page_1 = require("../models/page");
const operators_1 = require("rxjs/operators");
const link_1 = require("../models/link");
class ZoneTelechargement extends site_1.Site {
    constructor() {
        super('https://www.zone-telechargement.ninja/', 'index.php', [
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
    getDetails(url) {
        return this.runRequest(url).pipe(operators_1.map(($) => {
            let pageEl = $('.corps .smallsep').next();
            let title = pageEl.text() + ' ' + pageEl.next().text();
            if (title.trim().length === 0) {
                pageEl = $('.corps').children();
                if (pageEl.length > 0) {
                    pageEl = pageEl.first().children();
                    if (pageEl.length > 0) {
                        title = pageEl.first().text();
                        if (pageEl.first().next()) {
                            title += ' ' + pageEl.first().next().text();
                        }
                    }
                }
            }
            const pageImg = $('.fr-fic.fr-dib');
            const pageImg2 = $('.corps center img:first-child');
            const pageDetail = new page_1.Page(title, url, this, !pageImg.length ? !pageImg2.length ? null : pageImg2.attr('src') : pageImg.attr('src'));
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
        return rxjs_1.of([]);
    }
    search(query) {
        return rxjs_1.combineLatest(['films', 'series'].map(type => this.searchPageProcess(query, type))).pipe(operators_1.map(results => [].concat.apply([], results).sort((a, b) => a.title < b.title ? -1 : 1)));
    }
    searchPageProcess(query, type) {
        return this.runRequest(this.getSearchUrl(query, type)).pipe(operators_1.map(($) => {
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
exports.ZoneTelechargement = ZoneTelechargement;
//# sourceMappingURL=zone-telechargement.js.map