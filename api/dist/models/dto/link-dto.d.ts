import { Link } from '../link';

export declare class LinkDto {
    title: string;
    url: string;
    host: string;

    static fromObject(link: Link): LinkDto;

    constructor(title: string, url: string, host?: string);
}
