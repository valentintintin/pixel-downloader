import { Cli } from './cli';
import { Api } from './api';

if (process.argv.length >= 2) {
    switch (process.argv[2]) {
        case 'api':
            new Api().run();
            break;
        default:
            new Cli().run(process.argv.slice(2));
            break;
    }
}