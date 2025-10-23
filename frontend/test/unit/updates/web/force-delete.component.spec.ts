import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, convertToParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY } from 'rxjs';
import { PrefixService } from '../../../../src/app/domainobject/prefix.service';
import { PropertiesService } from '../../../../src/app/properties.service';
import { AlertsService } from '../../../../src/app/shared/alert/alerts.service';
import { CredentialsService } from '../../../../src/app/shared/credentials.service';
import { WhoisMetaService } from '../../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../../src/app/shared/whois-resources.service';
import { ForceDeleteComponent } from '../../../../src/app/updatesweb/forcedelete/force-delete.component';
import { MntnerService } from '../../../../src/app/updatesweb/mntner.service';
import { RestService } from '../../../../src/app/updatesweb/rest.service';
import { WebUpdatesCommonsService } from '../../../../src/app/updatesweb/web-updates-commons.service';

let paramMapMock: ParamMap;
let queryParamMock: ParamMap;

const createParams = (source: string, objectType: string, objectName: string) => {
    const paramMapGetSpy = spyOn(paramMapMock, 'get');
    const paramMapHasSpy = spyOn(paramMapMock, 'has');

    if (source) {
        paramMapHasSpy.withArgs('source').and.returnValue(true);
        paramMapGetSpy.withArgs('source').and.returnValue(source);
    } else {
        paramMapHasSpy.withArgs('source').and.returnValue(false);
        paramMapGetSpy.withArgs('source').and.returnValue(undefined);
    }
    if (objectType) {
        paramMapHasSpy.withArgs('objectType').and.returnValue(true);
        paramMapGetSpy.withArgs('objectType').and.returnValue(objectType);
    } else {
        paramMapHasSpy.withArgs('objectType').and.returnValue(false);
    }
    if (objectName) {
        paramMapHasSpy.withArgs('objectName').and.returnValue(true);
        paramMapGetSpy.withArgs('objectName').and.returnValue(objectName);
    } else {
        paramMapHasSpy.withArgs('objectName').and.returnValue(false);
    }
};

describe('ForceDeleteController', () => {
    const INETNUM = '111 - 255';
    const SOURCE = 'RIPE';

    let objectToDisplay: any;

    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ForceDeleteComponent>;
    let forceDeleteComponent: ForceDeleteComponent;
    let routerMock: any;
    let credentialsServiceMock: any;
    let whoisResourcesService: WhoisResourcesService;

    afterAll(() => {
        TestBed.resetTestingModule();
    });

    beforeEach(() => {
        paramMapMock = convertToParamMap({});
        queryParamMock = convertToParamMap({});
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        credentialsServiceMock = jasmine.createSpyObj('CredentialsService', ['hasCredentials', 'getCredentials']);
        credentialsServiceMock.hasCredentials.and.returnValue(true);
        credentialsServiceMock.getCredentials.and.returnValue({ mntner: 'TEST-MNT', successfulPassword: '@123' });
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

        TestBed.configureTestingModule({
            imports: [FormsModule, ForceDeleteComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: paramMapMock,
                            queryParamMap: queryParamMock,
                        },
                    },
                },
                { provide: Router, useValue: routerMock },
                { provide: CredentialsService, useValue: credentialsServiceMock },
                AlertsService,
                MntnerService,
                RestService,
                WebUpdatesCommonsService,
                WhoisResourcesService,
                WhoisMetaService,
                PrefixService,
                PropertiesService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        whoisResourcesService = TestBed.inject(WhoisResourcesService);
        objectToDisplay = whoisResourcesService.validateWhoisResources({
            objects: {
                object: [
                    {
                        'primary-key': { attribute: [{ name: 'inetnum', value: INETNUM }] },
                        attributes: {
                            attribute: [
                                { name: 'inetnum', value: INETNUM },
                                { name: 'mnt-by', value: 'TEST-MNT' },
                                { name: 'descr', value: 'description' },
                                { name: 'source', value: 'RIPE' },
                            ],
                        },
                    },
                ],
            },
        });
        componentFixture = TestBed.createComponent(ForceDeleteComponent);
        forceDeleteComponent = componentFixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    const expectHttpCalls = async () => {
        await componentFixture.whenStable();
        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/inetnum/111%20-%20255?unfiltered=true' }).flush(objectToDisplay);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);
        httpMock.expectOne({ method: 'DELETE', url: 'api/whois/RIPE/inetnum/111%20-%20255?dry-run=true&reason=dry-run' }).flush({
            errormessages: {
                errormessage: [
                    {
                        severity: 'Error',
                        text: `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`,
                        args: [{ value: 'inetnum' }, { value: '194.219.52.240 - 194.219.52.243' }, { value: 'mnt-by' }, { value: 'TESTSSO-MNT' }],
                    },
                    {
                        severity: 'Error',
                        text: `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`,
                        args: [{ value: 'inetnum' }, { value: '194.219.0.0 - 194.219.255.255' }, { value: 'mnt-lower' }, { value: 'TEST1-MNT' }],
                    },
                    {
                        severity: 'Error',
                        text: `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`,
                        args: [{ value: 'inetnum' }, { value: '194.219.0.0 - 194.219.255.255' }, { value: 'mnt-by' }, { value: 'RIPE-NCC-HM-MNT, TEST2-MNT' }],
                    },
                    {
                        severity: 'Info',
                        text: 'Dry-run performed, no changes to the database have been made',
                    },
                ],
            },
        });
        await componentFixture.whenStable();
    };

    it('should get objectType, source and name from url', async () => {
        createParams(SOURCE, 'inetnum', '111%20-%20255');
        componentFixture.detectChanges();

        await expectHttpCalls();

        expect(forceDeleteComponent.object.type).toBe('inetnum');
        expect(forceDeleteComponent.object.source).toBe(SOURCE);
        expect(forceDeleteComponent.object.name).toBe(INETNUM);
    });

    it('should populate the ui with attributes', async () => {
        createParams(SOURCE, 'inetnum', '111%20-%20255');
        componentFixture.detectChanges();

        await expectHttpCalls();

        expect(whoisResourcesService.getSingleAttributeOnName(forceDeleteComponent.object.attributes, 'inetnum').value).toBe(INETNUM);
        expect(whoisResourcesService.getSingleAttributeOnName(forceDeleteComponent.object.attributes, 'descr').value).toEqual('description');
        expect(whoisResourcesService.getSingleAttributeOnName(forceDeleteComponent.object.attributes, 'source').value).toEqual(SOURCE);
    });

    it('should transition to display state if cancel is pressed', async () => {
        createParams(SOURCE, 'inetnum', '111%20-%20255');
        componentFixture.detectChanges();

        await expectHttpCalls();

        forceDeleteComponent.cancel();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('webupdates/display/RIPE/inetnum/111%20-%20255');
    });

    it('should have errors on wrong type', () => {
        createParams(SOURCE, 'mntner', 'TST02-MNT');
        componentFixture.detectChanges();

        expect(forceDeleteComponent.alertsService.alerts.errors[0].plainText).toBe(
            'Only inetnum, inet6num, route, route6, domain object types are force-deletable',
        );
    });

    it('should show error on missing object key', () => {
        createParams(SOURCE, 'inetnum', undefined);
        componentFixture.detectChanges();

        expect(forceDeleteComponent.alertsService.alerts.errors[0].plainText).toBe('Object key is missing');
    });

    it('should show error on missing source', () => {
        createParams(undefined, 'inetnum', 'asdf');
        componentFixture.detectChanges();

        expect(forceDeleteComponent.alertsService.alerts.errors[0].plainText).toBe('Source is missing');
    });

    it('should go to delete controler on reclaim', async () => {
        createParams(SOURCE, 'inetnum', '111%20-%20255');
        componentFixture.detectChanges();

        await expectHttpCalls();

        forceDeleteComponent.forceDelete();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('webupdates/delete/RIPE/inetnum/111%20-%20255?onCancel=webupdates.forceDelete');
    });
});

describe('ForceDeleteController should be able to handle escape objected with slash', () => {
    const NAME = '12.235.32.0%2F19AS1680';
    const SOURCE = 'RIPE';
    const OBJECT_TYPE = 'route';

    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ForceDeleteComponent>;
    let forceDeleteComponent: ForceDeleteComponent;
    let routerMock: any;
    let credentialsServiceMock: any;
    let modalMock: any;

    beforeEach(() => {
        paramMapMock = convertToParamMap({});
        queryParamMock = convertToParamMap({});
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        credentialsServiceMock = jasmine.createSpyObj('CredentialsService', ['hasCredentials', 'getCredentials']);
        credentialsServiceMock.hasCredentials.and.returnValue(false);
        credentialsServiceMock.getCredentials.and.returnValue({ mntner: undefined, successfulPassword: undefined });
        modalMock = jasmine.createSpyObj('NgbModal', ['open']);
        modalMock.open.and.returnValue({ componentInstance: {}, closed: EMPTY, dismissed: EMPTY });
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        TestBed.configureTestingModule({
            imports: [FormsModule, ForceDeleteComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: paramMapMock,
                            queryParamMap: queryParamMock,
                        },
                    },
                },
                { provide: Router, useValue: routerMock },
                { provide: CredentialsService, useValue: credentialsServiceMock },
                { provide: NgbModal, useValue: modalMock },
                AlertsService,
                MntnerService,
                RestService,
                WebUpdatesCommonsService,
                WhoisResourcesService,
                WhoisMetaService,
                PrefixService,
                PropertiesService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(ForceDeleteComponent);
        forceDeleteComponent = componentFixture.componentInstance;
    });

    it('should get parameters from url', async () => {
        createParams(SOURCE, OBJECT_TYPE, NAME);
        componentFixture.detectChanges();

        await componentFixture.whenStable();
        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true' }).flush(objectToDisplay);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);
        httpMock
            .expectOne({ method: 'DELETE', url: 'api/whois/RIPE/route/12.235.32.0%2F19AS1680?dry-run=true&reason=dry-run' })
            .flush(dryRunDeleteFailure, { statusText: 'error', status: 403 });
        httpMock
            .expectOne({ method: 'GET', url: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT' })
            .flush([{ key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW'] }]);
        httpMock
            .expectOne({ method: 'GET', url: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST1-MNT' })
            .flush([{ key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW'] }]);
        httpMock
            .expectOne({ method: 'GET', url: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST2-MNT' })
            .flush([{ key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW'] }]);
        await componentFixture.whenStable();

        expect(forceDeleteComponent.object.source).toBe(SOURCE);
        expect(forceDeleteComponent.object.type).toBe('route');
        expect(forceDeleteComponent.object.name).toBe('12.235.32.0/19AS1680');
    });

    it('should present auth popup', async () => {
        createParams(SOURCE, OBJECT_TYPE, NAME);
        componentFixture.detectChanges();

        await componentFixture.whenStable();

        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true' }).flush(objectToDisplay);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);

        httpMock
            .expectOne({ method: 'DELETE', url: 'api/whois/RIPE/route/12.235.32.0%2F19AS1680?dry-run=true&reason=dry-run' })
            .flush(dryRunDeleteFailure, { statusText: 'error', status: 403 });
        httpMock
            .expectOne({ method: 'GET', url: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT' })
            .flush([{ key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW'] }]);
        httpMock
            .expectOne({ method: 'GET', url: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST1-MNT' })
            .flush([{ key: 'TEST1-MNT', type: 'mntner', auth: ['MD5-PW'] }]);
        httpMock
            .expectOne({ method: 'GET', url: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST2-MNT' })
            .flush([{ key: 'TEST2-MNT', type: 'mntner', auth: ['MD5-PW'] }]);
        await componentFixture.whenStable();

        forceDeleteComponent.forceDelete();

        await componentFixture.whenStable();

        expect(modalMock.open).toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });

    const objectToDisplay = {
        objects: {
            object: [
                {
                    'primary-key': { attribute: [{ name: 'route', value: '12.235.32.0/19AS1680' }] },
                    attributes: {
                        attribute: [
                            { name: 'route', value: '12.235.32.0/19AS1680' },
                            { name: 'mnt-by', value: 'TEST-MNT' },
                            { name: 'source', value: 'RIPE' },
                        ],
                    },
                },
            ],
        },
    };

    const dryRunDeleteFailure = {
        errormessages: {
            errormessage: [
                {
                    severity: 'Error',
                    text: `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`,
                    args: [{ value: 'inetnum' }, { value: '194.219.52.240 - 194.219.52.243' }, { value: 'mnt-by' }, { value: 'TEST-MNT' }],
                },
                {
                    severity: 'Error',
                    text: `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`,
                    args: [{ value: 'inetnum' }, { value: '194.219.0.0 - 194.219.255.255' }, { value: 'mnt-lower' }, { value: 'TEST1-MNT' }],
                },
                {
                    severity: 'Error',
                    text: `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`,
                    args: [{ value: 'inetnum' }, { value: '194.219.0.0 - 194.219.255.255' }, { value: 'mnt-by' }, { value: 'RIPE-NCC-HM-MNT, TEST2-MNT' }],
                },
                {
                    severity: 'Info',
                    text: 'Dry-run performed, no changes to the database have been made',
                },
            ],
        },
    };
});
