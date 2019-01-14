import { Page } from '../page';
import { LinkDto } from './link-dto';

export class PageDto {

    public static fromObject(page: Page): PageDto {
        return new PageDto(page.title, page.url, page.date,
            page.relatedPage.map(p => PageDto.fromObject(p)),
            page.fileLinks.map(l => LinkDto.fromObject(l))
        );
    }

    public details: string;

    constructor(
        public title: string,
        public url: string,
        public date: Date | string = null,
        public relatedPage: PageDto[] = [],
        public fileLinks: LinkDto[] = []
    ) {
        this.details = '/details?link=' + this.url;
    }
}

