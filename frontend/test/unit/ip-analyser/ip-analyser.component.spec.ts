import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { IUserInfoOrganisation } from 'src/app/dropdown/org-data-type.model';
import { OrgDropDownSharedService } from 'src/app/dropdown/org-drop-down-shared.service';
import { IpAnalyserComponent } from 'src/app/ip-analyser/ip-analyser.component';
import { IpAnalyserService } from 'src/app/ip-analyser/ip-analyser.service';
import { ApikeysDropdownComponent } from 'src/app/myresources/apikeys-dropdown/apikeys-dropdown.component';
import { PropertiesService } from 'src/app/properties.service';
import { AlertsService } from 'src/app/shared/alert/alerts.service';

describe('IpAnalyserComponent', () => {
    let component: IpAnalyserComponent;
    let fixture: ComponentFixture<IpAnalyserComponent>;

    let mockOrgService: any;
    let mockIpService: any;
    let mockAlertService: any;
    let mockProperties: any;
    let selectedOrgSubject: Subject<IUserInfoOrganisation>;

    const mockOrg: IUserInfoOrganisation = {
        orgObjectId: '123',
        roles: ['ADMIN'],
    } as IUserInfoOrganisation;

    const mockMemberOrg = {
        orgObjectId: '456',
        roles: ['ADMIN'],
        membershipId: 456,
    };

    beforeEach(async () => {
        selectedOrgSubject = new Subject();

        mockOrgService = {
            selectedOrgChanged$: selectedOrgSubject.asObservable(),
            getSelectedOrg: vi.fn().mockReturnValue(mockMemberOrg),
        };

        mockIpService = {
            getIpv4Analysis: vi.fn().mockReturnValue(of('ipv4-data')),
            getIpv6Analysis: vi.fn().mockReturnValue(of('ipv6-data')),
        };

        mockAlertService = {
            clearAlertMessages: vi.fn(),
            addGlobalError: vi.fn(),
        };

        mockProperties = {
            LOGIN_URL: 'http://sso.test/login',
        };

        await TestBed.configureTestingModule({
            imports: [IpAnalyserComponent, ApikeysDropdownComponent],
            providers: [
                { provide: PropertiesService, useValue: mockProperties },
                { provide: OrgDropDownSharedService, useValue: mockOrgService },
                { provide: IpAnalyserService, useValue: mockIpService },
                { provide: AlertsService, useValue: mockAlertService },
                provideRouter([]),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(IpAnalyserComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load IP analysis on init', () => {
        fixture.detectChanges();

        expect(mockOrgService.getSelectedOrg).toHaveBeenCalled();
        expect(mockIpService.getIpv4Analysis).toHaveBeenCalledWith('456');
        expect(mockIpService.getIpv6Analysis).toHaveBeenCalledWith('456');

        expect(component.ipv4Analysis).toBe('ipv4-data');
        expect(component.ipv6Analysis).toBe('ipv6-data');
        expect(component.loading).toBe(false);
    });

    it('should set ipv4 and ipv6 on successful response', () => {
        fixture.detectChanges();

        expect(component.ipv4Analysis).toEqual('ipv4-data');
        expect(component.ipv6Analysis).toEqual('ipv6-data');
        expect(component.loading).toBe(false);
    });

    it('should handle error response correctly', () => {
        const errorResponse = {
            error: JSON.stringify({
                errormessages: {
                    errormessage: [{ text: 'API failure' }],
                },
            }),
        };

        mockIpService.getIpv4Analysis.mockReturnValue(throwError(() => errorResponse));
        mockIpService.getIpv6Analysis.mockReturnValue(of('ipv6-data'));

        fixture.detectChanges();

        expect(component.loading).toBe(false);
        expect(mockAlertService.addGlobalError).toHaveBeenCalledWith('API failure');
    });

    it('should react to selectedOrgChanged$', () => {
        fixture.detectChanges();

        //@ts-ignore
        selectedOrgSubject.next(mockMemberOrg);

        expect(mockIpService.getIpv4Analysis).toHaveBeenCalledWith('456');
        expect(mockIpService.getIpv6Analysis).toHaveBeenCalledWith('456');
    });

    it('should NOT call API if selected org is not member', () => {
        fixture.detectChanges();

        selectedOrgSubject.next(mockOrg);

        expect(mockIpService.getIpv4Analysis).toHaveBeenCalledTimes(1);
    });

    it('should return true if membershipId exists', () => {
        (component as any).organisation = {
            membershipId: 1234,
        };

        expect(component.isMemberOrg()).toBe(true);
    });

    it('should return false if membershipId does not exist', () => {
        (component as any).organisation = mockOrg;

        expect(component.isMemberOrg()).toBe(false);
    });

    it('should clear alerts on destroy', () => {
        fixture.detectChanges();

        component.ngOnDestroy();

        expect(mockAlertService.clearAlertMessages).toHaveBeenCalled();
    });
});
