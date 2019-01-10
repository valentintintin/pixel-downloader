export class RssItem {

    constructor(
        public title: string,
        public link: string,
        public description: string = null,
        public date: Date = null
    ) {
    }

    public toString(): string {
        return this.title + (this.date ? ' - ' + this.date : '');
    }
}
