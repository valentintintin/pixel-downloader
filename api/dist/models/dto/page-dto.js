"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const link_dto_1 = require("./link-dto");

class PageDto extends link_dto_1.LinkDto {
    constructor(title, url, host = null, relatedPage = [], fileLinks = [], image = null) {
        super(title, url, host);
        this.relatedPage = relatedPage;
        this.fileLinks = fileLinks;
        this.image = image;
    }

    static fromObject(page) {
        return new PageDto(page.title, page.url, page.host, page.relatedPage.map(p => PageDto.fromObject(p)).sort((a, b) => a.title < b.title ? -1 : 1), page.fileLinks.map(l => link_dto_1.LinkDto.fromObject(l)), page.image);
    }
}

exports.PageDto = PageDto;
//# sourceMappingURL=page-dto.js.map
