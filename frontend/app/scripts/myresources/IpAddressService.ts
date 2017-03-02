declare var Address4:any;       // http://ip-address.js.org/#address4
declare var Address6:any;       // http://ip-address.js.org/#address6
declare var BigInteger:any;     // https://github.com/andyperlitch/jsbn

class IpAddressService {

    private ipv4RangeRegex = new RegExp(/([\d\.]+) - ([\d\.]+)/);

    public getIpv4Start(range: IPv4ResourceRange): number {
        let match = this.ipv4RangeRegex.exec(range.string);
        return new Address4(match[1]).bigInteger().intValue();
    }

    public getIpv4End(range: IPv4ResourceRange): number {
        let match = this.ipv4RangeRegex.exec(range.string);
        return new Address4(match[2]).bigInteger().intValue();
    }
}

angular
    .module("dbWebApp")
    .service("IpAddressService", IpAddressService);
