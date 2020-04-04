import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
export declare class ExtremeDownload extends Site {
    constructor();
    getDetails(url: string): Observable<Page>;
    getRecents(): Observable<Page[]>;
    search(query: string): Observable<Page[]>;
}
