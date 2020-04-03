import { Link } from './link';
import { Site } from '../sites/site';

export class Page extends Link {

    public relatedPage: Page[] = [];
    public fileLinks: Link[] = [];

    constructor(
        title: string,
        url: string,
        public site: Site = null,
        public image: string = null,
    ) {
        super(title, site.getLinkWithBaseIfNeeded(url), site.name);

        if (image) {
            this.image = site.getLinkWithBaseIfNeeded(image);
        }
    }

    public toString(): string {
        return this.title;
    }
}

