// const pkg = require('../package.json');
// const conf = new Configstore(pkg.name);

import { Cli } from './src/cli';

new Cli().run(process.argv.slice(2));