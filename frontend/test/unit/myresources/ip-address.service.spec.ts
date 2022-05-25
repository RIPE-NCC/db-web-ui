import { TestBed } from '@angular/core/testing';
import { AppModule } from '../../../src/app/app.module';
import { IpAddressService } from '../../../src/app/myresources/ip-address.service';
import { MyResourcesModule } from '../../../src/app/myresources/my-resources.module';

describe('IpAddressService', () => {
    let ipAddressService: IpAddressService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MyResourcesModule, AppModule],
            providers: [IpAddressService],
        });
        ipAddressService = TestBed.inject(IpAddressService);
    });

    it('should return true for ipv4 addres in range or CIDR', () => {
        expect(IpAddressService.isValidIpv4('10.0.128.0 - 10.0.131.255')).toBeTruthy();
        expect(IpAddressService.isValidIpv4('10.0.128.0-10.0.131.255')).toBeTruthy();
        expect(IpAddressService.isValidIpv4('10.0.128.0/22')).toBeTruthy();
    });

    it('IPv4 Start Address', () => {
        expect(
            ipAddressService.getIpv4Start({
                string: '10.0.128.0 - 10.0.131.255',
                slash: '10.0.128.0/22',
            }),
        ).toEqual(167804928);
    });

    it('IPv4 End Address', () => {
        expect(
            ipAddressService.getIpv4End({
                string: '10.0.128.0 - 10.0.131.255',
                slash: '10.0.128.0/22',
            }),
        ).toEqual(167805951);
    });

    it('should convert ipv4 address range to list of CIDR', () => {
        expect(ipAddressService.range2CidrList('10.0.128.0', '10.0.131.255')).toEqual(['10.0.128.0/22']);
    });
});
