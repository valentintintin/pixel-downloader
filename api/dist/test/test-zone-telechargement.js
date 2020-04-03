"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const zone_telechargement_1 = require("../sites/zone-telechargement");
const site = new zone_telechargement_1.ZoneTelechargement();
site.getRecents().subscribe(res => console.log(res));
//# sourceMappingURL=test-zone-telechargement.js.map
