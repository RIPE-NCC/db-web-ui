import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {RouterModule} from "@angular/router";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {CookieService} from "ngx-cookie-service";
import {SharedModule} from "../../../../src/app/shared/shared.module";
import {ModalAuthenticationComponent} from "../../../../src/app/updates/web/modal-authentication.component";
import {WhoisResourcesService} from "../../../../src/app/shared/whois-resources.service";
import {RestService} from "../../../../src/app/updates/rest.service";
import {UserInfoService} from "../../../../src/app/userinfo/user-info.service";
import {CredentialsService} from "../../../../src/app/shared/credentials.service";
import {PropertiesService} from "../../../../src/app/properties.service";

describe("ModalAuthenticationComponent", () => {

    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ModalAuthenticationComponent>;
    let modalAuthenticationComponent: ModalAuthenticationComponent;
    let modalMock: any;
    let credentialsServiceMock: any;

    const mntners = [
            {type: "mntner", key: "a-mnt", auth: ["MD5-PW"]},
            {type: "mntner", name: "b-mnt", auth: ["MD5-PW"]}
            ];

    const mntnersWithoutPassword = [{type: "mntner", key: "z-mnt", auth: ["SSO"]}];

    beforeEach(() => {
        modalMock = jasmine.createSpyObj("NgbActiveModal", ["close", "dismiss"]);
        const routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        credentialsServiceMock = jasmine.createSpyObj("CredentialsService", ["hasCredentials", "getCredentials", "removeCredentials", "setCredentials"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule, SharedModule, RouterModule],
            declarations: [ModalAuthenticationComponent],
            providers: [
                {provide: NgbActiveModal, useValue: modalMock},
                WhoisResourcesService,
                RestService,
                UserInfoService,
                {provide: CredentialsService, useValue: credentialsServiceMock},
                PropertiesService,
                CookieService,
                {provide: Router, useValue: routerMock},
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        componentFixture = TestBed.createComponent(ModalAuthenticationComponent);
        modalAuthenticationComponent = componentFixture.componentInstance;
        modalAuthenticationComponent.resolve = {
            method: "PUT",
            objectType: "mntner",
            objectName: "someName",
            mntners,
            mntnersWithoutPassword,
            allowForcedDelete: false,
            isLirObject: false,
            source: "RIPE",
        };
        componentFixture.detectChanges();

    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should detect empty password", () => {
        modalAuthenticationComponent.selected.item = {type: "mntner", key: "b-mnt"};
        modalAuthenticationComponent.selected.password = "";
        modalAuthenticationComponent.selected.associate = false;
        modalAuthenticationComponent.ok();

        expect(modalAuthenticationComponent.selected.message).toEqual("Password for mntner: \'b-mnt\' too short");
    });

    it("should detect invalid password", async () => {
        modalAuthenticationComponent.selected.item = {type: "mntner", key: "b-mnt"};
        modalAuthenticationComponent.selected.password = "secret";
        modalAuthenticationComponent.selected.associate = false;

        modalAuthenticationComponent.ok();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true"}).flush({
            objects: {
                object: [
                    {
                        source: {id: "RIPE"},
                        "primary-key": {attribute: [{name: "mntner", value: "b-mnt"}]},
                        attributes: {
                            attribute: [
                                {name: "mntner", value: "b-mnt"},
                                {name: "mnt-by", value: "b-mnt"},
                                {name: "source", value: "RIPE", comment: "Filtered"}
                            ]
                        }
                    }
                ]
            }
        });

        await componentFixture.whenStable();

        expect(modalAuthenticationComponent.selected.message).toEqual("You have not supplied the correct password for mntner: \'b-mnt\'");
    });

    it("should close the modal and return selected item when ok", async () => {
        modalAuthenticationComponent.selected.item = {type: "mntner", key: "b-mnt"};
        modalAuthenticationComponent.selected.password = "secret";
        modalAuthenticationComponent.selected.associate = false;

        modalAuthenticationComponent.ok();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true"}).flush({
            objects: {
                object: [
                    {
                        source: {id: "RIPE"},
                        "primary-key": {attribute: [{name: "mntner", value: "b-mnt"}]},
                        attributes: {
                            attribute: [
                                {name: "mntner", value: "b-mnt"},
                                {name: "mnt-by", value: "b-mnt"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    }
                ]
            }
        });

        await componentFixture.whenStable();
        httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"}).flush({
            user: {
                "username": "dummy@ripe.net",
                "displayName": "Test User",
                "uuid": "aaaa-bbbb-cccc-dddd",
                "active": "true"
            }
        });
        await componentFixture.whenStable();

        expect(credentialsServiceMock.setCredentials).toHaveBeenCalledWith("b-mnt", "secret");

        expect(modalMock.close).toHaveBeenCalledWith({$value: {selectedItem: {type: "mntner", key: "b-mnt"}}});
    });

    it("should associate and close the modal and return selected item when ok", async () => {
        modalAuthenticationComponent.selected.item = {type: "mntner", key: "b-mnt", auth: []};
        modalAuthenticationComponent.selected.password = "secret";
        modalAuthenticationComponent.selected.associate = true;

        modalAuthenticationComponent.ok();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true"}).flush({
            objects: {
                object: [
                    {
                        source: {id: "RIPE"},
                        "primary-key": {attribute: [{name: "mntner", value: "b-mnt"}]},
                        attributes: {
                            attribute: [
                                {name: "mntner", value: "b-mnt"},
                                {name: "mnt-by", value: "b-mnt"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    }
                ]
            }
        });


        await componentFixture.whenStable();
        httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"}).flush({
            user: {
                "username": "dummy@ripe.net",
                "displayName": "Test User",
                "uuid": "aaaa-bbbb-cccc-dddd",
                "active": "true"
            }
        });
        await componentFixture.whenStable();
        const resp = {
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "mntner", value: "b-mnt"}]},
                        attributes: {
                            attribute: [
                                {name: "mntner", value: "b-mnt"},
                                {name: "mnt-by", value: "b-mnt"},
                                {name: "auth", value: "SSO dummy@ripe.net"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    }
                ]
            }
        };

        httpMock.expectOne({method: "PUT", url: "api/whois/RIPE/mntner/b-mnt?password=secret"}).flush(resp);
        await componentFixture.whenStable();

        expect(credentialsServiceMock.setCredentials).toHaveBeenCalledWith("b-mnt", "secret");
        expect(credentialsServiceMock.removeCredentials).toHaveBeenCalled();

        expect(modalMock.close).toHaveBeenCalledWith({
            $value: {
                selectedItem: {type: "mntner", key: "b-mnt", auth: ["SSO"], mine: true},
                response: jasmine.any(Object)
            }
        });
    });

    it("should close the modal and return error when canceled", () => {
        modalAuthenticationComponent.cancel();
        expect(modalMock.dismiss).toHaveBeenCalled();
    });

    it("should set mntnersWithoutPassword to the scope", () => {
        expect(modalAuthenticationComponent.resolve.mntnersWithoutPassword).toEqual(mntnersWithoutPassword);
    });

    it("should not allow forceDelete if method is forceDelete", () => {
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        modalAuthenticationComponent.resolve.method = "ForceDelete";
        expect(modalAuthenticationComponent.allowForceDelete()).toBe(false);
    });

    it("should allow force delete if objectType is inetnum", () => {
        modalAuthenticationComponent.resolve.objectType = "inetnum";
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBe(true);
    });

    it("should allow force delete if objectType is inet6num", () => {
        modalAuthenticationComponent.resolve.objectType = "inet6num";
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBe(true);
    });

    it("should allow force delete if objectType is route", () => {
        modalAuthenticationComponent.resolve.objectType = "route";
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBe(true);
    });

    it("should allow force delete if objectType is route6", () => {
        modalAuthenticationComponent.resolve.objectType = "route6";
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBe(true);
    });

    it("should allow force delete if objectType is domain", () => {
        modalAuthenticationComponent.resolve.objectType = "domain";
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBe(true);
    });

    it("should not allow force delete if objectType is mntner", () => {
        modalAuthenticationComponent.resolve.objectType = "mntner";
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBe(false);
    });

    it("should not allow force delete if objectType has RIPE-NCC-END-MNT", () => {
        modalAuthenticationComponent.resolve.objectType = "inetnum";
        modalAuthenticationComponent.resolve.allowForcedDelete = false;
        expect(modalAuthenticationComponent.allowForceDelete()).toBe(false);
    });
});
