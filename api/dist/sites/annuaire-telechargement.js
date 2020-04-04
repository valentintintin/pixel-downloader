"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const site_1 = require("./site");
const rxjs_1 = require("rxjs");
const page_1 = require("../models/page");
const operators_1 = require("rxjs/operators");
const link_1 = require("../models/link");
class AnnuaireTelechargement extends site_1.Site {
    constructor() {
        super('https://www.annuaire-telechargement.best/', 'index.php', [
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
            const pageImg = $('.affichefiche');
            const pageDetail = new page_1.Page($('.hr-divider-heading').text(), url, this, pageImg.length ? pageImg.attr('src') : null);
            $('.liste_saisons a').each((index, element) => {
                pageDetail.relatedPage.push(new page_1.Page(this.findText(element), element.attribs.href, this));
            });
            pageDetail.fileLinks = [];
            $('a.list-group-item').each((index, element) => {
                const pageEl = $(element).children('span');
                const title = pageEl.children('b').text();
                if (!title.includes('LIEN PREMIUM')) {
                    pageDetail.fileLinks.push(new link_1.Link(title, this.getLinkWithBaseIfNeeded(element.attribs.href), pageEl.children('.providers').attr('title')));
                }
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
            $('.row .statcards a').each((index, element) => {
                const pageEl = $(element);
                const pageImg = $('.affiche', element);
                pages.push(new page_1.Page(pageEl.text(), pageEl.attr('href'), this, !pageImg.length ? null : pageImg.attr('src')));
            });
            return pages;
        }));
    }
}
exports.AnnuaireTelechargement = AnnuaireTelechargement;
//# sourceMappingURL=annuaire-telechargement.js.map