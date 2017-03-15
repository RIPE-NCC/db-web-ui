declare const Address4:any;       // http://ip-address.js.org/#address4
declare const Address6:any;       // http://ip-address.js.org/#address6
declare const BigInteger:any;     // https://github.com/andyperlitch/jsbn

class IpAddressService {

    private ipv4RangeRegex = new RegExp(/([\d.]+) - ([\d.]+)/);

    public getIpv4Start(range: ResourceRange): number {
        const match = this.ipv4RangeRegex.exec(range.string);
        return new Address4(match[1]).bigInteger().intValue();
    }

    public getIpv4End(range: ResourceRange): number {
        const match = this.ipv4RangeRegex.exec(range.string);
        return new Address4(match[2]).bigInteger().intValue();
    }
}

angular
    .module("dbWebApp")
    .service("IpAddressService", IpAddressService);
