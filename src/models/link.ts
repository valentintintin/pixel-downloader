import { Utils } from '../utils';

export class Link {

    constructor(
        public title: string,
        public url: string,
        public host: string = null,
    ) {
        this.title = title.replace('Télécharger', '').trim();
        this.url = url.trim();

        if (host) {
            this.host = Utils.getHostFromUrl(host);
        }
    }

    public toString(): string {
        return (this.title && this.title.length ? this.title : '') +
            (this.host && this.host.length ? ' - ' + this.host : '');
    }
}
