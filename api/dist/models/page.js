"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const link_1 = require("./link");
class Page extends link_1.Link {
    constructor(title, url, site = null, image = null) {
        super(title, site.getLinkWithBaseIfNeeded(url), site.name);
        this.site = site;
        this.image = image;
        this.relatedPage = [];
        this.fileLinks = [];
        if (image) {
            this.image = site.getLinkWithBaseIfNeeded(image);
        }
    }
    toString() {
        return this.title;
    }
}
exports.Page = Page;
//# sourceMappingURL=page.js.map