export class Link {

    constructor(
        public title: string,
        public url: string,
        public host: string = null,
    ) {
        this.title = title.replace('Télécharger', '').trim();
        if (!url) {
            throw new Error('Link created with empty url');
        }
        this.url = url.trim();

        if (!host) {
            this.host = 'unknown';
        }
    }

    public toString(): string {
        return (this.title && this.title.length ? this.title : '') +
            (this.host && this.host.length ? ' - ' + this.host : '');
    }
}
