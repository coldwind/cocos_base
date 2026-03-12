export class GameUtils {
    //[min, max]
    public static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static getDecimalPlaces(num) {
        const numStr = num.toString();
        const decimalIndex = numStr.indexOf('.');
        if (decimalIndex === -1) {
            return 0;
        }
        return numStr.length - decimalIndex - 1;
    }

    public static getQueryString(name) {
        if (!window) {
            return null;
        }

        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substring(1).match(reg);
        if (r != null) {
            return decodeURIComponent(r[2]);
        }
        return null;
    }
}