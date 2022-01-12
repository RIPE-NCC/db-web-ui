import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Location} from "@angular/common";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialogModule} from "@angular/material/dialog";
import {IpUsageService} from "../../../src/app/myresources/ip-usage.service";
import {EnvironmentStatusService} from "../../../src/app/shared/environment-status.service";
import {PropertiesService} from "../../../src/app/properties.service";
import {WINDOW_PROVIDERS} from "../../../src/app/core/window.service";
import {OrgDropDownSharedService} from "../../../src/app/dropdown/org-drop-down-shared.service";
import {MenuComponent} from "../../../src/app/menu/menu.component";
import {MenuService} from "../../../src/app/menu/menu.service";

describe("LeftHandMenuComponent", () => {

    let component: MenuComponent;
    let menuService: MenuService;
    let fixture: ComponentFixture<MenuComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                MatDialogModule],
            declarations: [
                MenuComponent,
            ],
            providers: [
                MenuService,
                IpUsageService,
                PropertiesService,
                WINDOW_PROVIDERS,
                OrgDropDownSharedService,
                { provide: Location, useValue: {}}
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuComponent);
        component = fixture.componentInstance;
        menuService = TestBed.inject(MenuService);
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should show all menu items for a user with all roles", () => {
        spyOn(EnvironmentStatusService, "isTrainingEnv").and.returnValue(false);
        spyOn(EnvironmentStatusService, "isTestRcEnv").and.returnValue(false);
        component.orgDropDownSharedService.setSelectedOrg(
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(menuService.roles.admin).toBe(true);
        expect(menuService.roles.general).toBe(true);
        expect(menuService.roles.generalMeeting).toBe(true);
        expect(menuService.roles.ticketing).toBe(true);
        expect(menuService.roles.certification).toBe(true);
        expect(menuService.roles.billing).toBe(true);
        expect(menuService.roles.admin).toBeTruthy();
        expect(menuService.roles.general).toBeTruthy();
        expect(menuService.roles.generalMeeting).toBeTruthy();
        expect(menuService.roles.ticketing).toBeTruthy();
        expect(menuService.roles.certification).toBeTruthy();
        expect(menuService.roles.billing).toBeTruthy();
    });

    it("should show just RIPE Database for Training environment", () => {
        spyOn(EnvironmentStatusService, "isTrainingEnv").and.returnValue(true);
        spyOn(EnvironmentStatusService, "isTestRcEnv").and.returnValue(false);
        component.orgDropDownSharedService.setSelectedOrg(
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(component.menu).not.toContain("My Resources");
        expect(component.menu).not.toContain("Sponsored Resources");
        expect(component.menu).not.toContain("Request Resources");
        expect(component.menu).not.toContain("Request Transfer");
        expect(component.menu).not.toContain("IPv4 Transfer Listing Service");
        expect(component.menu).not.toContain("RPKI Dashboard");
        // RIPE Database
        expect(component.menu).toContain("RIPE Database");
        expect(component.menu).toContain("Query the RIPE Database");
        expect(component.menu).toContain("Full Text Search");
        expect(component.menu).toContain("Syncupdates");
        expect(component.menu).toContain("Create an Object");
    });

    it("should show just Resource/My Resources and RIPE Database for Production Test environment", () => {
        spyOn(EnvironmentStatusService, "isTrainingEnv").and.returnValue(false);
        spyOn(EnvironmentStatusService, "isTestRcEnv").and.returnValue(true);
        component.orgDropDownSharedService.setSelectedOrg(
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(component.menu).toContain("My Resources");
        expect(component.menu).toContain("Sponsored Resources");
        expect(component.menu).not.toContain("Request Resources");
        expect(component.menu).not.toContain("Request Transfer");
        expect(component.menu).not.toContain("IPv4 Transfer Listing Service");
        expect(component.menu).not.toContain("RPKI Dashboard");
        // RIPE Database
        expect(component.menu).toContain("RIPE Database");
        expect(component.menu).toContain("Query the RIPE Database");
        expect(component.menu).toContain("Full Text Search");
        expect(component.menu).toContain("Syncupdates");
        expect(component.menu).toContain("Create an Object");
    });

    it("should show just Resource/My Resources and RIPE Database for Production Test environment", () => {
        spyOn(EnvironmentStatusService, "isTrainingEnv").and.returnValue(false);
        spyOn(EnvironmentStatusService, "isTestRcEnv").and.returnValue(true);
        component.orgDropDownSharedService.setSelectedOrg(
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(component.menu).toContain("My Resources");
        expect(component.menu).toContain("Sponsored Resources");
        expect(component.menu).not.toContain("Request Resources");
        expect(component.menu).not.toContain("Request Transfer");
        expect(component.menu).not.toContain("IPv4 Transfer Listing Service");
        expect(component.menu).not.toContain("RPKI Dashboard");
        // RIPE Database
        expect(component.menu).toContain("RIPE Database");
        expect(component.menu).toContain("Query the RIPE Database");
        expect(component.menu).toContain("Full Text Search");
        expect(component.menu).toContain("Syncupdates");
        expect(component.menu).toContain("Create an Object");
    });

    it("should not set anything if user has no roles", () => {
        component.orgDropDownSharedService.setSelectedOrg(null);
        expect(menuService.roles.admin).toBe(false);
        expect(menuService.roles.general).toBe(false);
        expect(menuService.roles.generalMeeting).toBe(false);
        expect(menuService.roles.ticketing).toBe(false);
        expect(menuService.roles.certification).toBe(false);
        expect(menuService.roles.billing).toBe(false);
        component.orgDropDownSharedService.setSelectedOrg({"roles": [] });
        expect(menuService.roles.admin).toBe(false);
        expect(menuService.roles.general).toBe(false);
        expect(menuService.roles.generalMeeting).toBe(false);
        expect(menuService.roles.ticketing).toBe(false);
        expect(menuService.roles.certification).toBe(false);
        expect(menuService.roles.billing).toBe(false);
    });

    it("should set menu for end user role", () => {
        component.orgDropDownSharedService.setSelectedOrg(
            {
                "orgObjectId": "ORG-OOO2-RIPE",
                "organisationName": "Only One Org",
                "roles": ["certification", "NON-MEMBER"]
            }
        );
        expect(menuService.roles.admin).toBe(false);
        expect(menuService.roles.general).toBe(false);
        expect(menuService.roles.generalMeeting).toBe(false);
        expect(menuService.roles.ticketing).toBe(false);
        expect(menuService.roles.certification).toBe(true);
        expect(menuService.roles.billing).toBe(false);
    });

    it("should set menu for user role without lir or organisation", () => {
        component.orgDropDownSharedService.setSelectedOrg(
            {}
        );
        expect(menuService.roles.admin).toBe(false);
        expect(menuService.roles.general).toBe(false);
        expect(menuService.roles.generalMeeting).toBe(false);
        expect(menuService.roles.ticketing).toBe(false);
        expect(menuService.roles.certification).toBe(false);
        expect(menuService.roles.billing).toBe(false);
    });
});
