"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SiteNotFoundException extends Error {
    constructor(link) {
        super('/!\\ No site found for the link ' + link);
    }
}
exports.SiteNotFoundException = SiteNotFoundException;
//# sourceMappingURL=site-not-found.exception.js.map