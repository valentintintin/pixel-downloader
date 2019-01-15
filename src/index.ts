// const pkg = require('../package.json');
// const conf = new Configstore(pkg.name);

import { Cli } from './cli';

new Cli().run(process.argv.slice(2));