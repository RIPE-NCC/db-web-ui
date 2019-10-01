import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ActivatedRoute, convertToParamMap, ParamMap, Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {Location} from "@angular/common";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {of} from "rxjs";
import {TextModifyComponent} from "../../../app/ng/updatestext/text-modify.component";
import {AlertsComponent} from "../../../app/ng/shared/alert/alerts.component";
import {PreferenceService} from "../../../app/ng/updates/preference.service";
import {WhoisResourcesService} from "../../../app/ng/shared/whois-resources.service";
import {WhoisMetaService} from "../../../app/ng/shared/whois-meta.service";
import {RestService} from "../../../app/ng/updates/rest.service";
import {AlertsService} from "../../../app/ng/shared/alert/alerts.service";
import {ErrorReporterService} from "../../../app/ng/updates/error-reporter.service";
import {MessageStoreService} from "../../../app/ng/updates/message-store.service";
import {RpslService} from "../../../app/ng/updatestext/rpsl.service";
import {MntnerService} from "../../../app/ng/updates/mntner.service";
import {TextCommonsService} from "../../../app/ng/updatestext/text-commons.service";
import {CredentialsService} from "../../../app/ng/shared/credentials.service";
import {PrefixService} from "../../../app/ng/domainobject/prefix.service";
import {WINDOW} from "../../../app/ng/core/window.service";

describe('TextModifyComponent', () => {

    const SOURCE = 'RIPE';
    const OBJECT_NAME = 'TP-RIPE';
    const OBJECT_TYPE = 'person';
    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<TextModifyComponent>;
    let paramMapMock: ParamMap;
    let queryParamMock: ParamMap;
    let preferencesServiceMock: any;
    let routerMock: any;
    let modalMock: any;
    let credentialsServiceMock: any;
    let textModifyComponent: TextModifyComponent;

    const testPersonRpsl =
        'person:test person\n' +
        'address:Amsterdam\n' +
        'phone:+316\n' +
        'nic-hdl:TP-RIPE\n' +
        'mnt-by:TEST-MNT\n' +
        'last-modified: 2012-02-27T10:11:12Z\n'+
        'source:RIPE\n';


    const testPersonRpslScreen =
        'person:test person\n' +
        'address:Amsterdam\n' +
        'phone:+316\n' +
        'nic-hdl:TP-RIPE\n' +
        'mnt-by:TEST-MNT\n' +
        'source:RIPE\n';

    const testPersonRpslMissingPhone =
        'person:test person\n' +
        'address:Amsterdam\n' +
        'phone:\n' +
        'nic-hdl:TP-RIPE\n' +
        'mnt-by:TEST-MNT\n' +
        'source:RIPE\n';

    const testPersonObject = {
        objects: {
            object: [
                {
                    'primary-key': {attribute: [{name: 'nic-hdl', value: 'TP-RIPE'}]},
                    attributes: {
                        attribute: [
                            {name: 'person', value: 'test person'},
                            {name: 'address', value: 'Amsterdam'},
                            {name: 'phone', value: '+316'},
                            {name: 'nic-hdl', value: 'TP-RIPE'},
                            {name: 'mnt-by', value: 'TEST-MNT'},
                            {name: 'source', value: 'RIPE'}
                        ]
                    }
                }
            ]
        }
    };

    beforeEach(() => {
        paramMapMock = convertToParamMap({});
        queryParamMock = convertToParamMap({});
        preferencesServiceMock = jasmine.createSpyObj("PreferenceService", ["isTextMode", "setTextMode", "isWebMode", "setWebMode"]);
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        modalMock = jasmine.createSpyObj("NgbModal", ["open"]);
        modalMock.open.and.returnValue({componentInstance: {}, result: of().toPromise()});
        credentialsServiceMock = jasmine.createSpyObj("CredentialsService", ["hasCredentials", "getCredentials"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule],
            declarations: [TextModifyComponent, AlertsComponent],
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
                {provide: CredentialsService, useValue: credentialsServiceMock},
                PrefixService,
                {provide: NgbModal, useValue: modalMock},
                { provide: Location, useValue: {path: () => ""}},
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
        componentFixture = TestBed.createComponent(TextModifyComponent);
        textModifyComponent = componentFixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    const createParams = (objectType?: string, objectName?: string, noRedirect?: boolean, rpsl?: string) => {
        const paramMapSpy = spyOn(paramMapMock, "get");
        const queryParamHasSpy = spyOn(queryParamMock, "has");
        const queryParamGetSpy = spyOn(queryParamMock, "get");

        paramMapSpy.withArgs("source").and.returnValue(SOURCE);
        paramMapSpy.withArgs("objectType").and.returnValue(objectType ? objectType : OBJECT_TYPE);
        paramMapSpy.withArgs("objectName").and.returnValue(objectName ? objectName : OBJECT_NAME);
        queryParamHasSpy.withArgs("noRedirect").and.returnValue(noRedirect);
        if (rpsl) {
            queryParamHasSpy.withArgs("rpsl").and.returnValue(true);
            queryParamGetSpy.withArgs("rpsl").and.returnValue(rpsl);
        } else {
            queryParamHasSpy.withArgs("rpsl").and.returnValue(false);
        }
    };


    it('should get parameters from url', async () => {
        createParams();
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush(testPersonObject);
        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        await componentFixture.whenStable();
        expect(textModifyComponent.object.source).toBe(SOURCE);
        expect(textModifyComponent.object.type).toBe(OBJECT_TYPE);
        expect(textModifyComponent.object.name).toBe(OBJECT_NAME);
    });

    it('should get rpsl from url-parameter', async () => {
        preferencesServiceMock.isWebMode.and.returnValue(true);
        createParams('inetnum', "1", null, "inetnum:1\inetnum:2\n");
        componentFixture.detectChanges();
        await componentFixture.whenStable();
        expect(textModifyComponent.object.source).toBe(SOURCE);
        expect(textModifyComponent.object.type).toBe('inetnum');
        expect(textModifyComponent.object.rpsl).toBe('inetnum:1\inetnum:2\n');
    });

    it('should redirect to webupdates when web-preference is set', async () => {
        preferencesServiceMock.isWebMode.and.returnValue(true);
        createParams('person', 'TP-RIPE', false);
        componentFixture.detectChanges();

        // TODO wtf ? :D how this was working? it should redirect not call http
        // httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush(testPersonObject);
        // httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([{
        //     key: 'TEST-MNT',
        //     type: 'mntner',
        //     auth: ['SSO'],
        //     mine: true
        // }]);
        // await componentFixture.whenStable();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/modify/RIPE/person/TP-RIPE?noRedirect`);
    });

    it('should not redirect to webupdates no-redirect is set', async () => {
        preferencesServiceMock.isWebMode.and.returnValue(true);
        createParams('person', 'TP-RIPE', true);
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush(testPersonObject);
        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);
        await componentFixture.whenStable();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should populate fetched person object in rpsl area', async () => {
        createParams();
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush(testPersonObject);
        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        await componentFixture.whenStable();
        expect(textModifyComponent.object.rpsl).toEqual(testPersonRpslScreen);
    });

    it('should report an error when mandatory field is missing', async () => {
        createParams();
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush(testPersonObject);
        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        await componentFixture.whenStable();

        textModifyComponent.object.rpsl = testPersonRpslMissingPhone;
        textModifyComponent.submit();
        await componentFixture.whenStable();

        expect(textModifyComponent.alertService.getErrors()).toEqual([
            {plainText: 'phone: Mandatory attribute not set'},
        ]);

    });

    it('should navigate to display after successful submit', async () => {
        createParams();
        componentFixture.detectChanges();
        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush(testPersonObject);
        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        await componentFixture.whenStable();

        textModifyComponent.object.rpsl = testPersonRpsl;
        textModifyComponent.submit();
        await componentFixture.whenStable();

        httpMock.expectOne({method: "PUT", url: "api/whois/RIPE/person/TP-RIPE?unformatted=true"}).flush(testPersonObject);
        await componentFixture.whenStable();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/person/TP-RIPE?method=Modify`);
    });


    it('should navigate to delete after pressing delete button', async () => {
        createParams('route', '12.235.32.0%2F19AS1680');
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);
        //                    api/whois/RIPE/route/12.235.32.0%252F19AS1680?unfiltered=true&unformatted=true
        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true&unformatted=true"}).flush(routeJSON);
        await componentFixture.whenStable();

        textModifyComponent.deleteObject();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/delete/RIPE/route/12.235.32.0%2F19AS1680?onCancel=textupdates/modify`);
    });

    it('should navigate to display after successful submit with a slash', async () => {
        createParams('route', '12.235.32.0%2F19AS1680');
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);
        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true&unformatted=true"}).flush(routeJSON);
        await componentFixture.whenStable();
        textModifyComponent.submit();
        await componentFixture.whenStable();


        httpMock.expectOne({method: "PUT", url: "api/whois/RIPE/route/12.235.32.0/19AS1680?unformatted=true"}).flush(routeJSON);
        await componentFixture.whenStable();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/route/12.235.32.0%2F19AS1680?method=Modify`);
    });

    it('should report a fetch failure', async () => {
        createParams();
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);
        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush({
                "errormessages": {
                    "errormessage": [{
                        "severity": "Error",
                        "text": "ERROR:101: no entries found\n\nNo entries found in source %s.\n",
                        "args": [{"value": "RIPE"}]
                    }]
                }
            }
        , {status: 400, statusText: "bad request"});


        await componentFixture.whenStable();

        const plaintextErrors = _.map(textModifyComponent.alertService.getErrors(), (item) => ({plainText: item.plainText}));
        expect(plaintextErrors).toEqual([
                {plainText: 'ERROR:101: no entries found\n\nNo entries found in source RIPE.\n'}]
        );
    });

    it('should give warning if fetching SSO mntners fails', async () => {
        createParams();
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush(testPersonObject);
        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([], {statusText: "503", status: 503});

        await componentFixture.whenStable();

        expect(textModifyComponent.alertService.getErrors().length).toEqual(1);
        const plaintextErrors = _.map(textModifyComponent.alertService.getErrors(), (item) => ({plainText: item.plainText}));
        expect(plaintextErrors).toEqual([
            {plainText: 'Error fetching maintainers associated with this SSO account'}
        ]);

    });

    it('should show error after submit failure with incorrect attr', async () => {
        createParams();
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush(testPersonObject);
        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        await componentFixture.whenStable();
        textModifyComponent.object.rpsl = testPersonRpsl;
        textModifyComponent.submit();
        await componentFixture.whenStable();

        httpMock.expectOne({method: "PUT", url: "api/whois/RIPE/person/TP-RIPE?unformatted=true"}).flush({
            objects: {
                object: [
                    {
                        'primary-key': {attribute: [{name: 'nic-hdl', value: 'TP-RIPE'}]},
                        attributes: {
                            attribute: [
                                {name: 'person', value: 'test person'},
                                {name: 'address', value: 'Amsterdam'},
                                {name: 'phone', value: '+316'},
                                {name: 'nic-hdl', value: 'TP-RIPE'},
                                {name: 'mnt-by', value: 'TEST-MNT'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            },
            errormessages: {
                errormessage: [
                    {
                        severity: 'Error',
                        text: '"%s" is not valid for this object type',
                        'args': [{value: 'mnt-ref'}]
                    }]

            }
        }, {status: 400, statusText: "bad request"});

        await componentFixture.whenStable();

        expect(textModifyComponent.alertService.getErrors().length).toEqual(1);
        const plaintextErrors = _.map(textModifyComponent.alertService.getErrors(), (item) => ({plainText: item.plainText}));
        expect(plaintextErrors).toEqual([
            {plainText: '"mnt-ref" is not valid for this object type'}
        ]);

        expect(textModifyComponent.object.rpsl).toEqual(testPersonRpsl);
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should extract password from rpsl', async () => {
        modalMock.open.and.returnValue({componentInstance: {}, result: of({selectedItem:{key:'TEST-MNT', name:'mntner', mine:true}}).toPromise()});
        createParams();
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush(testPersonObject);
        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([]);

        await componentFixture.whenStable();
        credentialsServiceMock.hasCredentials.and.returnValue(true);
        textModifyComponent.object.rpsl = testPersonRpsl + 'password:secret2\n';

        expect(modalMock.open).toHaveBeenCalled();
        credentialsServiceMock.getCredentials.and.returnValue({mntner: "TEST-MNT", successfulPassword: "secret"});

        textModifyComponent.submit();
        await componentFixture.whenStable();

        const req1 = httpMock.expectOne({method: "PUT", url: "api/whois/RIPE/person/TP-RIPE?password=secret2&password=secret&unformatted=true"});
        req1.flush(testPersonObject);
        await componentFixture.whenStable();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/person/TP-RIPE?method=Modify`);
    });

    it('should present password popup when trying to modify object with no sso mnt-by ', async () => {
        createParams();
        componentFixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true"}).flush(testPersonObject);
        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {'key': 'TESTSSO-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);
        await componentFixture.whenStable();

        textModifyComponent.object.rpsl = testPersonRpsl;
        expect(modalMock.open).toHaveBeenCalled();
    });

    it('should re-fetch maintainer after authentication', async () => {
        modalMock.open.and.returnValue({componentInstance: {}, result: of({selectedItem:{key:'TEST-MNT', name:'mntner', mine:true}}).toPromise()});

        createParams("mntner", "TEST-MNT");
        componentFixture.detectChanges();


        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/mntner/TEST-MNT?unfiltered=true&unformatted=true"}).flush(
            {
                    objects: {
                        object: [
                            {
                                'primary-key': {attribute: [{name: 'mntner', value: 'TEST-MNT'}]},
                                attributes: {
                                    attribute: [
                                        {name: 'mntner', value: 'TEST-MNT'},
                                        {name: 'descr', value: '.'},
                                        {name: 'admin-c', value: 'TP-RIPE'},
                                        {name: 'upd-to', value: 'email@email.com'},
                                        {name: 'auth', value: 'MD5-PW first fetch'},
                                        {name: 'mnt-by', value: 'TEST-MNT'},
                                        {name: 'source', value: 'RIPE'}
                                    ]
                                }
                            }
                        ]
                    }

                });

        httpMock.expectOne({method: "GET", url: "api/user/mntners"}).flush([
            {'key': 'TESTSSO-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);

        credentialsServiceMock.hasCredentials.and.returnValue(true);
        credentialsServiceMock.getCredentials.and.returnValue({mntner: "TEST-MNT", successfulPassword: "secret"});
        await componentFixture.whenStable();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/mntner/TEST-MNT?password=secret&unfiltered=true&unformatted=true"}).flush({
                    objects: {
                        object: [
                            {
                                'primary-key': {attribute: [{name: 'mntner', value: 'TEST-MNT'}]},
                                attributes: {
                                    attribute: [
                                        {name: 'mntner', value: 'TEST-MNT'},
                                        {name: 'descr', value: '.'},
                                        {name: 'admin-c', value: 'TP-RIPE'},
                                        {name: 'upd-to', value: 'email@email.com'},
                                        {name: 'auth', value: 'MD5-PW authenticated refetch'},
                                        {name: 'mnt-by', value: 'TEST-MNT'},
                                        {name: 'source', value: 'RIPE'}
                                    ]
                                }
                            }
                        ]
                    }
            });



        await componentFixture.whenStable();

        expect(modalMock.open).toHaveBeenCalled();
        expect(textModifyComponent.object.rpsl).toEqual('mntner:TEST-MNT\n' +
            'descr:.\n' +
            'admin-c:TP-RIPE\n' +
            'upd-to:email@email.com\n' +
            'auth:MD5-PW authenticated refetch\n' +
            'mnt-by:TEST-MNT\n' +
            'source:RIPE\n');

    });

    const routeJSON = {
        objects: {
            object: [
                {
                    'primary-key': {attribute: [{name: 'route', value: '12.235.32.0/19AS1680'}]},
                    attributes: {
                        attribute: [
                            {name: 'route', value: '12.235.32.0/19AS1680'},
                            {name: 'descr', value: 'My descr'},
                            {name: 'origin', value: 'AS123'},
                            {name: 'mnt-by', value: 'TEST-MNT'},
                            {name: 'source', value: 'RIPE'}
                        ]
                    }
                }
            ]
        }

    };

});
