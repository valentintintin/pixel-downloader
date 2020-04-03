"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const cli_1 = require("./cli");
const api_1 = require("./api");
if (process.argv.length >= 2) {
    switch (process.argv[2]) {
        case 'api':
            new api_1.Api().run();
            break;
        default:
            new cli_1.Cli().run(process.argv.slice(2));
            break;
    }
}
//# sourceMappingURL=index.js.map
