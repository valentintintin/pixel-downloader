export class Link {

    constructor(
        public title: string,
        public url: string,
        public host: string = null,
        public date: string = null,
        public size: string = null
    ) {
    }

    public toString(): string {
        return (this.host ? this.host + ' - ' : '') + this.title + (this.size ? ' - ' + this.size : '') + (this.date ? ' - ' + this.date : '');
    }
}
