import { Page } from '../page';
import { LinkDto } from './link-dto';
export declare class PageDto extends LinkDto {
    relatedPage: PageDto[];
    fileLinks: LinkDto[];
    image: string;
    static fromObject(page: Page): PageDto;
    constructor(title: string, url: string, host?: string, relatedPage?: PageDto[], fileLinks?: LinkDto[], image?: string);
}
