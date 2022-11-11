import { Location } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import { of, throwError } from 'rxjs';
import { AttributeMetadataService } from '../../../../src/app/attribute/attribute-metadata.service';
import { AttributeSharedService } from '../../../../src/app/attribute/attribute-shared.service';
import { CoreModule } from '../../../../src/app/core/core.module';
import { PrefixService } from '../../../../src/app/domainobject/prefix.service';
import { ResourceStatusService } from '../../../../src/app/myresources/resource-status.service';
import { PropertiesService } from '../../../../src/app/properties.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';
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

const ORG_MOCK = {
    type: 'organisation',
    link: {
        type: 'locator',
        href: 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-UA300-RIPE',
    },
    source: {
        id: 'ripe',
    },
    'primary-key': {
        attribute: [
            {
                name: 'organisation',
                value: 'ORG-UA300-RIPE',
            },
        ],
    },
    attributes: {
        attribute: [
            {
                name: 'organisation',
                value: 'ORG-UA300-RIPE',
            },
            {
                name: 'org-name',
                value: 'uhuuu',
            },
            {
                name: 'org-type',
                value: 'OTHER',
            },
            {
                name: 'address',
                value: 'Singel 258',
            },
            {
                name: 'e-mail',
                value: 'tdacruzper@ripe.net',
            },
            {
                link: {
                    type: 'locator',
                    href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/TEST-MNT',
                },
                name: 'mnt-ref',
                value: 'IS-NET-MNT',
                'referenced-type': 'mntner',
            },
            {
                link: {
                    type: 'locator',
                    href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/TEST-MNT',
                },
                name: 'mnt-by',
                value: 'TEST-MNT',
                'referenced-type': 'mntner',
            },
            {
                name: 'created',
                value: '2015-12-02T14:01:06Z',
            },
            {
                name: 'last-modified',
                value: '2015-12-02T14:01:06Z',
            },
            {
                name: 'source',
                value: 'RIPE',
            },
        ],
    },
};

const ROLE_OBJ = [
    {
        name: 'role',
        value: 'some role',
    },
    {
        name: 'address',
        value: 'Singel 258',
    },
    {
        name: 'e-mail',
        value: 'fdsd@sdfsd.com',
    },
    {
        name: 'abuse-mailbox',
        value: 'fdsd@sdfsd.com',
    },
    {
        name: 'nic-hdl',
        value: 'SR11027-RIPE',
    },
    {
        link: {
            type: 'locator',
            href: 'http://rest-dev.db.ripe.net/ripe/mntner/MNT-THINK',
        },
        name: 'mnt-by',
        value: 'MNT-THINK',
        'referenced-type': 'mntner',
    },
    {
        name: 'created',
        value: '2015-12-04T15:12:10Z',
    },
    {
        name: 'last-modified',
        value: '2015-12-04T15:12:10Z',
    },
    {
        name: 'source',
        value: 'RIPE',
    },
];

describe('CreateModifyComponent with modifying test cases', () => {
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
            imports: [SharedModule, CoreModule, NgSelectModule, HttpClientTestingModule],
            declarations: [CreateModifyComponent],
            providers: [
                PrefixService,
                ResourceStatusService,
                WebUpdatesCommonsService,
                PropertiesService,
                OrganisationHelperService,
                WhoisResourcesService,
                WhoisMetaService,
                AttributeSharedService,
                AttributeMetadataService,
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
                { provide: Location, useValue: { path: () => '' } },
                { provide: Router, useValue: routerMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: paramMapMock,
                            queryParamMap: { has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param] },
                        },
                    },
                },
                { provide: NgbModal, useValue: modalMock },
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(CreateModifyComponent);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('init with success', () => {
        const OBJECT_TYPE = 'as-block';
        const SOURCE = 'RIPE';
        const NAME = 'MY-AS-BLOCK';

        beforeEach(async () => {
            paramMapMock.source = SOURCE;
            paramMapMock.objectType = OBJECT_TYPE;
            paramMapMock.objectName = NAME;
            spyOn(paramMapMock, 'get').and.callFake((param) => {
                return component.activatedRoute.snapshot.paramMap[param];
            });
            spyOn(paramMapMock, 'has').and.callFake((param) => {
                return !!component.activatedRoute.snapshot.paramMap[param];
            });
            component = fixture.componentInstance;
            component.credentialsService.setCredentials('TEST-MNT', '@123');
            fixture.detectChanges();
            httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/as-block/MY-AS-BLOCK?password=%40123&unfiltered=true' }).flush({
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
            });
            await fixture.whenStable();
        });

        it('should get objectType from url', () => {
            expect(component.objectType).toBe(OBJECT_TYPE);
        });

        it('should get source from url', () => {
            expect(component.source).toBe(SOURCE);
        });

        it('should get name from url', () => {
            expect(component.name).toBe(NAME);
        });

        it('should populate the ui based on object-type meta model and source', () => {
            const stateBefore = component.activatedRoute.snapshot.paramMap.get('objectName');

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').$$error).toBeUndefined();
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').value).toEqual(NAME);

            expect(WhoisResourcesService.getAllAttributesOnName(component.attributes, 'mnt-by')[0].$$error).toBeUndefined();
            expect(WhoisResourcesService.getAllAttributesOnName(component.attributes, 'mnt-by')[0].value).toEqual('TEST-MNT');

            expect(WhoisResourcesService.getAllAttributesOnName(component.attributes, 'source')[0].$$error).toBeUndefined();
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'source').value).toEqual('RIPE');

            expect(component.activatedRoute.snapshot.paramMap.get('objectName')).toBe(stateBefore);
        });

        it('should display field specific errors upon submit click on form with missing values', () => {
            const stateBefore = component.activatedRoute.snapshot.paramMap.get('objectName');

            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'as-block', null);

            component.submit();
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').$$error).toEqual('Mandatory attribute not set');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').value).toBeNull();

            expect(WhoisResourcesService.getAllAttributesOnName(component.attributes, 'mnt-by')[0].$$error).toBeUndefined();
            expect(WhoisResourcesService.getAllAttributesOnName(component.attributes, 'mnt-by')[0].value).toEqual('TEST-MNT');

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'source').$$error).toBeUndefined();
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'source').value).toEqual('RIPE');

            expect(component.activatedRoute.snapshot.paramMap.get('objectName')).toBe(stateBefore);
        });

        it('should handle success put upon submit click when form is complete', () => {
            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'changed', 'dummy@ripe.net');
            component.submit();
            fixture.detectChanges();
            httpMock.expectOne({ method: 'PUT', url: 'api/whois/RIPE/as-block/MY-AS-BLOCK?password=%40123' }).flush({
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
            });

            const resp = component.messageStoreService.get('MY-AS-BLOCK');
            expect(component.whoisResourcesService.getPrimaryKey(resp)).toEqual('MY-AS-BLOCK');
            const attrs = component.whoisResourcesService.getAttributes(resp);
            expect(component.whoisResourcesService.getSingleAttributeOnName(attrs, 'as-block').value).toEqual('MY-AS-BLOCK');
            expect(WhoisResourcesService.getAllAttributesOnName(attrs, 'mnt-by')[0].value).toEqual('TEST-MNT');
            expect(component.whoisResourcesService.getSingleAttributeOnName(attrs, 'source').value).toEqual('RIPE');

            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('webupdates/display/RIPE/as-block/MY-AS-BLOCK?method=Modify');
        });

        it('should handle error post upon submit click when form is complete', async () => {
            const stateBefore = component.activatedRoute.snapshot.paramMap.get('objectName');
            component.whoisResourcesService.setSingleAttributeOnName(component.attributes, 'as-block', 'A');
            component.submit();
            await fixture.whenStable();

            httpMock.expectOne({ method: 'PUT', url: 'api/whois/RIPE/as-block/MY-AS-BLOCK?password=%40123' }).flush(
                {
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
                                text: '"%s" is not valid for this object type',
                                args: [{ value: 'MY-AS-BLOCK' }],
                            },
                        ],
                    },
                },
                { status: 400, statusText: 'error' },
            );

            await fixture.whenStable();
            expect(component.alertsService.alerts.errors[0].plainText).toEqual('Update of as-block failed, please see below for more details');
            expect(component.alertsService.alerts.errors[1].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
            expect(component.alertsService.alerts.warnings[0].plainText).toEqual('Not authenticated');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').$$error).toEqual(
                '"MY-AS-BLOCK" is not valid for this object type',
            );

            expect(component.activatedRoute.snapshot.paramMap.get('objectName')).toBe(stateBefore);
        });

        it('should duplicate attribute', () => {
            expect(component.attributes.length).toEqual(3);

            component.duplicateAttribute(component.attributes[1]);

            expect(component.attributes.length).toEqual(4);
            expect(component.attributes[2].name).toEqual(component.attributes[1].name);
            expect(component.attributes[2].value).toEqual(undefined);
        });

        it('should remove attribute', () => {
            expect(component.attributes.length).toEqual(3);

            component.removeAttribute(component.attributes[1]);

            expect(component.attributes.length).toEqual(2);
            expect(component.attributes[1].name).toEqual('source');
            expect(component.attributes[1].value).toEqual('RIPE');
        });

        it('should transition to display state if cancel is pressed', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            component.cancel();
            expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        });
    });

    describe('init with failures', () => {
        const OBJECT_TYPE = 'as-block';
        const SOURCE = 'RIPE';
        const NAME = 'MY-AS-BLOCK';

        beforeEach(async () => {
            paramMapMock.source = SOURCE;
            paramMapMock.objectType = OBJECT_TYPE;
            paramMapMock.objectName = NAME;
            spyOn(paramMapMock, 'get').and.callFake((param) => {
                return component.activatedRoute.snapshot.paramMap[param];
            });
            spyOn(paramMapMock, 'has').and.callFake((param) => {
                return !!component.activatedRoute.snapshot.paramMap[param];
            });
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should report error when fetching object fails', () => {
            getObjectWithError();

            expect(component.alertsService.alerts.warnings.length > 0).toBeTruthy();
            expect(component.alertsService.alerts.warnings[0].plainText).toEqual('Not authenticated');
        });

        function getObject() {
            httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true' }).flush({
                objects: {
                    object: [
                        {
                            'primary-key': { attribute: [{ name: 'as-block', value: 'MY-AS-BLOCK' }] },
                            attributes: {
                                attribute: [
                                    { name: 'as-block', value: 'MY-AS-BLOCK' },
                                    { name: 'mnt-by', value: 'TEST3-MNT' },
                                    { name: 'source', value: 'RIPE' },
                                ],
                            },
                        },
                    ],
                },
            });
        }

        function getObjectWithError() {
            httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true' }).flush(
                {
                    errormessages: {
                        errormessage: [
                            {
                                severity: 'Warning',
                                text: 'Not authenticated',
                            },
                        ],
                    },
                },
                { status: 404, statusText: 'error' },
            );
        }

        function failToGetMaintainerDetails() {
            httpMock
                .expectOne({ method: 'GET', url: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST3-MNT' })
                .flush({}, { status: 404, statusText: 'error' });
        }

        function failToGetSsoMaintainers() {
            httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush({}, { status: 404, statusText: 'error' });
        }
    });

    xdescribe('ask for password before modify object with non-sso maintainer with password', () => {
        const OBJECT_TYPE = 'as-block';
        const SOURCE = 'RIPE';
        const NAME = 'MY-AS-BLOCK';

        beforeEach(async () => {
            paramMapMock.source = SOURCE;
            paramMapMock.objectType = OBJECT_TYPE;
            paramMapMock.objectName = NAME;
            spyOn(paramMapMock, 'get').and.callFake((param) => {
                return component.activatedRoute.snapshot.paramMap[param];
            });
            spyOn(paramMapMock, 'has').and.callFake((param) => {
                return !!component.activatedRoute.snapshot.paramMap[param];
            });
            component = fixture.componentInstance;
            fixture.detectChanges();
            httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);
            httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true' }).flush({
                objects: {
                    object: [
                        {
                            'primary-key': { attribute: [{ name: 'as-block', value: 'MY-AS-BLOCK' }] },
                            attributes: {
                                attribute: [
                                    { name: 'as-block', value: 'MY-AS-BLOCK' },
                                    { name: 'mnt-by', value: 'TEST3-MNT' },
                                    { name: 'source', value: 'RIPE' },
                                ],
                            },
                        },
                    ],
                },
            });
            modalMock.open.and.returnValue({ componentInstance: {}, result: throwError(() => 'cancel').toPromise() });
            await fixture.whenStable();
        });

        it('should ask for password before modify object with non-sso maintainer with password.', () => {
            expect(modalMock.open).toHaveBeenCalled();
        });
    });

    describe('should be able to handle escape objected with slash', () => {
        const SOURCE = 'RIPE';
        const OBJECT_TYPE = 'route';
        const NAME = '12.235.32.0%2f19AS1680';

        beforeEach(async () => {
            paramMapMock.source = SOURCE;
            paramMapMock.objectType = OBJECT_TYPE;
            paramMapMock.objectName = NAME;
            spyOn(paramMapMock, 'get').and.callFake((param) => {
                return component.activatedRoute.snapshot.paramMap[param];
            });
            spyOn(paramMapMock, 'has').and.callFake((param) => {
                return !!component.activatedRoute.snapshot.paramMap[param];
            });
            component = fixture.componentInstance;
            fixture.detectChanges();
            httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true' }).flush({
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
            });
            await fixture.whenStable();
        });
    });

    describe('for organisation', () => {
        const OBJECT_TYPE = 'organisation';
        const SOURCE = 'RIPE';
        const NAME = 'ORG-UA300-RIPE';

        beforeEach(async () => {
            paramMapMock.source = SOURCE;
            paramMapMock.objectType = OBJECT_TYPE;
            paramMapMock.objectName = NAME;
            spyOn(paramMapMock, 'get').and.callFake((param) => {
                return component.activatedRoute.snapshot.paramMap[param];
            });
            spyOn(paramMapMock, 'has').and.callFake((param) => {
                return !!component.activatedRoute.snapshot.paramMap[param];
            });
            component = fixture.componentInstance;
            fixture.detectChanges();
            httpMock.expectOne({ method: 'GET', url: `api/whois/RIPE/${OBJECT_TYPE}/${NAME}?unfiltered=true` }).flush({
                objects: {
                    object: [ORG_MOCK],
                },
                'terms-and-conditions': {
                    type: 'locator',
                    href: 'http://www.ripe.net/db/support/db-terms-conditions.pdf',
                },
            });
            await fixture.whenStable();
        });

        it("should populate abuse-c with new role's nic-hdl", async () => {
            component.attributes = component.organisationHelperService.addAbuseC(component.objectType, component.attributes);
            modalMock.open.and.returnValue({ componentInstance: {}, result: of(ROLE_OBJ).toPromise() });
            const attrAbuseC = component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'abuse-c');
            component.createRoleForAbuseCAttribute(attrAbuseC);
            await fixture.whenStable();
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'abuse-c').value).toBe('SR11027-RIPE');
        });

        it('should populate component.roleForAbuseC', async () => {
            component.attributes = component.organisationHelperService.addAbuseC(component.objectType, component.attributes);
            modalMock.open.and.returnValue({ componentInstance: {}, result: of(ROLE_OBJ).toPromise() });
            const attrAbuseC = component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'abuse-c');
            component.createRoleForAbuseCAttribute(attrAbuseC);
            await fixture.whenStable();
            expect(component.roleForAbuseC).toBeDefined();
        });

        it('should show LIR orgs with certain attributes disabled', () => {
            expect();
        });
    });

    describe('for LIR organisation', () => {
        const OBJECT_TYPE = 'organisation';
        const SOURCE = 'RIPE';
        const NAME = 'ORG-UA300-RIPE';

        beforeEach(async () => {
            paramMapMock.source = SOURCE;
            paramMapMock.objectType = OBJECT_TYPE;
            paramMapMock.objectName = NAME;
            spyOn(paramMapMock, 'get').and.callFake((param) => {
                return component.activatedRoute.snapshot.paramMap[param];
            });
            spyOn(paramMapMock, 'has').and.callFake((param) => {
                return !!component.activatedRoute.snapshot.paramMap[param];
            });
            component = fixture.componentInstance;
            fixture.detectChanges();
            httpMock.expectOne({ method: 'GET', url: `api/whois/RIPE/${OBJECT_TYPE}/${NAME}?unfiltered=true` }).flush({
                objects: {
                    object: [ORG_MOCK],
                },
                'terms-and-conditions': {
                    type: 'locator',
                    href: 'http://www.ripe.net/db/support/db-terms-conditions.pdf',
                },
            });
            await fixture.whenStable();
        });
    });
});
