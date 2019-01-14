import { Link } from '../link';

export class LinkDto {

    public static fromObject(link: Link): LinkDto {
        return new LinkDto(link.title, link.url, link.host, link.date, link.size);
    }

    constructor(
        public title: string,
        public url: string,
        public host: string = null,
        public date: Date | string = null,
        public size: string = null
    ) {
    }
}

