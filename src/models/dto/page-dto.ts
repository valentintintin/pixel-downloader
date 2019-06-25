import { Page } from '../page';
import { LinkDto } from './link-dto';

export class PageDto extends LinkDto {

    public static fromObject(page: Page): PageDto {
        return new PageDto(page.title, page.url, page.host,
            page.relatedPage.map(p => PageDto.fromObject(p)),
            page.fileLinks.map(l => LinkDto.fromObject(l)),
            page.image
        );
    }

    constructor(
        title: string,
        url: string,
        host: string = null,
        public relatedPage: PageDto[] = [],
        public fileLinks: LinkDto[] = [],
        public image: string = null
    ) {
        super(title, url, host);
    }
}

