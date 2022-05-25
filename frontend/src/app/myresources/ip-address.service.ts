import { Injectable } from '@angular/core';
import { Address4, Address6 } from 'ip-address';
import { IResourceRangeModel } from './resource-type.model';

const ipv4RangeRegex = new RegExp(/([\d.]+)\s?-\s?([\d.]+)/);

@Injectable()
export class IpAddressService {
    public static isValidIpv4(searchTerm: string): boolean {
        return IpAddressService.isValidV4(searchTerm) || IpAddressService.isValidRange(searchTerm);
    }

    public static isValidV4(v4: string): boolean {
        return new Address4(v4).isValid();
    }

    public static isValidV6(v6: string): boolean {
        return new Address6(v6).isValid();
    }

    public static isValidRange(range: string): boolean {
        return ipv4RangeRegex.test(range) && IpAddressService.isValidV4(range.split('-')[0].trim()) && IpAddressService.isValidV4(range.split('-')[1].trim());
    }

    private static CIDR2MASK = [
        0x00000000, 0x80000000, 0xc0000000, 0xe0000000, 0xf0000000, 0xf8000000, 0xfc000000, 0xfe000000, 0xff000000, 0xff800000, 0xffc00000, 0xffe00000,
        0xfff00000, 0xfff80000, 0xfffc0000, 0xfffe0000, 0xffff0000, 0xffff8000, 0xffffc000, 0xffffe000, 0xfffff000, 0xfffff800, 0xfffffc00, 0xfffffe00,
        0xffffff00, 0xffffff80, 0xffffffc0, 0xffffffe0, 0xfffffff0, 0xfffffff8, 0xfffffffc, 0xfffffffe, 0xffffffff,
    ];

    private static ipToLong(strIP: string): number {
        const parts = strIP.split('.');
        return (parseInt(parts[0], 10) << 24) + (parseInt(parts[1], 10) << 16) + (parseInt(parts[2], 10) << 8) + parseInt(parts[3], 10);
    }

    private static longToIP(ip: number): string {
        return ((ip >> 24) & 255) + '.' + ((ip >> 16) & 255) + '.' + ((ip >> 8) & 255) + '.' + (ip & 255);
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
            const maxdiff = 32 - Math.floor(diff);
            if (maxsize < maxdiff) {
                maxsize = maxdiff;
            }
            const ip = IpAddressService.longToIP(start);
            cidrs.push(ip + '/' + maxsize);
            start += Math.pow(2, 32 - maxsize);
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
        if (inetnum.indexOf(',') > -1) {
            return this.doSlashToRangeMagic(inetnum);
        } else {
            return new Address4(inetnum).startAddress().address + ' - ' + new Address4(inetnum).endAddress().address;
        }
    }

    private doSlashToRangeMagic(inetnum: string): string {
        let range: any;
        inetnum.split(',/').forEach((str: string) => {
            if (!range) {
                range = new Address4(str);
            } else {
                const end = new Address4(
                    Address4.fromInteger(Number(parseInt(range.endAddress().getBitsBase2(0, 32), 2)) + 1).startAddress().address + '/' + str,
                );

                range = new Address4(range.startAddress().address + ' - ' + end.endAddress().address);
            }
        });

        return range.address;
    }
}
