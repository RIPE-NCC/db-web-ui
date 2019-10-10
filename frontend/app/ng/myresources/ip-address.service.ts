import {Injectable} from "@angular/core";
import {IResourceRangeModel} from "./resource-type.model";

declare const BigInteger: any;     // https://github.com/andyperlitch/jsbn
declare const Address4: any;       // http://ip-address.js.org/#address4
declare const Address6: any;       // http://ip-address.js.org/#address6
// FIXME [IS] check what is better approach
// const Address4 = require('ip-address').Address4;
// const Address6 = require('ip-address').Address6;

const ipv4RangeRegex = new RegExp(/([\d.]+)\s?-\s?([\d.]+)/);

@Injectable()
export class IpAddressService {

    public static isValidV4(v4: string): boolean {
        return new Address4(v4).isValid();
    }

    public static isValidV6(v6: string): boolean {
        return new Address6(v6).isValid();
    }

    public static isValidRange(range: string): boolean {
        return ipv4RangeRegex.test(range)
            && IpAddressService.isValidV4(range.split("-")[0].trim())
            && IpAddressService.isValidV4(range.split("-")[1].trim());
    }

    private static CIDR2MASK = [
        0x00000000, 0x80000000, 0xC0000000, 0xE0000000, 0xF0000000, 0xF8000000, 0xFC000000, 0xFE000000, 0xFF000000,
        0xFF800000, 0xFFC00000, 0xFFE00000, 0xFFF00000, 0xFFF80000, 0xFFFC0000, 0xFFFE0000, 0xFFFF0000, 0xFFFF8000,
        0xFFFFC000, 0xFFFFE000, 0xFFFFF000, 0xFFFFF800, 0xFFFFFC00, 0xFFFFFE00, 0xFFFFFF00, 0xFFFFFF80, 0xFFFFFFC0,
        0xFFFFFFE0, 0xFFFFFFF0, 0xFFFFFFF8, 0xFFFFFFFC, 0xFFFFFFFE, 0xFFFFFFFF];

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

    public range2CidrList(startIp: string, endIp: string): string[] {
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

    public formatAsPrefix(range: string): string {
        if (IpAddressService.isValidRange(range)) {
            const match = ipv4RangeRegex.exec(range);
            const prefixes = this.range2CidrList(match[1], match[2]);
            if (prefixes.length === 1) {
                return prefixes[0];
            }
        }
        return range;
    }

    public getIpv4Start(range: IResourceRangeModel): number {
        const match = ipv4RangeRegex.exec(range.string);
        return new Address4(match[1]).bigInteger().intValue();
    }

    public getIpv4End(range: IResourceRangeModel): number {
        const match = ipv4RangeRegex.exec(range.string);
        return new Address4(match[2]).bigInteger().intValue();
    }

    public fromSlashToRange(inetnum: string): string {
        if (inetnum.indexOf(",") > -1) {
            return this.doSlashToRangeMagic(inetnum);
        } else {
            return new Address4(inetnum).startAddress().address + " - " + new Address4(inetnum).endAddress().address;
        }
    }

    private doSlashToRangeMagic(inetnum: string): string {
        let range: any;
        inetnum.split(",/").forEach((str: string) => {
            if (!range) {
                range = new Address4(str);
            } else {
                const end = new Address4(Address4.fromInteger(
                        Number(parseInt(range.endAddress().getBitsBase2(0, 32), 2)) + 1)
                    .startAddress().address + "/" + str);

                range = new Address4(range.startAddress().address + " - " + end.endAddress().address);
            }

        });

        return range.address;
    }

}
