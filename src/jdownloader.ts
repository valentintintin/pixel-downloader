import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Link } from './models/link';
import JdownloaderApi = require('jdownloader-api');

export class Jdownloader {

    public linksToAdd: Link[] = [];
    
    private alreadyConnected = false;
    private deviceId: string;
    
    constructor(private username: string, private password: string, private deviceName: string) {
    }

    public addLinkToQueue(link: Link): boolean {
        if (!this.linksToAdd.find(l => l.url === link.url)) {
            this.linksToAdd.push(link);
            return true;
        }
        return false;
    }

    public addLinksToQueue(links: Link[]): Link[] {
        const linksAdded: Link[] = [];
        links.forEach(link => {
            if (this.addLinkToQueue(link)) {
                linksAdded.push(link);
            }
        });
        return linksAdded;
    }

    public flushQueue(): Observable<Link[]> {
        if (!this.linksToAdd.length) {
            return of(null);
        }
        return this.connect().pipe(switchMap(() => {
            return Observable.create(observer => {
                JdownloaderApi.queryLinks(this.deviceId).then(links => {
                    const currentLinks: string[] = links.data.map(l => l.url);
                    const linksToAdd: string[] = this.linksToAdd.map(l => l.url).filter(l => currentLinks.indexOf(l) === -1);
                    JdownloaderApi.addLinks(linksToAdd, this.deviceId, false).then(() => {
                        this.linksToAdd.length = 0;
                        this.disconnect().then(() => {
                            observer.next(linksToAdd);
                            observer.complete();
                        }).catch((err) => {
                            observer.error(err);
                            observer.complete();
                        });
                    }).catch((err) => {
                        observer.error(err);
                        observer.complete();
                    });
                }).catch((err) => {
                    observer.error(err);
                    observer.complete();
                });
            });
        }));
    }
    
    private connect(): Observable<void> {
        return Observable.create(observer => {
            if (!this.alreadyConnected) {
                JdownloaderApi.connect('valentin.s.10@gmail.com', '***REMOVED***').then(() => {
                    this.alreadyConnected = true;
                    if (!this.deviceId) {
                        JdownloaderApi.listDevices().then(res => {
                            this.deviceId = res.find(d => d.name === this.deviceName).id;
                            observer.next();
                            observer.complete();
                        }).catch((err) => {
                            observer.error(err);
                            observer.complete();
                        });
                    } else {
                        observer.next();
                        observer.complete();
                    }
                }).catch((err) => {
                    observer.error(err);
                    observer.complete();
                });
            } else {
                JdownloaderApi.reconnect().then(() => {
                    observer.next();
                    observer.complete();
                }).catch((err) => {
                    observer.error(err);
                    observer.complete();
                });
            }
        });
    }
    
    private disconnect(): Promise<any> {
        return JdownloaderApi.disconnect();
    }
}
