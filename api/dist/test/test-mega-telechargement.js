"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const mega_telechargement_1 = require("../sites/mega-telechargement");
const site = new mega_telechargement_1.MegaTelechargement();
site.getDetails(site.baseUrl + '/films/films-bluray-hd/films-bluray-1080p/171393-comme-des-betes-2.html').subscribe(res => console.log(res));
//# sourceMappingURL=test-mega-telechargement.js.map
