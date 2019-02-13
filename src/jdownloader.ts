import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Link } from './models/link';
import JdownloaderApi = require('jdownloader-api');

export class Jdownloader {

    public linksToAdd: Link[] = [];

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

    public getLinksFromServer(): Observable<Link[]> {
        return this.connect().pipe(
            switchMap(() => {
                return Observable.create(observer => {
                    JdownloaderApi.queryLinks(this.deviceId).then(links => {
                        observer.next(links.data.map(l => new Link(l.name, l.url)));
                        observer.complete();
                    }).catch((err) => {
                        observer.error(err);
                        observer.complete();
                    });
                });
            })
        );
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

    public flushQueueToServer(): Observable<Link[]> {
        if (!this.linksToAdd.length) {
            return of(null);
        }
        return this.connect().pipe(switchMap(() => {
            return Observable.create(observer => {
                JdownloaderApi.queryLinks(this.deviceId).then(links => {
                    const currentLinks: string[] = links.data.map(l => l.url);
                    const linksToAdd: string[] = this.linksToAdd.map(l => l.url).filter(l => currentLinks.indexOf(l) === -1);
                    JdownloaderApi.addLinks(linksToAdd, this.deviceId, true).then(() => {
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

    private connect(): Observable<number> {
        return Observable.create(observer => {
            JdownloaderApi.connect(this.username, this.password).then(() => {
                if (!this.deviceId) {
                    JdownloaderApi.listDevices().then(res => {
                        const device = res.find(d => d.name === this.deviceName);
                        if (device) {
                            this.deviceId = device.id;
                            observer.next(this.deviceId);
                            observer.complete();
                        } else {
                            observer.error(this.deviceName + ' not found');
                            observer.complete();
                        }
                    }).catch((err) => {
                        observer.error(err);
                        observer.complete();
                    });
                } else {
                    observer.next(this.deviceId);
                    observer.complete();
                }
            }).catch((err) => {
                observer.error(err);
                observer.complete();
            });
        });
    }

    private disconnect(): Promise<any> {
        return JdownloaderApi.disconnect();
    }
}
