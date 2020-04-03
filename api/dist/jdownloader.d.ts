import { Observable } from 'rxjs';
import { Link } from './models/link';

export declare class Jdownloader {
    private username;
    private password;
    private deviceName;
    linksToAdd: Link[];
    private deviceId;

    constructor(username: string, password: string, deviceName: string);

    addLinkToQueue(link: Link): boolean;

    getLinksFromServer(): Observable<Link[]>;

    addLinksToQueue(links: Link[]): Link[];

    flushQueueToServer(): Observable<Link[]>;

    private connect;
    private disconnect;
}
