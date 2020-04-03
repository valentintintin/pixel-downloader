import { LinkDto } from './link-dto';

export interface PageDto extends LinkDto {
    relatedPage: PageDto[];
    fileLinks: LinkDto[];
    fileLinksByHost: any;
    image?: string;
}

