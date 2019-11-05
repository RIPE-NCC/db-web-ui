import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ActivatedRoute, Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {CookieService} from "ngx-cookie-service";
import {of} from "rxjs";
import {NgSelectModule} from "@ng-select/ng-select";
import {NgOptionHighlightModule} from "@ng-select/ng-option-highlight";
import {Location} from "@angular/common";
import {WhoisMetaService} from "../../../../src/app/shared/whois-meta.service";
import {CreateModifyComponent} from "../../../../src/app/updates/web/create-modify.component";
import {SharedModule} from "../../../../src/app/shared/shared.module";
import {CoreModule} from "../../../../src/app/core/core.module";
import {RestService} from "../../../../src/app/updates/rest.service";
import {PrefixService} from "../../../../src/app/domainobject/prefix.service";
import {ResourceStatusService} from "../../../../src/app/myresources/resource-status.service";
import {WebUpdatesCommonsService} from "../../../../src/app/updates/web/web-updates-commons.service";
import {PropertiesService} from "../../../../src/app/properties.service";
import {OrganisationHelperService} from "../../../../src/app/updates/web/organisation-helper.service";
import {WhoisResourcesService} from "../../../../src/app/shared/whois-resources.service";
import {MessageStoreService} from "../../../../src/app/updates/message-store.service";
import {MntnerService} from "../../../../src/app/updates/mntner.service";
import {ErrorReporterService} from "../../../../src/app/updates/error-reporter.service";
import {LinkService} from "../../../../src/app/updates/link.service";
import {PreferenceService} from "../../../../src/app/updates/preference.service";
import {EnumService} from "../../../../src/app/updates/web/enum.service";
import {CharsetToolsService} from "../../../../src/app/updates/charset-tools.service";
import {ScreenLogicInterceptorService} from "../../../../src/app/updates/screen-logic-interceptor.service";
import {AttributeSharedService} from "../../../../src/app/attribute/attribute-shared.service";
import {AttributeMetadataService} from "../../../../src/app/attribute/attribute-metadata.service";

describe("CreateModifyComponent for organisation", () => {

    let httpMock: HttpTestingController;
    let fixture: ComponentFixture<CreateModifyComponent>;
    let component: CreateModifyComponent;
    let modalMock: any;
    const OBJECT_TYPE = "organisation";
    const SOURCE = "RIPE";
    const NAME = "ORG-UA300-RIPE";


    beforeEach(async () => {
        modalMock = jasmine.createSpyObj("NgbModal", ["open"]);
        modalMock.open.and.returnValue({componentInstance: {}, result: of(ROLE_OBJ).toPromise()});
        const routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                CoreModule,
                NgSelectModule,
                NgOptionHighlightModule,
                HttpClientTestingModule],
            declarations: [CreateModifyComponent],
            providers: [
                PrefixService,
                ResourceStatusService,
                WebUpdatesCommonsService,
                PropertiesService,
                OrganisationHelperService,
                AttributeSharedService,
                AttributeMetadataService,
                WhoisResourcesService,
                WhoisMetaService,
                RestService,
                MessageStoreService,
                MntnerService,
                ErrorReporterService,
                LinkService,
                PreferenceService,
                CookieService,
                EnumService,
                CharsetToolsService,
                ScreenLogicInterceptorService,
                { provide: Location, useValue: { path: () => ""}},
                {provide: Router, useValue: routerMock},
                {
                    provide: ActivatedRoute, useValue: {
                        snapshot: {
                            paramMap: {source: SOURCE, objectType: OBJECT_TYPE, objectName: NAME,
                                get: (param: string) => (component.activatedRoute.snapshot.paramMap[param]),
                                has: (param: string) => (!!component.activatedRoute.snapshot.paramMap[param])},
                            queryParamMap: {has: (param: string) => (!!component.activatedRoute.snapshot.queryParamMap[param])}
                        }
                    }
                },
                {provide: NgbModal, useValue: modalMock}
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(CreateModifyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush(MNTNERS_SSO_ACCOUNT_RESPONS);
        httpMock.expectOne({method: "GET", url: `api/whois/${SOURCE}/${OBJECT_TYPE}/${NAME}?unfiltered=true`}).flush(DEFAULT_RESPONSE)
        await fixture.whenStable();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should populate abuse-c with new role\'s nic-hdl", async () => {
        component.attributes = component.organisationHelperService.addAbuseC(component.objectType, component.attributes);
        modalMock.open.and.returnValue({componentInstance: {}, result: of(ROLE_OBJ).toPromise()});
        const attrAbuseC = component.attributes.getSingleAttributeOnName("abuse-c");
        component.createRoleForAbuseCAttribute(attrAbuseC);
        await fixture.whenStable();
        httpMock.expectOne({method: "GET", url: "api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT"}).flush({});
        expect(component.attributes.getSingleAttributeOnName("abuse-c").value).toBe("SR11027-RIPE");
    });

    it("should populate component.roleForAbuseC", async () => {
        component.attributes = component.organisationHelperService.addAbuseC(component.objectType, component.attributes);
        modalMock.open.and.returnValue({componentInstance: {}, result: of(ROLE_OBJ).toPromise()});
        const attrAbuseC = component.attributes.getSingleAttributeOnName("abuse-c");
        component.createRoleForAbuseCAttribute(attrAbuseC);
        await fixture.whenStable();
        httpMock.expectOne({method: "GET", url: "api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT"}).flush({});
        expect(component.roleForAbuseC).toBeDefined();
    });

    it("should use the helper to update role for abuse-c", async () => {
        component.attributes = component.attributes.addAttributeAfterType({name: "abuse-c", value: "some abuse-c"}, {name: "e-mail"});
        component.attributes = component.whoisResourcesService.wrapAttributes(
            component.whoisMetaService.enrichAttributesWithMetaInfo(component.objectType, component.attributes )
        );
        await fixture.whenStable();
        httpMock.expectOne({method: "GET", url: "api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT"}).flush({});
        spyOn(component.organisationHelperService, "updateAbuseC");
        component.submit();
        httpMock.expectOne({method: "PUT", url: "api/whois/RIPE/organisation/ORG-UA300-RIPE"}).flush(DEFAULT_RESPONSE);
        fixture.detectChanges();
        expect(component.organisationHelperService.updateAbuseC).toHaveBeenCalled();
    });

    const ROLE_OBJ = [{
                        name : "role",
                        value : "some role"
                    }, {
                        name : "address",
                        value : "Singel 258"
                    }, {
                        name : "e-mail",
                        value : "fdsd@sdfsd.com"
                    }, {
                        name : "abuse-mailbox",
                        value : "fdsd@sdfsd.com"
                    }, {
                        name : "nic-hdl",
                        value : "SR11027-RIPE"
                    }, {
                        name : "mnt-by",
                        value : "MNT-THINK"
                    }, {
                        name : "source",
                        value : "RIPE"
                    }];

    const DEFAULT_RESPONSE =
                {
                    objects: {
                        object: [
                            {
                                "primary-key" : {attribute : [{name : "organisation",value : "ORG-UA300-RIPE"}]},
                                attributes: {
                                    attribute: [ {
                                        name : "organisation",
                                        value : "ORG-UA300-RIPE"
                                    }, {
                                        name : "org-name",
                                        value : "uhuuu"
                                    }, {
                                        name : "org-type",
                                        value : "OTHER"
                                    }, {
                                        name : "address",
                                        value : "Singel 258"
                                    }, {
                                        name : "e-mail",
                                        value : "uhuuuu@ripe.net"
                                    }, {
                                        name : "mnt-ref",
                                        value : "TEST-MNT"
                                    }, {
                                        name : "mnt-by",
                                        value : "TEST-MNT"
                                    }, {
                                        name : "source",
                                        value: "RIPE"
                                    }
                                    ]
                                }
                            }
                        ]
                    }
                };

    const MNTNERS_SSO_ACCOUNT_RESPONS = [
        {key:"TEST-MNT", type: "mntner", auth:["SSO"], mine:true},
        {key:"TESTSSO-MNT", type: "mntner", auth:["MD5-PW","SSO"], mine:true}
    ];
});