"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const link_1 = require("./models/link");
const JdownloaderApi = require("jdownloader-api");
class Jdownloader {
    constructor(username, password, deviceName) {
        this.username = username;
        this.password = password;
        this.deviceName = deviceName;
        this.linksToAdd = [];
    }
    addLinkToQueue(link) {
        if (!this.linksToAdd.find(l => l.url === link.url)) {
            this.linksToAdd.push(link);
            return true;
        }
        return false;
    }
    getLinksFromServer() {
        return this.connect().pipe(operators_1.switchMap(() => {
            return rxjs_1.Observable.create(observer => {
                JdownloaderApi.queryLinks(this.deviceId).then(links => {
                    observer.next(links.data.map(l => new link_1.Link(l.name, l.url)));
                    observer.complete();
                }).catch((err) => {
                    observer.error(err);
                    observer.complete();
                });
            });
        }));
    }
    addLinksToQueue(links) {
        const linksAdded = [];
        links.forEach(link => {
            if (this.addLinkToQueue(link)) {
                linksAdded.push(link);
            }
        });
        return linksAdded;
    }
    flushQueueToServer() {
        if (!this.linksToAdd.length) {
            return rxjs_1.of(null);
        }
        return this.connect().pipe(operators_1.switchMap(() => {
            return rxjs_1.Observable.create(observer => {
                JdownloaderApi.queryLinks(this.deviceId).then(links => {
                    const currentLinks = links.data.map(l => l.url);
                    const linksToAdd = this.linksToAdd.map(l => l.url).filter(l => currentLinks.indexOf(l) === -1);
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
    connect() {
        return rxjs_1.Observable.create(observer => {
            JdownloaderApi.connect(this.username, this.password).then(() => {
                if (!this.deviceId) {
                    JdownloaderApi.listDevices().then(res => {
                        const device = res.find(d => d.name === this.deviceName);
                        if (device) {
                            this.deviceId = device.id;
                            observer.next(this.deviceId);
                            observer.complete();
                        }
                        else {
                            observer.error(this.deviceName + ' not found');
                            observer.complete();
                        }
                    }).catch((err) => {
                        observer.error(err);
                        observer.complete();
                    });
                }
                else {
                    observer.next(this.deviceId);
                    observer.complete();
                }
            }).catch((err) => {
                observer.error(err);
                observer.complete();
            });
        });
    }
    disconnect() {
        return JdownloaderApi.disconnect();
    }
}
exports.Jdownloader = Jdownloader;
//# sourceMappingURL=jdownloader.js.map