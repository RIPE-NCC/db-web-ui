import {TestBed} from "@angular/core/testing";
import {IpAddressService} from "../../../app/ng/myresources/ip-address.service";
import {MyResourcesModule} from "../../../app/ng/myresources/my-resources.module";

describe("IpAddressService", () => {

    let ipAddressService: IpAddressService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MyResourcesModule],
            providers: [
                IpAddressService
            ],
    });
        ipAddressService = TestBed.get(IpAddressService);
    });

    it("IPv4 Start Address", () => {
        expect(ipAddressService.getIpv4Start({
            string: "10.0.128.0 - 10.0.131.255",
            slash: "10.0.128.0/22"
        })).toEqual(167804928);
    });

    it("IPv4 End Address", () => {
        expect(ipAddressService.getIpv4End({
            string: "10.0.128.0 - 10.0.131.255",
            slash: "10.0.128.0/22"
        })).toEqual(167805951);
    });

    it("should convert ipv4 address range to list of CIDR", () => {
        expect(ipAddressService.range2CidrList("10.0.128.0", "10.0.131.255")).toEqual(["10.0.128.0/22"]);
    });
});
