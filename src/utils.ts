export class Utils {

    public static getHostFromUrl(url: string): string {
        const regex = /(?:https?:)?(?:\/\/)?(?:www\d?.)?(.*)\./gm;
        const m = regex.exec(url);
        if (m && m.length > 1) {
            return m[1].trim().toLowerCase();
        } else {
            return url.trim().toLowerCase();
        }
    }
}
