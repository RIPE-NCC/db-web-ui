import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Location} from "@angular/common";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {IpUsageService} from "../../../src/app/myresources/ip-usage.service";
import {LeftHandMenuComponent} from "../../../src/app/menu/left-hand-menu.component";
import {EnvironmentStatusService} from "../../../src/app/shared/environment-status.service";
import {PropertiesService} from "../../../src/app/properties.service";
import {WINDOW_PROVIDERS} from "../../../src/app/core/window.service";
import {OrgDropDownSharedService} from "../../../src/app/dropdown/org-drop-down-shared.service";

describe("LeftHandMenuComponent", () => {

    let component: LeftHandMenuComponent;
    let fixture: ComponentFixture<LeftHandMenuComponent>;
    let environmentStatusService: any;

    environmentStatusService = jasmine.createSpyObj("EnvironmentStatusService", ["isTrainingEnv", "isTestRcEnv"]);
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule],
            declarations: [
                LeftHandMenuComponent,
            ],
            providers: [
                IpUsageService,
                PropertiesService,
                WINDOW_PROVIDERS,
                OrgDropDownSharedService,
                { provide: EnvironmentStatusService, useValue: environmentStatusService},
                { provide: Location, useValue: {}}
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LeftHandMenuComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should show all menu items for a user with all roles", () => {
        environmentStatusService.isTrainingEnv.and.returnValue(false);
        environmentStatusService.isTestRcEnv.and.returnValue(false);
        component.orgDropDownSharedService.setSelectedOrg(
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(component.show.admin).toBe(true);
        expect(component.show.general).toBe(true);
        expect(component.show.generalMeeting).toBe(true);
        expect(component.show.ticketing).toBe(true);
        expect(component.show.certification).toBe(true);
        expect(component.show.billing).toBe(true);
        expect(component.show.testRcEnv).toBe(false);
        expect(component.show.trainingEnv).toBe(false);
    });

    it("should show just Resource/My Resources and RIPE Database for Training environment", () => {
        environmentStatusService.isTrainingEnv.and.returnValue(true);
        environmentStatusService.isTestRcEnv.and.returnValue(false);
        component.orgDropDownSharedService.setSelectedOrg(
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(component.show.testRcEnv).toBe(false);
        expect(component.show.trainingEnv).toBe(true);
    });

    it("should show just Resource/My Resources and RIPE Database for Production Test environment", () => {
        environmentStatusService.isTrainingEnv.and.returnValue(false);
        environmentStatusService.isTestRcEnv.and.returnValue(true);
        component.orgDropDownSharedService.setSelectedOrg(
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(component.show.testRcEnv).toBe(true);
        expect(component.show.trainingEnv).toBe(false);
    });

    it("should show just Resource/My Resources and RIPE Database for Production Test environment", () => {
        environmentStatusService.isTrainingEnv.and.returnValue(false);
        environmentStatusService.isTestRcEnv.and.returnValue(true);
        component.orgDropDownSharedService.setSelectedOrg(
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(component.show.testRcEnv).toBe(true);
        expect(component.show.trainingEnv).toBe(false);
    });

    it("should not set anything if user has no roles", () => {
        component.orgDropDownSharedService.setSelectedOrg(null);
        expect(component.show.admin).toBe(false);
        expect(component.show.general).toBe(false);
        expect(component.show.generalMeeting).toBe(false);
        expect(component.show.ticketing).toBe(false);
        expect(component.show.certification).toBe(false);
        expect(component.show.billing).toBe(false);
        component.orgDropDownSharedService.setSelectedOrg({"roles": [] });
        expect(component.show.admin).toBe(false);
        expect(component.show.general).toBe(false);
        expect(component.show.generalMeeting).toBe(false);
        expect(component.show.ticketing).toBe(false);
        expect(component.show.certification).toBe(false);
        expect(component.show.billing).toBe(false);
    });

    it("should set menu for end user role", () => {
        component.orgDropDownSharedService.setSelectedOrg(
            {
                "orgObjectId": "ORG-OOO2-RIPE",
                "organisationName": "Only One Org",
                "roles": ["certification", "NON-MEMBER"]
            }
        );
        expect(component.show.admin).toBe(false);
        expect(component.show.general).toBe(false);
        expect(component.show.generalMeeting).toBe(false);
        expect(component.show.ticketing).toBe(false);
        expect(component.show.certification).toBe(true);
        expect(component.show.billing).toBe(false);
    });

    it("should set menu for user role without lir or organisation", () => {
        component.orgDropDownSharedService.setSelectedOrg(
            {}
        );
        expect(component.show.admin).toBe(false);
        expect(component.show.general).toBe(false);
        expect(component.show.generalMeeting).toBe(false);
        expect(component.show.ticketing).toBe(false);
        expect(component.show.certification).toBe(false);
        expect(component.show.billing).toBe(false);
    });
});
