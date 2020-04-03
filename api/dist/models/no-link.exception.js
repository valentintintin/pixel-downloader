"use strict";
Object.defineProperty(exports, "__esModule", {value: true});

class NoLinkException extends Error {
    constructor(message) {
        super('/!\\ ' + message);
    }
}

exports.NoLinkException = NoLinkException;
//# sourceMappingURL=no-link.exception.js.map
