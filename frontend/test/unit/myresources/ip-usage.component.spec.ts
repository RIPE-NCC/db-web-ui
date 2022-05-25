import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IpUsageComponent } from '../../../src/app/myresources/ip-usage.component';
import { IpUsageService } from '../../../src/app/myresources/ip-usage.service';

describe('IpUsageComponent', () => {
    let component: IpUsageComponent;
    let fixture: ComponentFixture<IpUsageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [IpUsageComponent],
            providers: [IpUsageService],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IpUsageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should calculate free space and percentages for inetnum', () => {
        component.type = 'inetnum';
        component.usage = { total: 8192, used: 4107, blockSize: 32 };
        component.ngOnChanges({
            type: new SimpleChange('inetnum', true, undefined),
            usage: new SimpleChange('{total: 8192, used: 4107, blockSize: 32}', true, undefined),
        });
        fixture.detectChanges();
        expect(component.usage.free).toEqual(4085);
        expect(component.percentageUsed).toEqual(50);
        expect(component.percentageFree).toEqual(50);
    });

    it('should calculate free space and percentages for inet6num', () => {
        component.type = 'inet6num';
        component.usage = { total: 65536, used: 523, blockSize: 48 };
        component.ngOnChanges({
            type: new SimpleChange('inet6num', true, undefined),
            usage: new SimpleChange('{total: 65536, used: 523, blockSize: 48}', true, undefined),
        });
        fixture.detectChanges();
        expect(component.usage.free).toEqual(65013);
        expect(component.percentageUsed).toEqual(1);
        expect(component.percentageFree).toEqual(99);
        expect(component.ipv6CalcTotal).toEqual('64K');
        expect(component.ipv6CalcUsed).toEqual('523');
        expect(component.ipv6CalcFree).toEqual('63K');
    });
});
