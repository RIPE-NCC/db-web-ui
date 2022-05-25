import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IpAddressService } from '../../../src/app/myresources/ip-address.service';
import { ResourceItemComponent } from '../../../src/app/myresources/resource-item.component';
import { ResourceStatusService } from '../../../src/app/myresources/resource-status.service';
import { FlagComponent } from '../../../src/app/shared/flag/flag.component';
import { SharedModule } from '../../../src/app/shared/shared.module';

describe('ResourceItemComponent', () => {
    let component: ResourceItemComponent;
    let fixture: ComponentFixture<ResourceItemComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, RouterTestingModule],
            declarations: [ResourceItemComponent, FlagComponent],
            providers: [IpAddressService, ResourceStatusService],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ResourceItemComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show IRR and rDNS flag', () => {
        component.item = {
            type: 'inetnum',
            resource: '193.41.0.0 - 193.41.1.255',
            status: 'ASSIGNED PI',
            iRR: true,
            rDNS: true,
            netname: 'BBC-DMS-RDG-NET',
            usage: {
                total: 512,
                used: 0,
                blockSize: 32,
            },
        };
        fixture.detectChanges();
        expect(component.flags[2].colour).toEqual('green');
        expect(component.flags[2].text).toEqual('IRR');
        expect(component.flags[2].tooltip).toEqual('Related route(6) object(s) found');
        expect(component.flags[3].colour).toEqual('green');
        expect(component.flags[3].text).toEqual('rDNS');
        expect(component.flags[3].tooltip).toEqual('Related domain object(s) found');
    });
});
