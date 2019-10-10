import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {Location} from "@angular/common";
import {ActivatedRoute, convertToParamMap, ParamMap, Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {of} from "rxjs";
import {TextCreateComponent} from "../../../app/ng/updatestext/text-create.component";
import {PreferenceService} from "../../../app/ng/updates/preference.service";
import {MntnerService} from "../../../app/ng/updates/mntner.service";
import {AlertsComponent} from "../../../app/ng/shared/alert/alerts.component";
import {WINDOW} from "../../../app/ng/core/window.service";
import {WhoisResourcesService} from "../../../app/ng/shared/whois-resources.service";
import {WhoisMetaService} from "../../../app/ng/shared/whois-meta.service";
import {RestService} from "../../../app/ng/updates/rest.service";
import {AlertsService} from "../../../app/ng/shared/alert/alerts.service";
import {ErrorReporterService} from "../../../app/ng/updates/error-reporter.service";
import {MessageStoreService} from "../../../app/ng/updates/message-store.service";
import {RpslService} from "../../../app/ng/updatestext/rpsl.service";
import {TextCommonsService} from "../../../app/ng/updatestext/text-commons.service";
import {CredentialsService} from "../../../app/ng/shared/credentials.service";
import {PrefixService} from "../../../app/ng/domainobject/prefix.service";

describe("TextCreateComponent", () => {

    const SOURCE = "RIPE";
    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<TextCreateComponent>;
    let paramMapMock: ParamMap;
    let queryParamMock: ParamMap;
    let preferencesServiceMock: any;
    let routerMock: any;
    let modalMock: any;

    let textCreateComponent: TextCreateComponent;

    beforeEach(() => {
        paramMapMock = convertToParamMap({});
        queryParamMock = convertToParamMap({});
        preferencesServiceMock = jasmine.createSpyObj("PreferenceService", ["isTextMode", "setTextMode", "isWebMode", "setWebMode"]);
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        modalMock = jasmine.createSpyObj("NgbModal", ["open"]);
        modalMock.open.and.returnValue({componentInstance: {}, result: of().toPromise()});
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule],
            declarations: [TextCreateComponent, AlertsComponent],
            providers: [
                {provide: PreferenceService, useValue: preferencesServiceMock},

                WhoisResourcesService,
                WhoisMetaService,
                RestService,
                AlertsService,
                ErrorReporterService,
                MessageStoreService,
                RpslService,
                MntnerService,
                TextCommonsService,
                CredentialsService,
                PrefixService,
                { provide: Location, useValue: {path: () => ""}},
                {provide: NgbModal, useValue: modalMock},

                {provide: WINDOW, useValue: {}},
                {provide: Router, useValue: routerMock},
                {
                    provide: ActivatedRoute, useValue: {
                        snapshot: {
                            paramMap: paramMapMock,
                            queryParamMap: queryParamMock,
                        }
                    }
                }

            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        componentFixture = TestBed.createComponent(TextCreateComponent);
        textCreateComponent = componentFixture.componentInstance;
    });


    afterEach(() => {
        httpMock.verify();
    });

    const createParams = (source: string, objectType: string, noRedirect: boolean, rpsl: string) => {
        const paramMapSpy = spyOn(paramMapMock, "get");
        const queryParamHasSpy = spyOn(queryParamMock, "has");
        const queryParamGetSpy = spyOn(queryParamMock, "get");

        paramMapSpy.withArgs("source").and.returnValue(source);
        paramMapSpy.withArgs("objectType").and.returnValue(objectType);
        queryParamHasSpy.withArgs("noRedirect").and.returnValue(noRedirect);
        if (rpsl) {
            queryParamHasSpy.withArgs("rpsl").and.returnValue(true);
            queryParamGetSpy.withArgs("rpsl").and.returnValue(rpsl);
        } else {
            queryParamHasSpy.withArgs("rpsl").and.returnValue(false);
        }
    };

    it("should get parameters from url", () => {
        createParams(SOURCE, "inetnum", true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([]);
        expect(textCreateComponent.object.source).toBe(SOURCE);
        expect(textCreateComponent.object.type).toBe("inetnum");
    });

    it("should get rpsl from url-parameter", () => {
        createParams(SOURCE, "inetnum", true, "inetnum:1\inetnum:2\n");

        componentFixture.detectChanges();

        expect(textCreateComponent.object.source).toBe(SOURCE);
        expect(textCreateComponent.object.type).toBe("inetnum");
        expect(textCreateComponent.object.rpsl).toBe("inetnum:1\inetnum:2\n");
    });

    it("should redirect to webupdates when web-preference is set", () => {
        createParams(SOURCE, "inetnum", false, null);
        preferencesServiceMock.isWebMode.and.returnValue(true);

        componentFixture.detectChanges();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/create/RIPE/inetnum?noRedirect`);
    });

    it("should not redirect to webupdates when web-preference is set and no-redirect is true", () => {
        createParams(SOURCE, "inetnum", true, null);
        preferencesServiceMock.isWebMode.and.returnValue(true);

        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([]);
    });

    it("should populate an empty person rpsl, mandatory attrs uppercase and optional lowercase", async () => {
        createParams(SOURCE, "person", true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([]);
        await componentFixture.whenStable();
        expect(textCreateComponent.object.rpsl).toEqual(
            "PERSON:        \n" +
            "ADDRESS:       \n" +
            "PHONE:         \n" +
            "fax-no:        \n" +
            "e-mail:        \n" +
            "org:           \n" +
            "NIC-HDL:       AUTO-1\n" +
            "remarks:       \n" +
            "notify:        \n" +
            "MNT-BY:        \n" +
            "SOURCE:        RIPE\n");
    });

    it("should fetch and populate sso mntners", async () => {
        createParams(SOURCE, "inetnum", true, null);

        componentFixture.detectChanges();


        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {"key": "TEST-MNT", "type": "mntner", "auth": ["SSO"], "mine": true}
        ]);
        await componentFixture.whenStable();
        expect(textCreateComponent.object.rpsl).toEqual(
            "INETNUM:       \n" +
            "NETNAME:       \n" +
            "descr:         \n" +
            "COUNTRY:       \n" +
            "geoloc:        \n" +
            "language:      \n" +
            "org:           \n" +
            "sponsoring-org:\n" +
            "ADMIN-C:       \n" +
            "TECH-C:        \n" +
            "abuse-c:       \n" +
            "STATUS:        \n" +
            "remarks:       \n" +
            "notify:        \n" +
            "MNT-BY:        TEST-MNT\n" +
            "mnt-lower:     \n" +
            "mnt-domains:   \n" +
            "mnt-routes:    \n" +
            "mnt-irt:       \n" +
            "SOURCE:        RIPE\n");

        expect(textCreateComponent.alertService.getErrors().length).toEqual(0);
    });

    it("should handle empty sso mntners", async () => {
        createParams(SOURCE, "inetnum", true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([]);
        await componentFixture.whenStable();
        expect(textCreateComponent.object.rpsl).toEqual(
            "INETNUM:       \n" +
            "NETNAME:       \n" +
            "descr:         \n" +
            "COUNTRY:       \n" +
            "geoloc:        \n" +
            "language:      \n" +
            "org:           \n" +
            "sponsoring-org:\n" +
            "ADMIN-C:       \n" +
            "TECH-C:        \n" +
            "abuse-c:       \n" +
            "STATUS:        \n" +
            "remarks:       \n" +
            "notify:        \n" +
            "MNT-BY:        \n" +
            "mnt-lower:     \n" +
            "mnt-domains:   \n" +
            "mnt-routes:    \n" +
            "mnt-irt:       \n" +
            "SOURCE:        RIPE\n");
        expect(textCreateComponent.alertService.getErrors().length).toEqual(0);
    });

    // TODO fix
    /*
    it("should handle 404 error while fetching sso mntners", () => {
        doCreateController("inetnum");

        $httpBackend.whenGET("api/user/mntners").respond(404);
        $httpBackend.flush();

        expect($state.current.name).toBe("notFound");
    });
    */

    it("should handle error while fetching sso mntners", async () => {
        createParams(SOURCE, "inetnum", true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([], {status: 400, statusText: "error"});
        await componentFixture.whenStable();
        expect(textCreateComponent.object.rpsl).toEqual(
            "INETNUM:       \n" +
            "NETNAME:       \n" +
            "descr:         \n" +
            "COUNTRY:       \n" +
            "geoloc:        \n" +
            "language:      \n" +
            "org:           \n" +
            "sponsoring-org:\n" +
            "ADMIN-C:       \n" +
            "TECH-C:        \n" +
            "abuse-c:       \n" +
            "STATUS:        \n" +
            "remarks:       \n" +
            "notify:        \n" +
            "MNT-BY:        \n" +
            "mnt-lower:     \n" +
            "mnt-domains:   \n" +
            "mnt-routes:    \n" +
            "mnt-irt:       \n" +
            "SOURCE:        RIPE\n");

        expect(textCreateComponent.alertService.getErrors().length).toEqual(1);
        expect(textCreateComponent.alertService.getErrors()).toEqual([{plainText: "Error fetching maintainers associated with this SSO account"}]);
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it("should report an error when mandatory field is missing", async () => {
        createParams(SOURCE, "person", true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {"key": "TESTSSO-MNT", "type": "mntner", "auth": ["SSO"], "mine": true}
        ]);
        await componentFixture.whenStable();
        textCreateComponent.submit();
        await componentFixture.whenStable();

        expect(textCreateComponent.alertService.getErrors()).toEqual([
            {plainText: "person: Mandatory attribute not set"},
            {plainText: "address: Mandatory attribute not set"},
            {plainText: "phone: Mandatory attribute not set"},
        ]);

        expect(modalMock.open).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it("should report an error when multiple objects are passed in", async () => {
        createParams(SOURCE, "person", true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {"key": "TESTSSO-MNT", "type": "mntner", "auth": ["SSO"], "mine": true}
        ]);
        await componentFixture.whenStable();

        textCreateComponent.object.rpsl = person_correct +
            "person: Tester X\n" +
            "\n" +
            "person:Tester Y\n";

        textCreateComponent.submit();
        await componentFixture.whenStable();

        expect(textCreateComponent.alertService.getErrors()).toEqual([
            {plainText: "Only a single object is allowed"},
        ]);

        expect(modalMock.open).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it("should report an error when unknown attribute is encountered", async () => {
        createParams(SOURCE, "person", true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {"key": "TEST-MNT", "type": "mntner", "auth": ["SSO"], "mine": true}
        ]);

        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct +
            "wrong:xyz";
        textCreateComponent.submit();
        await componentFixture.whenStable();

        expect(textCreateComponent.alertService.getErrors()).toEqual([
            {plainText: "wrong: Unknown attribute"}
        ]);

        expect(modalMock.open).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    const person_correct =
        "person:        Tester X\n" +
        "address:       Singel, Amsterdam\n" +
        "phone:         +316\n" +
        "nic-hdl:       AUTO-1\n" +
        "mnt-by:        grol129-mnt\n" +
        "mnt-by:        TEST-MNT\n" +
        "source:        RIPE\n";

    it("should present password popup upon submit when no sso mnt-by is used", async () => {
        createParams(SOURCE, "person", true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {"key": "TESTSSO-MNT", "type": "mntner", "auth": ["SSO"], "mine": true}
        ]);
        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct;
        textCreateComponent.submit();
        await componentFixture.whenStable();

        expect(modalMock.open).toHaveBeenCalled();
    });

    it("should navigate to display after successful submit", async () => {
        createParams(SOURCE, "person", true, null);
        componentFixture.detectChanges();


        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {"key": "TEST-MNT", "type": "mntner", "auth": ["SSO"], "mine": true}
        ]);

        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct;
        textCreateComponent.submit();
        await componentFixture.whenStable();

        httpMock.expectOne({method: "POST", url: "api/whois/RIPE/person?unformatted=true"}).flush({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "nic-hdl", value: "TX01-RIPE"}]},
                        attributes: {
                            attribute: [
                                {name: "person", value: "Tester X"},
                                {name: "address", value: "Singel, Amsterdam"},
                                {name: "phone", value: "+316"},
                                {name: "nic-hdl", value: "TX01-RIPE"},
                                {name: "mnt-by", value: "TEST-MNT"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    }
                ]
            }
        });


        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/person/TX01-RIPE?method=Create`);
        expect(modalMock.open).not.toHaveBeenCalled();
    });

    it("should extract password from rpsl", async () => {
        createParams(SOURCE, "person", true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {"key": "TEST-MNT", "type": "mntner", "auth": ["SSO"], "mine": true}
        ]);

        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct + "password:secret\n";
        textCreateComponent.submit();
        await componentFixture.whenStable();

        httpMock.expectOne({method: "POST", url: "api/whois/RIPE/person?password=secret&unformatted=true"}).flush({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "person", value: "TX01-RIPE"}]},
                        attributes: {
                            attribute: [
                                {name: "person", value: "Tester X"},
                                {name: "address", value: "Singel, Amsterdam"},
                                {name: "phone", value: "+316"},
                                {name: "nic-hdl", value: "TX01-RIPE"},
                                {name: "mnt-by", value: "TEST-MNT"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    }
                ]
            }
        });

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/person/TX01-RIPE?method=Create`);
        expect(modalMock.open).not.toHaveBeenCalled();
    });

    it("should extract override from rpsl and ignore password", async () => {
        createParams(SOURCE, "person", true, null);
        componentFixture.detectChanges();


        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {"key": "TEST-MNT", "type": "mntner", "auth": ["SSO"], "mine": true}
        ]);

        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct +
            "override:me,secret,because\n" +
            "password:secret";
        textCreateComponent.submit();
        await componentFixture.whenStable();

        httpMock.expectOne({
            method: "POST",
            url: "api/whois/RIPE/person?override=me,secret,because&unformatted=true"
        }).flush({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "person", value: "TX01-RIPE"}]},
                        attributes: {
                            attribute: [
                                {name: "person", value: "Tester X"},
                                {name: "address", value: "Singel, Amsterdam"},
                                {name: "phone", value: "+316"},
                                {name: "nic-hdl", value: "TX01-RIPE"},
                                {name: "mnt-by", value: "TEST-MNT"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    }
                ]
            }
        });
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/person/TX01-RIPE?method=Create`);
        expect(modalMock.open).not.toHaveBeenCalled();
    });

    it("should show errors after submit failure ", async () => {
        createParams(SOURCE, "person", true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {"key": "TEST-MNT", "type": "mntner", "auth": ["SSO"], "mine": true}
        ]);

        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct;
        textCreateComponent.submit();
        await componentFixture.whenStable();

        httpMock.expectOne({method: "POST", url: "api/whois/RIPE/person?unformatted=true"}).flush({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "person", value: "TX01-RIPE"}]},
                        attributes: {
                            attribute: [
                                {name: "person", value: "Tester X"},
                                {name: "address", value: "Singel, Amsterdam"},
                                {name: "phone", value: "+316"},
                                {name: "nic-hdl", value: "TX01-RIPE"},
                                {name: "mnt-by", value: "TEST-MNT"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    }
                ]
            },
            errormessages: {
                errormessage: [
                    {
                        severity: "Error",
                        text: "Unrecognized source: %s",
                        "args": [{value: "INVALID_SOURCE"}]
                    },
                    {
                        severity: "Warning",
                        text: "Not authenticated"
                    }, {
                        severity: "Error",
                        attribute: {
                            name: "person",
                            value: "Tester X"
                        },
                        text: "\"%s\" is not valid for this object type",
                        args: [{value: "Tester X"}]
                    }
                ]
            },
        }, {statusText: "bad request", status: 400});


        expect(textCreateComponent.alertService.getErrors().length).toEqual(2);
        const plaintextErrors = _.map(textCreateComponent.alertService.getErrors(), (item) => ({plainText: item.plainText}));
        expect(plaintextErrors).toEqual([
            {plainText: "Unrecognized source: INVALID_SOURCE"},
            {plainText: "person: \"Tester X\" is not valid for this object type"}
        ]);

        expect(textCreateComponent.alertService.getWarnings().length).toEqual(1);
        const plaintextWarnings = _.map(textCreateComponent.alertService.getWarnings(), (item) => ({plainText: item.plainText}));
        expect(plaintextWarnings).toEqual([
            {plainText: "Not authenticated"}
        ]);

        expect(textCreateComponent.object.rpsl).toEqual(person_correct);
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(modalMock.open).not.toHaveBeenCalled();

    });
});
