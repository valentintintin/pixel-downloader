import { PageVersionInterface } from './page-version-interface';

export interface PageDetailInterface extends PageVersionInterface {
    relatedPage?: PageDetailInterface[];
    fileLinks?: PageVersionInterface[];
}
