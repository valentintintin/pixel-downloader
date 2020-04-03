"use strict";
Object.defineProperty(exports, "__esModule", {value: true});

class Link {
    constructor(title, url, host = null) {
        this.title = title;
        this.url = url;
        this.host = host;
        this.title = title.replace('Télécharger', '').trim();
        if (!url) {
            throw new Error('Link created with empty url');
        }
        this.url = url.trim();
        if (!host) {
            this.host = 'unknown';
        }
    }

    toString() {
        return (this.title && this.title.length ? this.title : '') +
            (this.host && this.host.length ? ' - ' + this.host : '');
    }
}

exports.Link = Link;
//# sourceMappingURL=link.js.map
