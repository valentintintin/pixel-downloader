import { Link } from './link';
import { Site } from '../sites/site';

export class Page extends Link {

    public language: string = null;
    public quality: string = null;

    public relatedPage: Page[] = [];
    public fileLinks: Link[] = [];
    
    constructor(
        title: string,
        url: string,
        public site: Site = null,
        host: string = null,
    ) {
        super(title, url, host);
    }

    public toString(): string {
        return this.title;
    }
}

