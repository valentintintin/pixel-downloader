"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LinkDto {
    constructor(title, url, host = null) {
        this.title = title;
        this.url = url;
        this.host = host;
    }
    static fromObject(link) {
        return new LinkDto(link.title, link.url, link.host);
    }
}
exports.LinkDto = LinkDto;
//# sourceMappingURL=link-dto.js.map