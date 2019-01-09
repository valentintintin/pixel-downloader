export class RssItem {

    constructor(
        public title: string,
        public link: string,
        public description: string = null,
        public category: string = null,
        public date: string = null
    ) {
    }

    public toString(): string {
        return this.title + (this.category ? ' - ' + this.category : '') + (this.date ? ' - ' + this.date : '');
    }
}
