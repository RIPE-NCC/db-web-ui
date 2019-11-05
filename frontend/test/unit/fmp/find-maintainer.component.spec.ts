import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Router} from "@angular/router";
import {of, throwError} from "rxjs";
import {FindMaintainerComponent} from "../../../src/app/fmp/find-maintainer.component";
import {FindMaintainerService} from "../../../src/app/fmp/find-maintainer.service";
import {WINDOW_PROVIDERS} from "../../../src/app/core/window.service";
import {CoreModule} from "../../../src/app/core/core.module";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {UserInfoService} from "../../../src/app/userinfo/user-info.service";

describe("FindMaintainerComponent", () => {

    let component: FindMaintainerComponent;
    let fixture: ComponentFixture<FindMaintainerComponent>;
    let findMaintainerService: any;
    let userInfoService: any;

    beforeEach(() => {
        findMaintainerService = jasmine.createSpyObj("FindMaintainerService", ["search", "sendMail"]);
        userInfoService = jasmine.createSpyObj("UserInfoService", ["getLoggedInUser"]);
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule],
            declarations: [
                FindMaintainerComponent,
            ],
            providers: [
                WINDOW_PROVIDERS,
                { provide: FindMaintainerService, useValue: findMaintainerService},
                { provide: UserInfoService, useValue: userInfoService},
                { provide: Router, useValue: {navigate: () => {}}}
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FindMaintainerComponent);
        component = fixture.componentInstance;
    });

    describe("Testing logged in user", () => {

        beforeEach(() => {
            userInfoService.getLoggedInUser.and.returnValue(of(200));
        });

        it("should retrieve maintainer data", () => {
            const maintainerKey = "I-AM-MNT";
            const response = {
                maintainerKey: "I-AM-MNT",
                selectedMaintainer: {
                    name: "world",
                    attributes: {
                        attribute: [{
                                "name": "mntner",
                                "value": "I-AM-MNT"
                            },{
                                "name": "upd-to",
                                "value": "test@ripe.net"
                            }]
                    }
                },
                email: "test@ripe.net",
                mntnerFound: true
            };
            findMaintainerService.search.and.returnValue(of(response));
            fixture.detectChanges();

            component.selectMaintainer(maintainerKey);
            expect(component.foundMaintainer.mntnerFound).toBe(true);
            expect(component.foundMaintainer.selectedMaintainer.name).toBe("world");
            expect(component.foundMaintainer.email).toBe("test@ripe.net");

            expect(component.errors.length).toBe(0);
            expect(component.warnings.length).toBe(0);
        });

        it("should choose first upd-to address if multiple found", () => {
            const maintainerKey = "I-AM-MNT";
            const response = {
                maintainerKey: "I-AM-MNT",
                selectedMaintainer: {
                    name: "world",
                    attributes: {
                        attribute: [{
                                "name": "mntner",
                                "value": "I-AM-MNT"
                            }, {
                                "name": "upd-to",
                                "value": "first@ripe.net"
                            }, {
                                "name": "upd-to",
                                "value": "second@ripe.net"
                            }]
                    }
                },
                email: "first@ripe.net",
                mntnerFound: true
            };
            findMaintainerService.search.and.returnValue(of(response));
            fixture.detectChanges();

            component.selectMaintainer(maintainerKey);
            expect(component.foundMaintainer.mntnerFound).toBe(true);
            expect(component.foundMaintainer.selectedMaintainer.name).toBe("world");
            expect(component.foundMaintainer.email).toBe("first@ripe.net");

            expect(component.errors.length).toBe(0);
            expect(component.warnings.length).toBe(0);
        });

        it("Validation result expired", () => {
            const maintainerKey = "I-AM-MNT";
            const response = {
                maintainerKey: "I-AM-MNT",
                selectedMaintainer: {
                    name: "world",
                    attributes: {
                        attribute: [{
                            "name": "mntner",
                            "value": "I-AM-MNT"
                        }, {
                            "name": "upd-to",
                            "value": "first@ripe.net"
                        }, {
                            "name": "upd-to",
                            "value": "second@ripe.net"
                        }]
                    }
                },
                email: "first@ripe.net",
                mntnerFound: true,
                expired: false,
            };
            findMaintainerService.search.and.returnValue(of(response));
            fixture.detectChanges();

            component.selectMaintainer(maintainerKey);
            expect(component.foundMaintainer.mntnerFound).toBe(true);
            expect(component.foundMaintainer.selectedMaintainer.name).toBe("world");
            expect(component.foundMaintainer.email).toBe("first@ripe.net");

            expect(component.errors.length).toBe(0);
            expect(component.warnings.length).toBe(1);
            expect(component.warnings[0]).toBe("There is already an open request to reset the password of this maintainer. Proceeding now will cancel the earlier request.");
        });

        it("should not set a maintainer on not found", () => {
            const maintainerKey = "I-AM-NO-MNT";
            findMaintainerService.search.and.returnValue(throwError("The maintainer could not be found."));
            fixture.detectChanges();
            component.selectMaintainer(maintainerKey);

            expect(component.foundMaintainer).toBeUndefined();
            expect(component.errors.length).toBe(1);
            expect(component.errors[0]).toBe("The maintainer could not be found.");
            expect(component.warnings.length).toBe(0);
        });

        it("should not set a maintainer Error fetching maintainer", () => {
            const maintainerKey = "I-AM-NO-MNT";
            findMaintainerService.search.and.returnValue(throwError("Error fetching maintainer."));
            fixture.detectChanges();
            component.selectMaintainer(maintainerKey);

            expect(component.foundMaintainer).toBeUndefined();

            expect(component.errors.length).toBe(1);
            expect(component.errors[0]).toBe("Error fetching maintainer.");
            expect(component.warnings.length).toBe(0);
        });

        it("should go to legacy when error validating email", () => {
            const maintainerKey = "I-AM-NO-MNT";
            findMaintainerService.search.and.returnValue(throwError("switchToManualResetProcess"));
            spyOn(component.router, "navigate");
            component.selectMaintainer(maintainerKey);
            fixture.detectChanges();

            expect(component.foundMaintainer).toBeUndefined();
            expect(component.errors.length).toBe(0);

            expect(component.warnings.length).toBe(0);
            expect(component.router.navigate).toHaveBeenCalledWith(["fmp/forgotMaintainerPassword"],
                { queryParams: { mntnerKey: "I-AM-NO-MNT", voluntary: false }});
        });

        it("should go to mailSent-page when email is successfully sent", () => {
            const response = {
                    mntner: "WORLD",
                    email: "a@b.c"
                };
            findMaintainerService.sendMail.and.returnValue(of(response));
            spyOn(component.router, "navigate");
            component.foundMaintainer = { email:"a@b.c", maintainerKey: "I-AM-MNT" };
            component.validateEmail();
            fixture.detectChanges();

            expect(component.errors.length).toBe(0);
            expect(component.router.navigate).toHaveBeenCalledWith(["fmp/mailSent", "a@b.c"],
                { queryParams: { maintainerKey: "I-AM-MNT" }});
        });

        it("should report error validating mail", () => {
            findMaintainerService.sendMail.and.returnValue(throwError(500));
            spyOn(component.router, "navigate");
            component.foundMaintainer = { email:"a@b.c", maintainerKey: "I-AM-MNT" };
            component.validateEmail();
            fixture.detectChanges();

            expect(component.errors.length).toBe(1);
            expect(component.errors[0]).toBe("Error sending email");
            expect(component.router.navigate).toHaveBeenCalledWith(["fmp/forgotMaintainerPassword"],
                { queryParams: { mntnerKey: "I-AM-MNT", voluntary: false }});
        });

        it("should report error validating mail", () => {
            findMaintainerService.sendMail.and.returnValue(throwError(404));
            spyOn(component.router, "navigate");
            component.foundMaintainer = { email:"a@b.c", maintainerKey: "I-AM-MNT" };
            component.validateEmail();
            fixture.detectChanges();

            expect(component.errors.length).toBe(1);
            expect(component.errors[0]).toBe("Error sending email");
            expect(component.router.navigate).toHaveBeenCalledWith(["fmp/forgotMaintainerPassword"],
                { queryParams: { mntnerKey: "I-AM-MNT", voluntary: false }});

        });

        it("should return unathorized for validate email", () => {
            findMaintainerService.sendMail.and.returnValue(throwError({status: 401, data: "Unauthorized"}));
            component.foundMaintainer = { email:"a@b.c", maintainerKey: "I-AM-MNT" };
            component.validateEmail();
            fixture.detectChanges();

            expect(component.errors.length).toBe(0);
        });

        it("should call history back on cancel Window", () => {
            spyOn(window.history, "back");
            component.cancel();
            fixture.detectChanges();
            expect(window.history.back).toHaveBeenCalled();
        });

        it("should switchToManualResetProcess", () => {
            const maintainerKey = "I-AM-MNT";
            spyOn(component.router, "navigate");
            component.foundMaintainer = { maintainerKey: maintainerKey };
            component.switchToManualResetProcess(maintainerKey);
            fixture.detectChanges();

            expect(component.router.navigate).toHaveBeenCalledWith(["fmp/forgotMaintainerPassword"],
                { queryParams: { mntnerKey: "I-AM-MNT", voluntary: true }});
        });
    });

    describe("Testing Not logged in user", () => {
        beforeEach(async() => {
            userInfoService.getLoggedInUser.and.returnValue(throwError(403));
            spyOn(component.router, "navigate");
            component.ngOnInit();
            await fixture.whenStable();
        });

        it("should not logged in user", () => {
            expect(component.router.navigate).toHaveBeenCalledWith(["fmp/requireLogin"]);
        });
    });
});
