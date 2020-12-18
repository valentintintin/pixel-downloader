import { Page } from '../models/page';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Cheerio = require('cheerio');
import RssToJson = require('rss-to-json');
import cloudscraper = require('cloudscraper');

export abstract class Site {

    public name: string;

    protected constructor(public readonly baseUrl: string,
                          protected pageSearchRequest: string,
                          protected readonly searchRequest: string[][],
                          protected readonly queryParameterName: string,
                          protected readonly queryTypeParameterName: string = null) {
        this.name = this.constructor.name;
    }

    public abstract search(query: string): Observable<Page[]>;

    public abstract getDetails(url: string): Observable<Page>;

    public abstract getRecents(): Observable<Page[]>;

    protected getSearchUrl(query: string, type: string = null): string {
        const searchRequest = this.searchRequest.slice(0);
        searchRequest.find(r => r[0] === this.queryParameterName)[1] = query;
        if (type) {
            searchRequest.find(r => r[0] === this.queryTypeParameterName)[1] = type;
        }
        return this.getLinkWithBaseIfNeeded(this.pageSearchRequest) + '?' + searchRequest.map(r => r.join('=')).join('&');
    }

    protected findText(el): string {
        let text = [];

        if (el) {
            if (el.type === 'text') {
                text.push(el.data.trim().replace('(', '').replace(')', ''));
            } else if (el.children && el.children.length) {
                for (const i in el.children) {
                    text = text.concat(this.findText(el.children[+i]));
                }
            } else if (Array.isArray(el)) {
                for (const i in el) {
                    text = text.concat(this.findText(el[+i]));
                }
            }
        }
        return text.length > 0 ? text.join(' ').trim() : '';
    }

    protected runRequest(url: string): Observable<{} | CheerioStatic> {
        url = url.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/["'<>]/g, ' ')
            .toLowerCase();

        console.log(url);

        return new Observable<string>(observer => {
            (cloudscraper as any).get(this.getLinkWithBaseIfNeeded(url)).then(data => observer.next(data), error => observer.error(error));
        }).pipe(
            catchError(err => {
                console.error('url: ' + url, err);
                return throwError(err);
            }),
            map(data => Cheerio.load(data)),
            catchError(err => {
                console.error('Cheerio', err);
                return throwError(err);
            })
        );
    }

    protected runRss(url: string): Observable<any[]> {
        return new Observable<any[]>(observer => {
            RssToJson.load(this.getLinkWithBaseIfNeeded(url), (err, res) => {
                if (err) {
                    console.error('url: ' + url, err);
                    observer.error(err);
                } else {
                    observer.next(res.items);
                }
                observer.complete();
            })
        });
    }

    public getLinkWithBaseIfNeeded(link: string): string {
        return link.startsWith('http') ? link : this.baseUrl + (!this.baseUrl.endsWith('/') && !link.startsWith('/') ? '/' : '') + link;
    }
}
