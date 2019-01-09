import { Link } from './link';

export class Page extends Link {

    constructor(
        title: string,
        url: string,
        public language: string = null,
        public quality: string = null,
        host: string = null,
        date: string = null,
        size: string = null,
        public relatedPage: Page[] = [],
        public fileLinks: Link[] = []
    ) {
        super(title, url, host, date, size);
    }

    public fileLinksByHost(): { [key: string]: Link[] } {
        const links: { [key: string]: Link[] } = {};
        this.fileLinks.forEach(link => {
            if (links[link.host] === null) {
                links[link.host] = [];
            }
            links[link.host].push(link);
        });
        return links;
    }

    public toString(): string {
        return this.title + (this.language ? ' ' + this.language : '') + (this.quality ? ' ' + this.quality : '');
    }
}

