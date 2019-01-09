// const pkg = require('../package.json');
// const conf = new Configstore(pkg.name);

import { Cli } from './cli';

// sites[0].getDetails('https://www.zone-telechargement2.lol/films-gratuit/8689--Pay-The-Ghost.html').subscribe();
new Cli().run(process.argv.slice(2));