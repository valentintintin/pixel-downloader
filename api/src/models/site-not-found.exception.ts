export class SiteNotFoundException extends Error {

    constructor(link: string) {
        super('/!\\ No site found for the link ' + link);
    }
}