export class Link {

    constructor(
        public title: string,
        public url: string,
        public host: string = null,
    ) {
        this.title = title
            .replace('Télécharger', '')
            .replace('Regarder', '')
            .replace('-', '')
            .replace(':', '')
            .trim();

        if (!url) {
            throw new Error('Link created with empty url');
        }
        this.url = url.trim();

        if (!host || host.trim().length < 3) {
            this.host = null;
        } else {
            this.host = host
                .replace('-', '')
                .replace(':', '')
                .replace(title, '')
                .trim();
        }

        this.title = this.title
            .replace(this.host, '')
            .trim();
    }

    public toString(): string {
        return (this.title && this.title.length ? this.title : '') +
            (this.host && this.host.length ? ' - ' + this.host : '');
    }
}
