import { Utils } from '../utils';

export class Link {

    constructor(
        public title: string,
        public url: string,
        public host: string = null,
        public date: Date | string = null,
        public size: string = null
    ) {
        this.title = title.replace('Télécharger', '').trim();
        this.url = url.trim();

        if (host) {
            this.host = Utils.getHostFromUrl(host);
        }
        if (date && typeof date === 'string') {
            this.date = date.replace('-', '').trim();
        }
        if (size) {
            this.size = size.replace('-', '').trim();
        }
    }

    public toString(): string {
        return (this.host ? this.host + ' - ' : '') + (this.title ? this.title : '') + (this.size ? ' - ' + this.size : '') + (this.date ? ' - ' + this.date : '');
    }
}
