import { Address4, Address6 } from 'ip-address';
import { IpAddressService } from '../myresources/ip-address.service';

export class PrefixServiceUtils {
    /**
     * Validates that a prefix is a valid ipV4 or ipV6 prefix.
     *
     * @param str
     * @returns {boolean}
     */
    public static isValidPrefix(str: string): boolean {
        // here we have a string with a subnet mask, but dno if it's v4 or v6 yet, so check...
        return PrefixServiceUtils.isValidIpv4Prefix(str) || PrefixServiceUtils.isValidIpv6Prefix(str);
    }

    // Validation rules to be implemented (after a chat with Tim 3 Oct 2016
    // * For v4, accept 4 octets (3 is widely accepted shorthand but not supported)
    // * Ensure provided address bit are not masked (i.e. 129.168.0.1/24 is not valid cz ".1" is not covered by mask)
    public static isValidIpv4Prefix(str: string): boolean {
        if (IpAddressService.isValidIpv4(str)) {
            str = IpAddressService.rangeToSlash(str);
            return this.isValidIp4Cidr(new Address4(str));
        }
        return false;
    }

    public static isValidIpv6Prefix(str: string) {
        if (IpAddressService.isValidV6(str)) {
            return this.isValidIp6Cidr(new Address6(str));
        }
        return false;
    }

    private static isValidIp4Cidr(address: Address4) {
        // check the subnet mask was provided
        if (!address.parsedSubnet) {
            return false;
        }

        // TODO - fix the subnetMask min and max values
        // check the subnet mask is in range
        if (address.subnetMask < 16 || address.subnetMask > 24) {
            return false;
        }

        // check that subnet mask covers all address bits
        const bits = address.getBitsBase2(undefined, undefined);
        const last1 = bits.lastIndexOf('1');

        return last1 < address.subnetMask;
    }

    private static isValidIp6Cidr(address: Address6) {
        // check the subnet mask is in range
        if (!address.parsedSubnet) {
            return false;
        }

        // @ts-ignore TODO ???
        if (address.parsedSubnet >= 127) {
            return false;
        }

        // check that subnet mask covers all address bits
        const bits = address.getBitsBase2(undefined, undefined);
        const last1 = bits.lastIndexOf('1');

        return last1 < address.subnetMask;
    }

    public static isExactMatch(prefixAddress: Address4 | Address6, whoisResourcesPrimaryKey: string): boolean {
        if (prefixAddress instanceof Address4) {
            const prefixInRangeNotation = prefixAddress.startAddress().address + ' - ' + prefixAddress.endAddress().address;

            return prefixInRangeNotation === whoisResourcesPrimaryKey;
        } else {
            const resourceAddress = IpAddressService.getCidrAddress(whoisResourcesPrimaryKey);

            return (
                resourceAddress.endAddress().address === prefixAddress.endAddress().address &&
                resourceAddress.startAddress().address === prefixAddress.startAddress().address
            );
        }
    }

    // creating domain with prefix ipv4/24 or ipv6/32 will create more reverse zones
    // For example, an allocation such as 10.155.16.0/22 will result in four reverse zones of /24
    // For example, an allocation such as 2001:db8::/29 will result in eight reverse zones of /32
    public static isSizeOfDomainBlock(address: Address4 | Address6) {
        if (address instanceof Address4) {
            return address.subnetMask === 24;
        } else {
            return address.subnetMask === 32;
        }
    }

    /**
     * Calculate the list of rDNS names for a prefix.
     *
     * @param prefix
     * @returns {*} Array of strings which are the rDNS names for the prefix
     */
    public static getReverseDnsZones(prefix: string) {
        let i;
        let zoneName;
        const zones = [];

        if (prefix && this.isValidPrefix(prefix)) {
            prefix = IpAddressService.rangeToSlash(prefix);
            if (Address4.isValid(prefix)) {
                const ipv4 = new Address4(prefix);
                // It used to find the array position that starts with 0. That's why -1.
                const fixedOctet = Math.ceil(ipv4.subnetMask / 8) - 1;

                const startOctet = parseInt(ipv4.startAddress().address.split('.')[fixedOctet]);
                const endOctet = parseInt(ipv4.endAddress().address.split('.')[fixedOctet]);
                const reverseBNet = ipv4.addressMinusSuffix.split('.').slice(0, fixedOctet).reverse().join('.');

                for (i = startOctet; i <= endOctet; i++) {
                    zoneName = i + '.' + reverseBNet + '.in-addr.arpa';
                    zones.push({ name: 'reverse-zone', value: zoneName });
                }
            } else if (Address6.isValid(prefix)) {
                const ipv6 = new Address6(prefix);
                if (ipv6.isCorrect()) {
                    const startZone = ipv6.startAddress().reverseForm().split('.');
                    const endZone = ipv6.endAddress().reverseForm().split('.');
                    while (startZone[0] === '0' && endZone[0] === 'f') {
                        startZone.splice(0, 1);
                        endZone.splice(0, 1);
                    }
                    const commonNibbles = startZone.slice(1).join('.');
                    const startNibble = parseInt(startZone[0], 16);
                    const endNibble = parseInt(endZone[0], 16);
                    for (i = startNibble; i <= endNibble; i++) {
                        zoneName = i.toString(16) + '.' + commonNibbles;
                        zones.push({ name: 'reverse-zone', value: zoneName });
                    }
                }
            }
        }
        return zones;
    }
}
