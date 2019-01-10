import { Link } from './link';
import { Site } from '../sites/site';

export class Page extends Link {


    public relatedPage: Page[] = [];
    public fileLinks: Link[] = [];
    
    constructor(
        title: string,
        url: string,
        public language: string = null,
        public quality: string = null,
        host: string = null,
        date: Date | string = null,
        size: string = null,
        public site: Site = null
    ) {
        super(title, url, host, date, size);

        if (language) {
            this.language = language.trim();
        }
        if (quality) {
            this.quality = quality
                .replace('Qualité', '')
                .replace('[', '')
                .replace(']', '')
                .trim();
        }
    }

    public toString(): string {
        return this.title + (this.language ? ' ' + this.language : '') + (this.quality ? ' ' + this.quality : '');
    }
}

