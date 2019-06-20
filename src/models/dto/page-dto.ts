import { Page } from '../page';
import { LinkDto } from './link-dto';

export class PageDto extends LinkDto {

    public static fromObject(page: Page): PageDto {
        return new PageDto(page.title, page.url, page.site.host,
            page.relatedPage.map(p => PageDto.fromObject(p)),
            page.fileLinks.map(l => LinkDto.fromObject(l)),
            page.image
        );
    }

    public details: string;

    constructor(
        title: string,
        url: string,
        host: string = null,
        public relatedPage: PageDto[] = [],
        public fileLinks: LinkDto[] = [],
        public image: string = null
    ) {
        super(title, url, host);
        this.details = '/details?link=' + this.url;
    }
}

