import { Link } from '../link';

export class LinkDto {

    public static fromObject(link: Link): LinkDto {
        return new LinkDto(link.title, link.url, link.host);
    }

    constructor(
        public title: string,
        public url: string,
        public host: string = null,
    ) {
    }
}

