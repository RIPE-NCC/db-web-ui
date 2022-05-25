import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IpUsageOfAllResourcesComponent } from '../../../src/app/myresources/ip-usage-of-all-resources.component';
import { IpUsageService } from '../../../src/app/myresources/ip-usage.service';
import { ResourceStatusService } from '../../../src/app/myresources/resource-status.service';

const ipv4Resources = [
    {
        type: 'inetnum',
        resource: '93.190.232.0 - 93.190.239.255',
        status: 'ALLOCATED PA',
        netname: 'DE-1API-20080523',
        usage: {
            total: 2048,
            used: 1024,
            blockSize: 32,
        },
    },
    {
        type: 'inetnum',
        resource: '193.138.180.0 - 193.138.183.255',
        status: 'ASSIGNED PI',
        sponsoredByOther: true,
        netname: 'ONEAPI-NET-4',
        usage: {
            total: 1024,
            used: 0,
            blockSize: 32,
        },
    },
    {
        type: 'inetnum',
        resource: '193.227.117.0 - 193.227.117.255',
        status: 'ASSIGNED PI',
        netname: 'ONEAPI-NET-3',
        usage: {
            total: 256,
            used: 0,
            blockSize: 32,
        },
    },
    {
        type: 'inetnum',
        resource: '194.0.182.0 - 194.0.182.255',
        status: 'ASSIGNED PI',
        netname: 'ONEAPI-NET-2',
        usage: {
            total: 256,
            used: 0,
            blockSize: 32,
        },
    },
    {
        type: 'inetnum',
        resource: '194.50.187.0 - 194.50.187.255',
        status: 'ASSIGNED PI',
        netname: 'ONEAPI-NET-1',
        usage: {
            total: 256,
            used: 0,
            blockSize: 32,
        },
    },
];

const ipv6Resources = [
    {
        resource: '2001:67c:2334::/48',
        status: 'ASSIGNED PI',
        type: 'inet6num',
        sponsoredByOther: true,
        netname: 'DE-1API-DNS2',
        usage: {
            total: 1,
            used: 0,
            blockSize: 48,
        },
    },
    {
        resource: '2001:67c:2338::/48',
        status: 'ASSIGNED PI',
        type: 'inet6num',
        netname: 'DE-1API-DNS3',
        usage: {
            total: 10,
            used: 5,
            blockSize: 48,
        },
    },
    {
        resource: '2a02:18::/32',
        status: 'ALLOCATED-BY-RIR',
        type: 'inet6num',
        netname: 'DE-1API-20080213',
        usage: {
            total: 65536,
            used: 1024,
            blockSize: 48,
        },
    },
];

const asnResources = [
    {
        type: 'aut-num',
        resource: 'AS44569',
        status: 'ASSIGNED',
        sponsoredByOther: true,
        asname: 'ONEAPI',
    },
];

describe('IpUsageOfAllResourcesComponent', () => {
    let component: IpUsageOfAllResourcesComponent;
    let fixture: ComponentFixture<IpUsageOfAllResourcesComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [IpUsageOfAllResourcesComponent],
            providers: [IpUsageService, ResourceStatusService],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IpUsageOfAllResourcesComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should calculate free space for all resources in IPv4 tab', () => {
        component.type = 'inetnum';
        component.resources = ipv4Resources;
        component.sponsored = false;
        component.ngOnChanges({
            resources: new SimpleChange([], true, undefined),
            sponsored: new SimpleChange(undefined, true, undefined),
            type: new SimpleChange('inet6num', true, undefined),
        });
        fixture.detectChanges();
        expect(component.total).toEqual(2048);
        expect(component.used).toEqual(1024);
        expect(component.free).toEqual(1024);
    });

    it('should calculate free space for all resources in IPv6 tab', () => {
        component.type = 'inet6num';
        component.resources = ipv6Resources;
        component.sponsored = false;
        component.ngOnChanges({
            resources: new SimpleChange([], true, undefined),
            sponsored: new SimpleChange(undefined, true, undefined),
            type: new SimpleChange('inet6num', true, undefined),
        });
        fixture.detectChanges();
        expect(component.total).toEqual(65536);
        expect(component.used).toEqual(1024);
        expect(component.free).toEqual(64512);
        expect(component.ipv6CalcTotal).toEqual('64K');
        expect(component.ipv6CalcUsed).toEqual('1K');
        expect(component.ipv6CalcFree).toEqual('63K');
    });
});
