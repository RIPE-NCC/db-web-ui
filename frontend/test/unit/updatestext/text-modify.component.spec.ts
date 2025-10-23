import { Location } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, convertToParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { EMPTY } from 'rxjs';
import { PrefixService } from '../../../src/app/domainobject/prefix.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { CredentialsService } from '../../../src/app/shared/credentials.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { IMntByModel } from '../../../src/app/shared/whois-response-type.model';
import { RpslService } from '../../../src/app/updatestext/rpsl.service';
import { TextCommonsService } from '../../../src/app/updatestext/text-commons.service';
import { TextModifyComponent } from '../../../src/app/updatestext/text-modify.component';
import { ErrorReporterService } from '../../../src/app/updatesweb/error-reporter.service';
import { MessageStoreService } from '../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../src/app/updatesweb/mntner.service';
import { PreferenceService } from '../../../src/app/updatesweb/preference.service';
import { RestService } from '../../../src/app/updatesweb/rest.service';
import { WhoisObjectModule } from '../../../src/app/whois-object/whois-object.module';
import { routeJSON } from './mock-test-data';

describe('TextModifyComponent', () => {
    const SOURCE = 'RIPE';
    const OBJECT_NAME = 'TST08-RIPE';
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
        'nic-hdl:TST08-RIPE\n' +
        'mnt-by:TEST-MNT\n' +
        'last-modified: 2012-02-27T10:11:12Z\n' +
        'source:RIPE\n';

    const testPersonObject = {
        objects: {
            object: [
                {
                    'primary-key': { attribute: [{ name: 'nic-hdl', value: 'TST08-RIPE' }] },
                    attributes: {
                        attribute: [
                            { name: 'person', value: 'test person' },
                            { name: 'address', value: 'Amsterdam' },
                            { name: 'phone', value: '+316' },
                            { name: 'nic-hdl', value: 'TST08-RIPE' },
                            { name: 'mnt-by', value: 'TEST-MNT' },
                            { name: 'source', value: 'RIPE' },
                        ],
                    },
                },
            ],
        },
    };

    const mntrMock: IMntByModel[] = [
        {
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true,
        },
    ];

    afterAll(() => {
        TestBed.resetTestingModule();
    });

    beforeEach(() => {
        paramMapMock = convertToParamMap({});
        queryParamMock = convertToParamMap({});
        preferencesServiceMock = jasmine.createSpyObj('PreferenceService', ['isTextMode', 'setTextMode', 'isWebMode', 'setWebMode']);
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        modalMock = jasmine.createSpyObj('NgbModal', ['open']);
        modalMock.open.and.returnValue({ componentInstance: {}, closed: EMPTY, dismissed: EMPTY });
        credentialsServiceMock = jasmine.createSpyObj('CredentialsService', ['hasCredentials', 'getCredentials', 'getPasswordsForRestCall']);
        TestBed.configureTestingModule({
            imports: [FormsModule, SharedModule, WhoisObjectModule, TextModifyComponent],
            providers: [
                { provide: PreferenceService, useValue: preferencesServiceMock },
                WhoisResourcesService,
                WhoisMetaService,
                RestService,
                ErrorReporterService,
                MessageStoreService,
                RpslService,
                MntnerService,
                TextCommonsService,
                { provide: CredentialsService, useValue: credentialsServiceMock },
                PrefixService,
                PropertiesService,
                { provide: NgbModal, useValue: modalMock },
                { provide: Location, useValue: { path: () => '' } },
                { provide: Router, useValue: routerMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: paramMapMock,
                            queryParamMap: queryParamMock,
                        },
                    },
                },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(TextModifyComponent);
        textModifyComponent = componentFixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    const createParams = (objectType?: string, objectName?: string, noRedirect?: boolean, rpsl?: string) => {
        const paramMapSpy = spyOn(paramMapMock, 'get');
        const queryParamHasSpy = spyOn(queryParamMock, 'has');
        const queryParamGetSpy = spyOn(queryParamMock, 'get');

        paramMapSpy.withArgs('source').and.returnValue(SOURCE);
        paramMapSpy.withArgs('objectType').and.returnValue(objectType ? objectType : OBJECT_TYPE);
        paramMapSpy.withArgs('objectName').and.returnValue(objectName ? objectName : OBJECT_NAME);
        queryParamHasSpy.withArgs('noRedirect').and.returnValue(noRedirect);
        if (rpsl) {
            queryParamHasSpy.withArgs('rpsl').and.returnValue(true);
            queryParamGetSpy.withArgs('rpsl').and.returnValue(rpsl);
        } else {
            queryParamHasSpy.withArgs('rpsl').and.returnValue(false);
        }
    };

    it('should get parameters from url', async () => {
        createParams();
        componentFixture.detectChanges();
        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(testPersonObject);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);

        await componentFixture.whenStable();
        expect(textModifyComponent.object.source).toBe(SOURCE);
        expect(textModifyComponent.object.type).toBe(OBJECT_TYPE);
        expect(textModifyComponent.object.name).toBe(OBJECT_NAME);
    });

    it('should get rpsl from url-parameter', async () => {
        preferencesServiceMock.isWebMode.and.returnValue(true);
        createParams('inetnum', '1', null, 'inetnum:1inetnum:2\n');
        componentFixture.detectChanges();
        await componentFixture.whenStable();
        expect(textModifyComponent.object.source).toBe(SOURCE);
        expect(textModifyComponent.object.type).toBe('inetnum');
        expect(textModifyComponent.object.rpsl).toBe('inetnum:1inetnum:2\n');
    });

    it('should redirect to webupdates when web-preference is set', async () => {
        preferencesServiceMock.isWebMode.and.returnValue(true);
        createParams('person', 'TST08-RIPE', false);
        componentFixture.detectChanges();
        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(testPersonObject);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);

        await componentFixture.whenStable();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/modify/RIPE/person/TST08-RIPE?noRedirect`);
    });

    it('should not redirect to webupdates no-redirect is set', async () => {
        preferencesServiceMock.isWebMode.and.returnValue(true);
        createParams('person', 'TST08-RIPE', true);
        componentFixture.detectChanges();
        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(testPersonObject);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);

        await componentFixture.whenStable();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to display after successful submit', async () => {
        createParams();
        componentFixture.detectChanges();
        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(testPersonObject);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([]);

        await componentFixture.whenStable();

        textModifyComponent.object.rpsl = testPersonRpsl;
        textModifyComponent.submit(testPersonObject);
        await componentFixture.whenStable();

        await componentFixture.whenStable();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/person/TST08-RIPE?method=Modify`);
    });

    it('should navigate to delete after pressing delete button', async () => {
        createParams('route', '12.235.32.0%2F19AS1680');
        componentFixture.detectChanges();

        await componentFixture.whenStable();
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);
        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true&unformatted=true',
            })
            .flush(routeJSON);
        textModifyComponent.deleteObject();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/delete/RIPE/route/12.235.32.0%2F19AS1680?onCancel=textupdates/modify`);
    });

    it('should navigate to display after successful submit with a slash', async () => {
        createParams('route', '12.235.32.0%2F19AS1680');
        componentFixture.detectChanges();
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);
        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true&unformatted=true',
            })
            .flush(routeJSON);
        await componentFixture.whenStable();
        textModifyComponent.submit(routeJSON);

        await componentFixture.whenStable();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/route/12.235.32.0%2F19AS1680?method=Modify`);
    });

    it('should report a fetch failure', async () => {
        createParams();
        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);
        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(
                {
                    errormessages: {
                        errormessage: [
                            {
                                severity: 'Error',
                                text: 'ERROR:101: no entries found\n\nNo entries found in source %s.\n',
                                args: [{ value: 'RIPE' }],
                            },
                        ],
                    },
                },
                { status: 400, statusText: 'bad request' },
            );

        await componentFixture.whenStable();

        const plaintextErrors = _.map(textModifyComponent.alertsServices.alerts.errors, (item) => ({ plainText: item.plainText }));
        expect(plaintextErrors).toEqual([{ plainText: 'ERROR:101: no entries found\n\nNo entries found in source RIPE.\n' }]);
    });

    it('should show error after submit failure with incorrect attr', async () => {
        createParams();
        componentFixture.detectChanges();

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(testPersonObject);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);

        await componentFixture.whenStable();
        textModifyComponent.object.rpsl = testPersonRpsl;
        const errorRespons = {
            data: {
                objects: {
                    object: [
                        {
                            'primary-key': { attribute: [{ name: 'nic-hdl', value: 'TST08-RIPE' }] },
                            attributes: {
                                attribute: [
                                    { name: 'person', value: 'test person' },
                                    { name: 'address', value: 'Amsterdam' },
                                    { name: 'phone', value: '+316' },
                                    { name: 'nic-hdl', value: 'TST08-RIPE' },
                                    { name: 'mnt-by', value: 'TEST-MNT' },
                                    { name: 'source', value: 'RIPE' },
                                ],
                            },
                        },
                    ],
                },
                errormessages: {
                    errormessage: [
                        {
                            severity: 'Error',
                            text: `"%s" is not valid for this object type`,
                            args: [{ value: 'mnt-ref' }],
                        },
                    ],
                },
            },
        };
        textModifyComponent.submit(errorRespons);

        await componentFixture.whenStable();

        expect(textModifyComponent.alertsServices.alerts.errors.length).toEqual(1);
        const plaintextErrors = _.map(textModifyComponent.alertsServices.alerts.errors, (item) => ({ plainText: item.plainText }));
        expect(plaintextErrors).toEqual([{ plainText: `"mnt-ref" is not valid for this object type` }]);

        expect(textModifyComponent.object.rpsl).toEqual(testPersonRpsl);
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });
});
