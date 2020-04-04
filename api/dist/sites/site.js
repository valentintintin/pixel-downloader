"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const Cheerio = require("cheerio");
const RssToJson = require("rss-to-json");
const cloudscraper = require("cloudscraper");
class Site {
    constructor(baseUrl, pageSearchRequest, searchRequest, queryParameterName, queryTypeParameterName = null) {
        this.baseUrl = baseUrl;
        this.pageSearchRequest = pageSearchRequest;
        this.searchRequest = searchRequest;
        this.queryParameterName = queryParameterName;
        this.queryTypeParameterName = queryTypeParameterName;
        this.name = this.constructor.name;
    }
    getSearchUrl(query, type = null) {
        const searchRequest = this.searchRequest.slice(0);
        searchRequest.find(r => r[0] === this.queryParameterName)[1] = query;
        if (type) {
            searchRequest.find(r => r[0] === this.queryTypeParameterName)[1] = type;
        }
        return this.getLinkWithBaseIfNeeded(this.pageSearchRequest) + '?' + searchRequest.map(r => r.join('=')).join('&');
    }
    findText(el) {
        let text = [];
        if (el) {
            if (el.type === 'text') {
                text.push(el.data.trim().replace('(', '').replace(')', ''));
            }
            else if (el.children && el.children.length) {
                for (const i in el.children) {
                    text = text.concat(this.findText(el.children[+i]));
                }
            }
            else if (Array.isArray(el)) {
                for (const i in el) {
                    text = text.concat(this.findText(el[+i]));
                }
            }
        }
        return text.length > 0 ? text.join(' ').trim() : '';
    }
    runRequest(url) {
        url = url.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/["'<>]/g, ' ')
            .toLowerCase();
        console.log(url);
        return new rxjs_1.Observable(observer => {
            cloudscraper.get(this.getLinkWithBaseIfNeeded(url)).then(data => observer.next(data), error => observer.error(error));
        }).pipe(operators_1.map(data => Cheerio.load(data)), operators_1.catchError(err => {
            console.error('url: ' + url, err);
            return rxjs_1.throwError(err);
        }));
    }
    runRss(url) {
        return new rxjs_1.Observable(observer => {
            RssToJson.load(this.getLinkWithBaseIfNeeded(url), (err, res) => {
                if (err) {
                    console.error('url: ' + url, err);
                    observer.error(err);
                }
                else {
                    observer.next(res.items);
                }
                observer.complete();
            });
        });
    }
    getLinkWithBaseIfNeeded(link) {
        return link.startsWith('http') ? link : this.baseUrl + (!this.baseUrl.endsWith('/') && !link.startsWith('/') ? '/' : '') + link;
    }
}
exports.Site = Site;
//# sourceMappingURL=site.js.map