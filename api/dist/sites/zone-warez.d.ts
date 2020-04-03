import { Site } from './site';
import { Observable } from 'rxjs';
import { Page } from '../models/page';

export declare class ZoneWarez extends Site {
    constructor();

    search(query: string): Observable<Page[]>;

    getDetails(url: string): Observable<Page>;

    getRecents(): Observable<Page[]>;
}
