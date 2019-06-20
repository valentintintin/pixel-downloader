import { Link } from './link';
import { Site } from '../sites/site';

export class Page extends Link {

    public relatedPage: Page[] = [];
    public fileLinks: Link[] = [];
    
    constructor(
        title: string,
        url: string,
        public site: Site = null,
        host: string = null,
        public image: string = null,
    ) {
        super(title, url, host);
    }

    public toString(): string {
        return this.title;
    }
}

