export declare class Cli {
    private readonly jd;
    private readonly sites;
    private spinner;

    constructor();

    run(argv?: string[]): void;

    private main;
    private doSearch;
    private doJdownloaderFlush;
    private doJdownloaderGet;
    private doRecents;
    private selectPageVersionAndLinks;
    private selectLinksToSave;
    private menu;
    private ask;
}
