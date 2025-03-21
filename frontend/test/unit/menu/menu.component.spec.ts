import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { OrgDropDownSharedService } from '../../../src/app/dropdown/org-drop-down-shared.service';
import { MenuComponent } from '../../../src/app/menu/menu.component';
import { MenuService } from '../../../src/app/menu/menu.service';
import { IpUsageService } from '../../../src/app/myresources/ip-usage.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';

describe('LeftHandMenuComponent', () => {
    let component: MenuComponent;
    let menuService: MenuService;
    let fixture: ComponentFixture<MenuComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
            declarations: [MenuComponent],
            providers: [
                MenuService,
                IpUsageService,
                PropertiesService,
                OrgDropDownSharedService,
                UserInfoService,
                { provide: Location, useValue: { path: () => '' } },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuComponent);
        component = fixture.componentInstance;
        menuService = TestBed.inject(MenuService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show all menu items for a user with all roles', () => {
        spyOn(component.properties, 'isTrainingEnv').and.returnValue(false);
        spyOn(component.properties, 'isTestEnv').and.returnValue(false);
        spyOn(component.properties, 'isRcEnv').and.returnValue(false);
        component.orgDropDownSharedService.setSelectedOrg({
            membershipId: 7347,
            regId: 'zz.example',
            orgObjectId: 'ORG-TEST19-RIPE',
            organisationName: 'Internet Provider Test',
            roles: ['admin', 'general', 'generalMeeting', 'resources', 'certification', 'ticketing', 'billing', 'LIR'],
        });
        expect(component.menu).toContain('My LIR');
        expect(component.menu).toContain('Requests');
        expect(component.menu).toContain('Resources');
        expect(component.menu).toContain('My Resources');
        expect(component.menu).toContain('Sponsored Resources');
        expect(component.menu).toContain('LOCAL Database');
        expect(component.menu).toContain('Query Database');
        expect(component.menu).toContain('Full Text Search');
        expect(component.menu).toContain('Syncupdates');
        expect(component.menu).toContain('Create an Object');
        expect(component.menu).toContain('RPKI');
    });

    it('should show just RIPE Database for Training environment', () => {
        spyOn(component.properties, 'isTrainingEnv').and.returnValue(true);
        spyOn(component.properties, 'isTestEnv').and.returnValue(false);
        spyOn(component.properties, 'isRcEnv').and.returnValue(false);
        component.orgDropDownSharedService.setSelectedOrg({
            membershipId: 7347,
            regId: 'zz.example',
            orgObjectId: 'ORG-TEST19-RIPE',
            organisationName: 'Internet Provider Test',
            roles: ['admin', 'general', 'generalMeeting', 'resources', 'certification', 'ticketing', 'billing', 'LIR'],
        });
        expect(component.menu).not.toContain('My Resources');
        expect(component.menu).not.toContain('Sponsored Resources');
        expect(component.menu).not.toContain('Request Resources');
        expect(component.menu).not.toContain('Request Transfer');
        expect(component.menu).not.toContain('IPv4 Transfer Listing Service');
        expect(component.menu).not.toContain('RPKI Dashboard');
        // RIPE Database
        expect(component.menu).toContain('Training Database');
        expect(component.menu).toContain('Query Database');
        expect(component.menu).toContain('Full Text Search');
        expect(component.menu).toContain('Syncupdates');
        expect(component.menu).toContain('Create an Object');
    });

    it('should show just Resource/My Resources and RIPE Database for Production Test environment', () => {
        spyOn(component.properties, 'isTrainingEnv').and.returnValue(false);
        spyOn(component.properties, 'isTestEnv').and.returnValue(true);
        spyOn(component.properties, 'isRcEnv').and.returnValue(true);
        component.orgDropDownSharedService.setSelectedOrg({
            membershipId: 7347,
            regId: 'zz.example',
            orgObjectId: 'ORG-TEST19-RIPE',
            organisationName: 'Internet Provider Test',
            roles: ['admin', 'general', 'generalMeeting', 'resources', 'certification', 'ticketing', 'billing', 'LIR'],
        });
        expect(component.menu).toContain('My Resources');
        expect(component.menu).toContain('Sponsored Resources');
        expect(component.menu).not.toContain('Request Resources');
        expect(component.menu).not.toContain('Request Transfer');
        expect(component.menu).not.toContain('IPv4 Transfer Listing Service');
        expect(component.menu).not.toContain('RPKI Dashboard');
        // RIPE Database
        expect(component.menu).toContain('LOCAL Database');
        expect(component.menu).toContain('Query Database');
        expect(component.menu).toContain('Full Text Search');
        expect(component.menu).toContain('Syncupdates');
        expect(component.menu).toContain('Create an Object');
    });

    it('should show just Resource/My Resources and RIPE Database for Production Test environment', () => {
        spyOn(component.properties, 'isTrainingEnv').and.returnValue(false);
        spyOn(component.properties, 'isTestEnv').and.returnValue(true);
        spyOn(component.properties, 'isRcEnv').and.returnValue(true);
        component.orgDropDownSharedService.setSelectedOrg({
            membershipId: 7347,
            regId: 'zz.example',
            orgObjectId: 'ORG-TEST19-RIPE',
            organisationName: 'Internet Provider Test',
            roles: ['admin', 'general', 'generalMeeting', 'resources', 'certification', 'ticketing', 'billing', 'LIR'],
        });
        expect(component.menu).toContain('My Resources');
        expect(component.menu).toContain('Sponsored Resources');
        expect(component.menu).not.toContain('Request Resources');
        expect(component.menu).not.toContain('Request Transfer');
        expect(component.menu).not.toContain('IPv4 Transfer Listing Service');
        expect(component.menu).not.toContain('RPKI Dashboard');
        // RIPE Database
        expect(component.menu).toContain('LOCAL Database');
        expect(component.menu).toContain('Query Database');
        expect(component.menu).toContain('Full Text Search');
        expect(component.menu).toContain('Syncupdates');
        expect(component.menu).toContain('Create an Object');
    });

    it('should not set anything if user has no roles', () => {
        component.orgDropDownSharedService.setSelectedOrg(null);
        fixture.detectChanges();
        expect(component.menu).not.toContain('My LIR');
        expect(component.menu).not.toContain('Requests');
        // when user is not logged in or doesn't have organisations, show Resources with description 'My Resources, Sponsored Resources'
        expect(component.menu).toContain('Resources');
        expect(component.menu).toContain('My Resources');
        expect(component.menu).not.toContain('"id":"sponsored"'); // Sponsored Resources menu item
        expect(component.menu).toContain('LOCAL Database');
        expect(component.menu).toContain('Query Database');
        expect(component.menu).toContain('Full Text Search');
        expect(component.menu).toContain('Syncupdates');
        expect(component.menu).toContain('Create an Object');
        expect(component.menu).not.toContain('RPKI');
        component.orgDropDownSharedService.setSelectedOrg({ roles: [] });
        fixture.detectChanges();
        expect(component.menu).not.toContain('My LIR');
        expect(component.menu).not.toContain('Requests');
        expect(component.menu).toContain('Resources');
        expect(component.menu).toContain('My Resources');
        expect(component.menu).not.toContain('"id":"sponsored"'); // Sponsored Resources menu item
        expect(component.menu).toContain('LOCAL Database');
        expect(component.menu).toContain('Query Database');
        expect(component.menu).toContain('Full Text Search');
        expect(component.menu).toContain('Syncupdates');
        expect(component.menu).toContain('Create an Object');
        expect(component.menu).not.toContain('RPKI');
    });

    it('should set menu for end user role', () => {
        component.orgDropDownSharedService.setSelectedOrg({
            orgObjectId: 'ORG-OOO2-RIPE',
            organisationName: 'Only One Org',
            roles: ['certification', 'NON-MEMBER'],
        });
        expect(component.menu).not.toContain('My LIR');
        expect(component.menu).not.toContain('Requests');
        expect(component.menu).toContain('Resources');
        expect(component.menu).toContain('My Resources');
        expect(component.menu).not.toContain('Sponsored Resources');
        expect(component.menu).toContain('LOCAL Database');
        expect(component.menu).toContain('Query Database');
        expect(component.menu).toContain('Full Text Search');
        expect(component.menu).toContain('Syncupdates');
        expect(component.menu).toContain('Create an Object');
        expect(component.menu).toContain('RPKI');
    });

    it('should not show Sponsored Resources for End Users', () => {
        component.orgDropDownSharedService.setSelectedOrg({
            orgObjectId: 'ORG-OOO2-RIPE',
            organisationName: 'Only One Org',
            roles: ['certification', 'NON-MEMBER'],
        });
        expect(component.menu).not.toContain('"id":"sponsored"');
        expect(component.menu).not.toContain('"subtitle":"My Resources, Sponsored Resources"');
        expect(component.menu).toContain('"subtitle":"My Resources"');
    });

    it('should show Sponsored Resources for Members', () => {
        component.orgDropDownSharedService.setSelectedOrg({
            membershipId: 7347,
            regId: 'zz.example',
            orgObjectId: 'ORG-TEST19-RIPE',
            organisationName: 'Internet Provider Test',
            roles: ['admin', 'general', 'generalMeeting', 'resources', 'certification', 'ticketing', 'billing', 'LIR'],
        });
        expect(component.menu).toContain('"id":"sponsored"');
        expect(component.menu).toContain('"subtitle":"My Resources, Sponsored Resources"');
    });

    it('should set menu for user role without lir or organisation', () => {
        component.orgDropDownSharedService.setSelectedOrg({});
        fixture.detectChanges();
        expect(component.menu).not.toContain('My LIR');
        expect(component.menu).not.toContain('Requests');
        expect(component.menu).toContain('Resources');
        expect(component.menu).toContain('My Resources');
        expect(component.menu).not.toContain('"id":"sponsored"'); // Sponsored Resources menu item
        expect(component.menu).toContain('LOCAL Database');
        expect(component.menu).toContain('Query Database');
        expect(component.menu).toContain('Full Text Search');
        expect(component.menu).toContain('Syncupdates');
        expect(component.menu).toContain('Create an Object');
        expect(component.menu).not.toContain('RPKI');
    });
});
