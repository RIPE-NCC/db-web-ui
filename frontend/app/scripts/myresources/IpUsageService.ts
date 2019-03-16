const IPv6SIZE: string[] = ["", "K", "M", "G", "T"];

class IpUsageService {

    public calcFreeSpace(total: number, used: number): number {
        return total - used;
    }

    public calcShorterValue(value: number): string {
        if (value === undefined) {
            return "";
        }
        let counter = 0;
        while (value >= 1024) {
            value = value / 1024;
            counter++;
        }
        return Math.round(value) + IPv6SIZE[counter];
    }
}

angular
    .module("dbWebApp")
    .service("IpUsageService", IpUsageService);
