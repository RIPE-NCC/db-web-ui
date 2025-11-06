import { Location } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import { EMPTY, of } from 'rxjs';
import { AttributeMetadataService } from '../../../../src/app/attribute/attribute-metadata.service';
import { AttributeSharedService } from '../../../../src/app/attribute/attribute-shared.service';
import { PrefixService } from '../../../../src/app/domainobject/prefix.service';
import { ResourceStatusService } from '../../../../src/app/myresources/resource-status.service';
import { PropertiesService } from '../../../../src/app/properties.service';
import { WhoisMetaService } from '../../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../../src/app/shared/whois-resources.service';
import { CharsetToolsService } from '../../../../src/app/updatesweb/charset-tools.service';
import { CreateModifyComponent } from '../../../../src/app/updatesweb/create-modify.component';
import { EnumService } from '../../../../src/app/updatesweb/enum.service';
import { ErrorReporterService } from '../../../../src/app/updatesweb/error-reporter.service';
import { LinkService } from '../../../../src/app/updatesweb/link.service';
import { MessageStoreService } from '../../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../../src/app/updatesweb/mntner.service';
import { OrganisationHelperService } from '../../../../src/app/updatesweb/organisation-helper.service';
import { PreferenceService } from '../../../../src/app/updatesweb/preference.service';
import { RestService } from '../../../../src/app/updatesweb/rest.service';
import { ScreenLogicInterceptorService } from '../../../../src/app/updatesweb/screen-logic-interceptor.service';
import { WebUpdatesCommonsService } from '../../../../src/app/updatesweb/web-updates-commons.service';

describe('CreateModifyComponent', () => {
    let httpMock: HttpTestingController;
    let fixture: ComponentFixture<CreateModifyComponent>;
    let component: CreateModifyComponent;
    let routerMock: any;
    let modalMock: any;
    let paramMapMock: any;

    beforeEach(() => {
        modalMock = jasmine.createSpyObj('NgbModal', ['open']);
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        paramMapMock = convertToParamMap({});
        TestBed.configureTestingModule({
            imports: [NgSelectModule, CreateModifyComponent],
            providers: [
                PrefixService,
                ResourceStatusService,
                WebUpdatesCommonsService,
                PropertiesService,
                OrganisationHelperService,
                WhoisResourcesService,
                AttributeSharedService,
                AttributeMetadataService,
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
                ResourceStatusService,
                { provide: Location, useValue: { path: () => '' } },
                { provide: Router, useValue: routerMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: paramMapMock,
                            queryParamMap: {
                                has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param],
                            },
                        },
                    },
                },
                { provide: NgbModal, useValue: modalMock },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(CreateModifyComponent);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('with TEST-MNT', () => {
        const SOURCE = 'RIPE';
        const OBJECT_TYPE = 'as-block';

        beforeEach(async () => {
            paramMapMock.source = SOURCE;
            paramMapMock.objectType = OBJECT_TYPE;
            spyOn(paramMapMock, 'get').and.callFake((param) => {
                return component.activatedRoute.snapshot.paramMap[param];
            });
            spyOn(paramMapMock, 'has').and.callFake((param) => {
                return !!component.activatedRoute.snapshot.paramMap[param];
            });
            component = fixture.componentInstance;
            spyOn(component.restService, 'fetchMntnersForSSOAccount').and.returnValue(of(USER_MAINTAINERS_MOCK));
            fixture.detectChanges();
            await fixture.whenStable();
        });

        it('should get objectType from url', () => {
            expect(component.objectType).toBe(OBJECT_TYPE);
        });

        it('should get source from url', async () => {
            await fixture.whenStable();
            expect(component.source).toBe(SOURCE);
        });

        it('should populate mntner data', () => {
            expect(component.maintainers.sso.length).toBe(1);
            expect(component.maintainers.objectOriginal.length).toBe(0);
            expect(component.maintainers.object.length).toBe(1);

            expect(component.maintainers.sso[0].key).toEqual('TEST-MNT');
            expect(component.maintainers.sso[0].type).toEqual('mntner');
            expect(component.maintainers.sso[0].auth).toEqual(['SSO']);
            expect(component.maintainers.sso[0].mine).toEqual(true);

            expect(component.maintainers.object[0].key).toEqual('TEST-MNT');
            expect(component.maintainers.object[0].type).toEqual('mntner');
            expect(component.maintainers.object[0].auth).toEqual(['SSO']);
            expect(component.maintainers.object[0].mine).toEqual(true);

            expect(component.attributes.length).toBe(3);

            expect(component.attributes[1].name).toEqual('mnt-by');
            expect(component.attributes[1].value).toEqual('TEST-MNT');
        });

        it('should populate the ui based on object-type meta model and source', () => {
            const stateBefore = component.activatedRoute.snapshot.paramMap.get('objectName');

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').$$error).toBeUndefined();
            expect(component.whoisResourcesService.getAllAttributesWithValueOnName(component.attributes, 'mnt-by')[0].value).toEqual('TEST-MNT');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'source').value).toEqual('RIPE');

            expect(component.activatedRoute.snapshot.paramMap.get('objectName')).toBe(stateBefore);
        });

        it('should display field specific errors upon submit click on form with missing values', () => {
            const stateBefore = component.activatedRoute.snapshot.paramMap.get('objectName');

            component.submit();
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').$$error).toEqual('Mandatory attribute not set');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').value).toEqual('');

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'source').value).toEqual('RIPE');

            expect(component.activatedRoute.snapshot.paramMap.get('objectName')).toBe(stateBefore);
        });

        it('should handle success post upon submit click when form is complete', async () => {
            const DUMMY_RESPONSE = {
                objects: {
                    object: [
                        {
                            'primary-key': { attribute: [{ name: 'as-block', value: 'MY-AS-BLOCK' }] },
                            attributes: {
                                attribute: [
                                    { name: 'as-block', value: 'MY-AS-BLOCK' },
                                    { name: 'mnt-by', value: 'TEST-MNT' },
                                    { name: 'source', value: 'RIPE' },
                                ],
                            },
                        },
                    ],
                },
            };

            component.credentialsService.setCredentials('TEST-MNT', '@123');
            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'as-block', 'A');
            component.submit();

            httpMock.expectOne({ method: 'POST', url: 'api/whois/RIPE/as-block?password=%40123' }).flush(DUMMY_RESPONSE);
            fixture.detectChanges();

            const resp = component.messageStoreService.get('MY-AS-BLOCK');
            expect(component.whoisResourcesService.getPrimaryKey(resp)).toEqual('MY-AS-BLOCK');
            const attrs = component.whoisResourcesService.validateAttributes(component.whoisResourcesService.getAttributes(resp));
            expect(component.whoisResourcesService.getSingleAttributeOnName(attrs, 'as-block').value).toEqual('MY-AS-BLOCK');
            expect(WhoisResourcesService.getAllAttributesOnName(attrs, 'mnt-by')[0].value).toEqual('TEST-MNT');
            expect(component.whoisResourcesService.getSingleAttributeOnName(attrs, 'source').value).toEqual('RIPE');

            await fixture.whenStable();
            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('webupdates/display/RIPE/as-block/MY-AS-BLOCK?method=Create');
        });

        it('should handle error post upon submit click when form is complete', async () => {
            const stateBefore = component.activatedRoute.snapshot.paramMap.get('objectName');

            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'as-block', 'A');
            component.submit();

            await fixture.whenStable();
            httpMock.expectOne({ method: 'POST', url: 'api/whois/RIPE/as-block' }).flush(WHOIS_OBJECT_WITH_ERRORS_MOCK, { status: 400, statusText: 'error' });
            expect(component.alertsService.alerts.errors).toHaveSize(2);
            expect(component.alertsService.alerts.errors[0].plainText).toEqual('Creation of as-block failed, please see below for more details');
            expect(component.alertsService.alerts.errors[1].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
            expect(component.alertsService.alerts.warnings[0].plainText).toEqual('Not authenticated');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').$$error).toEqual(
                "'MY-AS-BLOCK' is not valid for this object type",
            );

            expect(component.activatedRoute.snapshot.paramMap.get('objectName')).toBe(stateBefore);
        });

        it('should reload defaults after error', async () => {
            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'as-block', 'A');
            component.submit();

            httpMock.expectOne({ method: 'POST', url: 'api/whois/RIPE/as-block' }).flush(WHOIS_OBJECT_WITH_ERRORS_MOCK, { status: 400, statusText: 'error' });
            await fixture.whenStable();

            expect(component.alertsService.alerts.errors).toHaveSize(2);
            expect(component.alertsService.alerts.errors[0].plainText).toEqual('Creation of as-block failed, please see below for more details');
            expect(component.alertsService.alerts.errors[1].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
            expect(component.alertsService.alerts.warnings[0].plainText).toEqual('Not authenticated');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').$$error).toEqual(
                "'MY-AS-BLOCK' is not valid for this object type",
            );

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'source').$$meta.$$disable).toEqual(true);
        });

        it('should duplicate attribute', () => {
            const lengthBefore = component.attributes.length;

            component.duplicateAttribute(component.attributes[1]);
            expect(component.attributes.length).toEqual(lengthBefore + 1);
            expect(component.attributes[2].name).toEqual(component.attributes[1].name);
            expect(component.attributes[2].value).toEqual(undefined);

            // and again, just 2b sure.
            component.duplicateAttribute(component.attributes[1]);
            expect(component.attributes.length).toEqual(lengthBefore + 2);
            expect(component.attributes[2].name).toEqual(component.attributes[1].name);
            expect(component.attributes[2].value).toEqual(undefined);
        });

        it('should remove attribute', () => {
            const lengthBefore = component.attributes.length;
            const currentThird = component.attributes[2];

            component.removeAttribute(component.attributes[1]);

            expect(component.attributes.length).toEqual(lengthBefore - 1);
            expect(component.attributes[1].name).toEqual(currentThird.name);
            expect(component.attributes[1].value).toEqual(currentThird.value);
        });

        it('should fetch maintainers already associated to the user in the session', () => {
            expect(component.maintainers.sso[0].key).toEqual(USER_MAINTAINERS_MOCK[0].key);
            expect(component.maintainers.sso[0].type).toEqual(USER_MAINTAINERS_MOCK[0].type);
            expect(component.maintainers.sso[0].auth).toEqual(USER_MAINTAINERS_MOCK[0].auth);
            expect(component.maintainers.sso[0].mine).toEqual(true);

            expect(component.maintainers.sso.length).toBe(1);

            expect(component.maintainers.objectOriginal.length).toBe(0);

            expect(component.maintainers.object[0].key).toEqual(USER_MAINTAINERS_MOCK[0].key);
            expect(component.maintainers.object[0].type).toEqual(USER_MAINTAINERS_MOCK[0].type);
            expect(component.maintainers.object[0].auth).toEqual(USER_MAINTAINERS_MOCK[0].auth);
            expect(component.maintainers.object[0].mine).toEqual(true);
        });

        xit('should add the selected maintainers to the object - attributes', async () => {
            const emitedMnts = {
                maintainers: {
                    object: [
                        { mine: true, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT' },
                        { mine: false, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT-1' },
                    ],
                },
            };
            expect(component.attributes.length).toEqual(0);
            fixture.detectChanges();
            // component.updateMaintainers(emitedMnts);
            await fixture.whenStable();
            expect(component.attributes.length).toEqual(5);
        });

        it('should ask for password after upon submit.', () => {
            modalMock.open.and.returnValue({ componentInstance: {}, closed: EMPTY, dismissed: of(() => 'cancel') });

            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'as-block', 'MY-AS-BLOCK');
            // simulate manual addition of a new mntner with only md5
            component.maintainers.object = [{ mine: false, type: 'mntner', auth: ['MD5'], key: 'TEST-MNT-1' }];
            component.updateMaintainers(component.maintainers);
            component.submit();

            expect(modalMock.open).toHaveBeenCalled();
        });

        xit('should remove the selected maintainers to the object before post it', async () => {
            modalMock.open.and.returnValue({
                componentInstance: {},
                result: of({ $value: { selectedItem: { key: 'TEST-MNT', name: 'mntner', mine: true } } }).toPromise(),
            });
            const DUMMY_RESPONSE = {
                objects: {
                    object: [
                        {
                            attributes: {
                                attribute: [
                                    { name: 'as-block', value: 'MY-AS-BLOCK' },
                                    { name: 'mnt-by', value: 'TEST-MNT' },
                                    { name: 'source', value: 'RIPE' },
                                ],
                            },
                        },
                    ],
                },
            };
            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'as-block', 'MY-AS-BLOCK');
            component.whoisResourcesService.addAttrsSorted(component.attributes, 'mnt-by', [{ name: 'TEST-MNT-1' }]);

            component.maintainers.object = [
                { mine: true, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT' },
                { mine: false, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT-1' },
            ];

            component.updateMaintainers({
                object: [{ mine: true, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT' }],
                objectOriginal: [],
                sso: [],
            });
            component.submit();

            httpMock.expectOne({ method: 'POST', url: 'api/whois/RIPE/as-block' }).flush(DUMMY_RESPONSE, { status: 500, statusText: 'error' });
            await fixture.whenStable();
        });

        it('should add a new user defined attribute', () => {
            //@ts-ignore
            component.addSelectedAttribute({ name: 'remarks', value: null }, component.attributes[0]);

            expect(component.attributes[1].name).toEqual('remarks');
            expect(component.attributes[1].value).toEqual(undefined);
        });

        it('should go to delete controler on delete', async () => {
            component.source = 'RIPE';
            component.objectType = 'MNT';
            component.name = 'TEST-MNT';

            component.deleteObject();
            await fixture.whenStable();

            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('webupdates/delete/RIPE/MNT/TEST-MNT?onCancel=webupdates/modify');
        });

        it('should transition to select state if cancel is pressed during create', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            component.cancel();
            expect(routerMock.navigate).toHaveBeenCalledWith(['webupdates/select']);
        });
    });

    describe('with RIPE-NCC-MNT', () => {
        const SOURCE = 'RIPE';
        const OBJECT_TYPE = 'route';

        beforeEach(async () => {
            paramMapMock.source = SOURCE;
            paramMapMock.objectType = OBJECT_TYPE;
            spyOn(paramMapMock, 'get').and.callFake((param) => {
                return component.activatedRoute.snapshot.paramMap[param];
            });
            spyOn(paramMapMock, 'has').and.callFake((param) => {
                return !!component.activatedRoute.snapshot.paramMap[param];
            });
            component = fixture.componentInstance;
            fixture.detectChanges();

            const requests = httpMock.match({ method: 'GET', url: 'api/user/mntners' });
            expect(requests.length).toBe(2); //One when the page is being loaded for the first time and when the
            // page is being loaded the second time after specifying the IP (so is checking with parent)
            requests[0].flush(USER_RIPE_NCC_MNT_MOCK);
            requests[1].flush(USER_RIPE_NCC_MNT_MOCK);
            await fixture.whenStable();
        });

        it('should not be possible to create route objects with RIPE-NCC-RPSL-MNT for out-of-region objects', async () => {
            // for creation and modification of route, route6 and aut-num, password for RIPE-NCC-RPSL-MNT is added to
            // the rest-call to allow creation of "out-of-region"-objects without knowing the details of RPSL-mntner
            const DUMMY_RESPONSE = {
                objects: {
                    object: [
                        {
                            'primary-key': {
                                attribute: [
                                    { name: 'route', value: '193.0.7.231/32' },
                                    { name: 'origin', value: 'AS1299' },
                                ],
                            },
                            attributes: {
                                attribute: [
                                    { name: 'route', value: '193.0.7.231/32' },
                                    { name: 'descr', value: 'My descr' },
                                    { name: 'origin', value: 'AS1299' },
                                    { name: 'mnt-by', value: 'RIPE-NCC-MNT' },
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
                            text: `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`,
                            args: [{ value: 'aut-num' }, { value: 'AS1299' }, { value: 'mnt-by' }, { value: 'TESTNET-MNT, RIPE-NCC-END-MNT' }],
                        },
                        {
                            severity: 'Warning',
                            text: 'This update has only passed one of the two required hierarchical authorisations',
                        },
                        {
                            severity: 'Info',
                            text: 'The %s object %s will be saved for one week pending the second authorisation',
                            args: [{ value: 'route' }, { value: '193.0.7.231/32AS1299' }],
                        },
                    ],
                },
            };
            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'route', '193.0.7.231/32');
            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'descr', 'My descr');
            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'origin', 'AS1299');
            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'mnt-by', 'RIPE-NCC-MNT');
            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'source', 'RIPE');

            component.submit();

            httpMock.expectOne({ method: 'POST', url: 'api/whois/RIPE/route' }).flush(DUMMY_RESPONSE, { status: 400, statusText: 'error' });
            await fixture.whenStable();

            const resp = component.messageStoreService.get('193.0.7.231/32AS1299');

            expect(component.whoisResourcesService.getPrimaryKey(resp)).toEqual('193.0.7.231/32AS1299');
            let attrs = component.whoisResourcesService.getAttributes(resp);
            expect(component.whoisResourcesService.getSingleAttributeOnName(attrs, 'route').value).toEqual('193.0.7.231/32');
            expect(component.whoisResourcesService.getSingleAttributeOnName(attrs, 'origin').value).toEqual('AS1299');
            expect(component.whoisResourcesService.getSingleAttributeOnName(attrs, 'descr').value).toEqual('My descr');
            expect(WhoisResourcesService.getAllAttributesOnName(attrs, 'mnt-by')[0].value).toEqual('RIPE-NCC-MNT');
            expect(component.whoisResourcesService.getSingleAttributeOnName(attrs, 'source').value).toEqual('RIPE');
            expect(resp.errormessages.errormessage[0].severity).toEqual('Info');
            expect(resp.errormessages.errormessage[0].text).toEqual(
                'Your object is still pending authorisation by a maintainer of the <strong>aut-num</strong> object ' +
                    '<a target="_blank" href="webupdates/display/RIPE/aut-num/AS1299">AS1299</a>. ' +
                    'Please ask them to confirm, by submitting the same object as outlined below using syncupdates or mail updates, ' +
                    'and authenticate it using the maintainer ' +
                    '<a target="_blank" href="webupdates/display/RIPE/mntner/TESTNET-MNT">TESTNET-MNT</a>. ' +
                    '<a target="_blank" href="/docs/Authorisation/Protection-of-Route-Object-Space/#creating-route-objects-referring-to-resources-you-don-t-manage">' +
                    'Click here for more information</a>.',
            );
            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('webupdates/display/RIPE/route/193.0.7.231%2F32AS1299?method=Pending');
        });
    });

    describe('init with nonexistent obj type', () => {
        const SOURCE = 'RIPE';
        const OBJECT_TYPE = 'blablabla';

        beforeEach(async () => {
            paramMapMock.source = SOURCE;
            paramMapMock.objectType = OBJECT_TYPE;
            spyOn(paramMapMock, 'get').and.callFake((param) => {
                return component.activatedRoute.snapshot.paramMap[param];
            });
            spyOn(paramMapMock, 'has').and.callFake((param) => {
                return !!component.activatedRoute.snapshot.paramMap[param];
            });
            component = fixture.componentInstance;
            fixture.detectChanges();
            await fixture.whenStable();
        });

        it('should redirect to 404 page', () => {
            expect(routerMock.navigate).toHaveBeenCalledWith(['not-found']);
        });
    });

    describe('init route object type', () => {
        const SOURCE = 'RIPE';
        const OBJECT_TYPE = 'route';

        beforeEach(async () => {
            paramMapMock.source = SOURCE;
            paramMapMock.objectType = OBJECT_TYPE;
            spyOn(paramMapMock, 'get').and.callFake((param) => {
                return component.activatedRoute.snapshot.paramMap[param];
            });
            spyOn(paramMapMock, 'has').and.callFake((param) => {
                return !!component.activatedRoute.snapshot.paramMap[param];
            });
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should do proper request', () => {
            const requests = httpMock.match({ method: 'GET', url: 'api/user/mntners' });
            expect(requests.length).toBe(2); //One when the page is being loaded for the first time and when the
            // page is being loaded the second time after specifying the IP (so is checking with parent)
            requests[0].flush(USER_WITH_MORE_ASSOCIATED_MNT_MOCK);
            requests[1].flush(USER_WITH_MORE_ASSOCIATED_MNT_MOCK);
            fixture.detectChanges();
        });
    });
});

const USER_MAINTAINERS_MOCK = [{ mine: true, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT' }];
const USER_RIPE_NCC_MNT_MOCK = [{ mine: true, type: 'mntner', auth: ['SSO'], key: 'RIPE-NCC-MNT' }];
const USER_WITH_MORE_ASSOCIATED_MNT_MOCK = [
    { mine: true, type: 'mntner', auth: ['MD5-PW', 'SSO'], key: 'TST12-MNT' },
    { mine: true, type: 'mntner', auth: ['MD5-PW', 'SSO'], key: 'TEST01-MNT' },
    { mine: true, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT' },
];

const WHOIS_OBJECT_WITH_ERRORS_MOCK = {
    objects: {
        object: [
            {
                'primary-key': { attribute: [{ name: 'as-block', value: 'MY-AS-BLOCK' }] },
                attributes: {
                    attribute: [
                        { name: 'as-block', value: 'MY-AS-BLOCK' },
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
                text: 'Unrecognized source: %s',
                args: [{ value: 'INVALID_SOURCE' }],
            },
            {
                severity: 'Warning',
                text: 'Not authenticated',
            },
            {
                severity: 'Error',
                attribute: {
                    name: 'as-block',
                    value: 'MY-AS-BLOCK',
                },
                text: "'%s' is not valid for this object type",
                args: [{ value: 'MY-AS-BLOCK' }],
            },
        ],
    },
};
