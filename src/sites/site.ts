import { Observable } from 'rxjs';
import { RxHR } from '@akanass/rx-http-request';
import { catchError, filter, map } from 'rxjs/operators';
import * as cheerio from 'cheerio';
import { PageVersionInterface } from '../interfaces/page-version-interface';
import { PageDetailInterface } from '../interfaces/page-detail-interface';

export abstract class Site {
    
    protected constructor(protected readonly baseUrl: string, protected pageSearchRequest: string, protected readonly searchRequest: string[][], protected readonly queryParameterName: string) {
        if (this.baseUrl[this.baseUrl.length - 1] !== '/') {
            this.baseUrl += '/';
        }
    }
    
    public abstract search(query: string): Observable<PageVersionInterface[]>;
    
    public abstract details(url: string): Observable<PageDetailInterface>;
    
    protected getSearchUrl(query: string): string {
        const searchRequest = this.searchRequest.slice(0);
        searchRequest.find(r => r[0] == this.queryParameterName)[1] = query;
        return this.baseUrl + this.pageSearchRequest + '?' + searchRequest.map(r => r.join('=')).join('&');
    }
    
    protected findText(el): string {
        let text = [];
        
        if (el.type === 'text') {
            text.push(el.data.trim().replace('(', '').replace(')', ''));
        } else if (el.children && el.children.length) {
            for (const i in el.children) {
                text = text.concat(this.findText(el.children[i]));
            }
        }
        return text.join(' ');
    }
    
    protected runRequest(url: string): Observable<{} | CheerioStatic> {
        return RxHR.get(url).pipe(
            filter(data => data.response.statusCode === 200),
            map(data => cheerio.load(data.body)),
            catchError(err => {
                console.error(err);
                return err;
            })
        );
    }
}
