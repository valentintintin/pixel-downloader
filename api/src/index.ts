import { Api } from './api';

process.on('SIGINT', function () {
    process.exit();
});

new Api().run();
