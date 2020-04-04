"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    static getHostFromUrl(url) {
        const regex = /(?:https?:)?(?:\/\/)?(?:.*\.)?(.*)\./gm;
        const m = regex.exec(url);
        if (m && m.length > 1) {
            return m[1].trim().toLowerCase();
        }
        else {
            return url.trim().toLowerCase();
        }
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map