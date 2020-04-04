import { Link } from './link';
import { Site } from '../sites/site';
export declare class Page extends Link {
    site: Site;
    image: string;
    relatedPage: Page[];
    fileLinks: Link[];
    constructor(title: string, url: string, site?: Site, image?: string);
    toString(): string;
}
