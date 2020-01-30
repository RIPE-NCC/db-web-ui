import {ComponentFixture, TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";
import {of, throwError} from "rxjs";
import {EmailLinkService} from "../../../src/app/fmp/email-link.services";
import {AlertsService} from "../../../src/app/shared/alert/alerts.service";
import {ConfirmMaintainerComponent} from "../../../src/app/fmp/confirm-maintainer.component";
import {AlertsComponent} from "../../../src/app/shared/alert/alerts.component";
import {WhoisResourcesService} from "../../../src/app/shared/whois-resources.service";
import {WhoisMetaService} from "../../../src/app/shared/whois-meta.service";

describe("ConfirmMaintainerComponent", () => {
    let component: ConfirmMaintainerComponent;
    let fixture: ComponentFixture<ConfirmMaintainerComponent>;
    let mockEmailLinkService: any;

    beforeEach(() => {
        mockEmailLinkService = jasmine.createSpyObj("EmailLinkService", ["get", "update"]);
        TestBed.configureTestingModule({
            declarations: [
                ConfirmMaintainerComponent,
                AlertsComponent
            ],
            providers: [
                AlertsService,
                WhoisMetaService,
                WhoisResourcesService,
                { provide: EmailLinkService, useValue: mockEmailLinkService},
                { provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}}},
                { provide: Router, useValue: {navigate:() => {}}},
            ]
        });
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmMaintainerComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should set maintainer and email on valid hash", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParams = {
            hash: "validhash",
            get: (hash: string) => (""),
            has:(hash: string) => (true)
        };
        const response = {
                        mntner: "maintainer",
                        email: "a@b.c",
                        username: "user",
                        expiredDate: 20280808,
                        currentUserAlreadyAssociated: false};
        mockEmailLinkService.get.and.returnValue(of(response));
        const alertsComponent = fixture.debugElement.queryAll(By.directive(AlertsComponent));
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.key).toBe("maintainer");
        expect(component.email).toBe("a@b.c");
        expect(component.user).toBe("user");

        expect(alertsComponent.length).toBe(1);
        expect(component.alertsComponent.hasErrors()).toBeFalsy();
        expect(component.alertsComponent.hasWarnings()).toBeFalsy();
        expect(component.alertsComponent.hasInfos()).toBeTruthy();
        expect(component.alertsComponent.getInfos()[0].plainText).toBe("You are logged in with the RIPE NCC Access account user");
    });

    it("should throw an error if hash is not found", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParams = {
            get: (hash: string) => (""),
            has:(hash: string) => (false)
        };
        fixture.detectChanges();
        expect(component.alertsComponent.getErrors().length).toBe(1);
        expect(component.alertsComponent.getErrors()[0].plainText).toBe("No hash passed along");
    });

    it("should redirect to legacy on invalid hash", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParams = {
            hash: "invalidhash",
            get: (hash: string) => (""),
            has:(hash: string) => (true)
        };
        mockEmailLinkService.get.and.returnValue(throwError(404));
        component.ngOnInit();
        fixture.detectChanges();

        const alertsComponent = fixture.debugElement.queryAll(By.directive(AlertsComponent));
        expect(alertsComponent.length).toBe(1);
        expect(component.alertsComponent.getErrors()[0].plainText).toContain("Error fetching email-link");
        expect(component.alertsComponent.hasWarnings()).toBeFalsy();
        expect(component.alertsComponent.hasInfos()).toBeFalsy();
    });

    it("should redirect to legacy on expired hash", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParams = {
            hash: "expiredhash",
            get: (hash: string) => (""),
            has:(hash: string) => (true)
        };
        const response = {
                mntner: "maintainer",
                email: "a@b.c",
                username: "user"
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.alertsComponent.getErrors().length).toBe(0);
        expect(component.alertsComponent.getWarnings()[0].plainText).toBe("Your link has expired");
        expect(component.alertsComponent.getInfos().length).toBe(0);
    });

    it("should parse correctly a date in the future", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParams = {
            hash: "parsefuturedatestringhash",
            get: (hash: string) => (""),
            has:(hash: string) => (true)
        };
        const response = {
                mntner:"maintainer",
                email:"a@b.c",
                expiredDate: "2114-08-20T02:35:51+02:00",
                username:"user"
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.key).toBe("maintainer");
        expect(component.email).toBe("a@b.c");
        expect(component.user).toBe("user");

        expect(component.alertsComponent.getErrors().length).toBe(0);
        expect(component.alertsComponent.getWarnings().length).toBe(0);
        expect(component.alertsComponent.getInfos().length).toBe(1);
        expect(component.alertsComponent.getInfos()[0].plainText).toBe("You are logged in with the RIPE NCC Access account user");
    });

    it("should inform user mntner already associated with current user", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParams = {
            hash: "validhash",
            get: (hash: string) => (""),
            has:(hash: string) => (true)
        };
        const response = {
                mntner: "maintainer",
                email: "a@b.c",
                username: "user",
                expiredDate: 20280808,
                currentUserAlreadyManagesMntner: true
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.key).toBe("maintainer");
        expect(component.email).toBe("a@b.c");
        expect(component.user).toBe("user");

        expect(component.alertsComponent.getErrors().length).toBe(0);
        expect(component.alertsComponent.getWarnings()[0].plainText)
            .toBe(`Your RIPE NCC Access account is already associated with this mntner. You can modify this mntner <a href="webupdates/modify/RIPE/mntner/maintainer">here</a>.`);
        expect(component.alertsComponent.getInfos().length).toBe(0);
    });

    it("should return message if associate is cancelled", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParams = {
            hash: "validhash",
            get: (hash: string) => (""),
            has:(hash: string) => (true)
        };
        component.cancelAssociate();
        expect(component.alertsComponent.getWarnings()[0].plainText).toBe(`<p>No changes were made to the <span class="mntner">MNTNER</span> object .</p><p>If you wish to add a different RIPE NCC Access account to your <strong>MNTNER</strong> object:<ol><li>Sign out of RIPE NCC Access.</li><li>Sign back in to RIPE NCC Access with the account you wish to use.</li><li>Click on the link in the instruction email again.</li></ol>`);
    });

    it("should return message that linking account with mntner has succeeded", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParams = {
            hash: "validhash",
            get: (hash: string) => (""),
            has:(hash: string) => (true)
        };
        const response = {
                mntner: "maintainer",
                email: "a@b.c",
                username: "user",
                expiredDate: 20280808,
                currentUserAlreadyManagesMntner: true
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        const responsePut = {data: {
                mntner: "maintainer",
                email: "a@b.c",
                username: "user",
                expiredDate: 20280808
            }
        };
        mockEmailLinkService.update.and.returnValue(of(responsePut));
        spyOn(component.router, "navigate");
        component.ngOnInit();
        fixture.detectChanges();
        component.associate();
        fixture.detectChanges();
        expect(component.router.navigate).toHaveBeenCalledWith(["fmp/ssoAdded", "maintainer", "user" ]);
    });

    it("should return a message that linking account with mntner has failed", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParams = {
            hash: "validhash",
            get: (hash: string) => (""),
            has:(hash: string) => (true)
        };
        const response = {
                mntner: "maintainer",
                email: "a@b.c",
                username: "user",
                expiredDate: 20280808,
                currentUserAlreadyManagesMntner: true
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        mockEmailLinkService.update.and.returnValue(throwError(400));
        component.ngOnInit();
        fixture.detectChanges();
        component.associate();

        expect(component.alertsComponent.getErrors()[0].plainText).toBe(
            `<p>An error occurred while adding the RIPE NCC Access account to the <span class="mntner">MNTNER</span> object.</p>`+
             `<p>No changes were made to the <span class="mntner">MNTNER</span> object maintainer.</p>` +
             `<p>If this error continues, please contact us at <a href="mailto:ripe-dbm@ripe.net">ripe-dbm@ripe.net</a> for assistance.</p>`
        );
    });

    it("should return a message that linking account with mntner has failed already contains SSO", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParams = {
            hash: "validhash",
            get: (hash: string) => (""),
            has:(hash: string) => (true)
        };
        const response = {
                mntner: "maintainer",
                email: "a@b.c",
                username: "user",
                expiredDate: 20280808,
                currentUserAlreadyManagesMntner: true
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        mockEmailLinkService.update.and.returnValue(throwError({status: 400, data: "already contains SSO"}));
        component.ngOnInit();
        fixture.detectChanges();

        component.associate();
        expect(component.alertsComponent.getErrors()[0].plainText).toBe("already contains SSO");
    });
});
