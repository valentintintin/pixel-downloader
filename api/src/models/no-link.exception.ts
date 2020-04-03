export class NoLinkException extends Error {

    constructor(message: string) {
        super('/!\\ ' + message);
    }
}