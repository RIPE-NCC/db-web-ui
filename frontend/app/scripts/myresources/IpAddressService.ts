declare const Address4: any;       // http://ip-address.js.org/#address4
declare const Address6: any;       // http://ip-address.js.org/#address6
declare const BigInteger: any;     // https://github.com/andyperlitch/jsbn

class IpAddressService {

    private static CIDR2MASK = [
        0x00000000, 0x80000000, 0xC0000000, 0xE0000000, 0xF0000000, 0xF8000000, 0xFC000000, 0xFE000000, 0xFF000000,
        0xFF800000, 0xFFC00000, 0xFFE00000, 0xFFF00000, 0xFFF80000, 0xFFFC0000, 0xFFFE0000, 0xFFFF0000, 0xFFFF8000,
        0xFFFFC000, 0xFFFFE000, 0xFFFFF000, 0xFFFFF800, 0xFFFFFC00, 0xFFFFFE00, 0xFFFFFF00, 0xFFFFFF80, 0xFFFFFFC0,
        0xFFFFFFE0, 0xFFFFFFF0, 0xFFFFFFF8, 0xFFFFFFFC, 0xFFFFFFFE, 0xFFFFFFFF];

    private ipv4RangeRegex = new RegExp(/([\d.]+) - ([\d.]+)/);

    public getIpv4Start(range: ResourceRange): number {
        const match = this.ipv4RangeRegex.exec(range.string);
        return new Address4(match[1]).bigInteger().intValue();
    }

    public getIpv4End(range: ResourceRange): number {
        const match = this.ipv4RangeRegex.exec(range.string);
        return new Address4(match[2]).bigInteger().intValue();
    }

    public range2CidrList(startIp: string, endIp: string) {
        let start = IpAddressService.ipToLong(startIp);
        const end = IpAddressService.ipToLong(endIp);
        const cidrs = [];

        while (end >= start) {
            let maxsize = 32;
            while (maxsize > 0) {
                const mask = IpAddressService.CIDR2MASK[maxsize - 1];
                const maskedBase = start & mask;
                if (maskedBase !== start) {
                    break;
                }
                maxsize--;
            }
            const diff = Math.log(end - start + 1) / Math.log(2);
            const maxdiff = (32 - Math.floor(diff));
            if (maxsize < maxdiff) {
              maxsize = maxdiff;
            }
            const ip = IpAddressService.longToIP(start);
            cidrs.push(ip + "/" + maxsize);
            start += Math.pow(2, (32 - maxsize));
        }
        return cidrs;
    }

    private static ipToLong(strIP: string): number {
      const parts = strIP.split(".");
      return (parseInt(parts[0], 10) << 24) +
             (parseInt(parts[1], 10) << 16) +
             (parseInt(parts[2], 10) << 8) +
             (parseInt(parts[3], 10));
     }

    private static longToIP(ip: number): string {
        return ((ip >> 24) & 255) + "." +
               ((ip >> 16) & 255) + "." +
               ((ip >> 8) & 255) + "." +
               (ip & 255);
    }
}

angular
    .module("dbWebApp")
    .service("IpAddressService", IpAddressService);
