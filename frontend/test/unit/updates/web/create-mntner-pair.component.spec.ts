import { Location } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';
import { CoreModule } from '../../../../src/app/core/core.module';
import { PropertiesService } from '../../../../src/app/properties.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';
import { WhoisResourcesService } from '../../../../src/app/shared/whois-resources.service';
import { CreateService } from '../../../../src/app/updatesweb/create.service';
import { CreateMntnerPairComponent } from '../../../../src/app/updatesweb/createmntnerpair/create-mntner-pair.component';
import { ErrorReporterService } from '../../../../src/app/updatesweb/error-reporter.service';
import { LinkService } from '../../../../src/app/updatesweb/link.service';
import { MessageStoreService } from '../../../../src/app/updatesweb/message-store.service';
import { RestService } from '../../../../src/app/updatesweb/rest.service';
import { UserInfoService } from '../../../../src/app/userinfo/user-info.service';

describe('CreateMntnerPairComponent', () => {
    let httpMock: HttpTestingController;
    let fixture: ComponentFixture<CreateMntnerPairComponent>;
    let component: CreateMntnerPairComponent;
    let routerMock: any;
    const SOURCE = 'RIPE';
    const PERSON_NAME = 'Titus Tester';
    const PERSON_UID = 'tt-ripe';
    const MNTNER_NAME = 'TEST71-MNT';
    const SSO_EMAIL = 'tester@ripe.net';
    const ROLE_NAME = 'ROLE-TEST';
    const ROLE_EMAIL = 'TSTADMINC-RIPE';

    describe('in pair with person object', () => {
        beforeEach(() => {
            routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl', 'events', 'createUrlTree', 'serializeUrl']);
            routerMock.events = of({});
            routerMock.createUrlTree = () => {};
            routerMock.serializeUrl = () => '';
            TestBed.configureTestingModule({
                declarations: [CreateMntnerPairComponent],
                imports: [SharedModule, CoreModule, NgSelectModule, RouterTestingModule],
                providers: [
                    PropertiesService,
                    CreateService,
                    RestService,
                    MessageStoreService,
                    ErrorReporterService,
                    LinkService,
                    CookieService,
                    WhoisResourcesService,
                    UserInfoService,
                    { provide: Location, useValue: { path: () => '' } },
                    { provide: Router, useValue: routerMock },
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            params: of({ personOrRole: 'person' }),
                            queryParams: of({}),
                            snapshot: {
                                paramMap: convertToParamMap({ personOrRole: 'person' }),
                                queryParamMap: convertToParamMap({}),
                            },
                        },
                    },
                    provideHttpClient(withInterceptorsFromDi()),
                    provideHttpClientTesting(),
                ],
            });
            httpMock = TestBed.inject(HttpTestingController);
            fixture = TestBed.createComponent(CreateMntnerPairComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        afterEach(() => {
            httpMock.verify();
        });

        it('should extract data from url', () => {
            httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush(USER_INFO_DATA_DUMMY);

            expect(component.source).toBe(SOURCE);
        });

        it('should be able to handle failing user-info-service', () => {
            httpMock
                .expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' })
                .flush(WHOIS_OBJECT_WITHE_ERRORS_DUMMY, { status: 403, statusText: 'error' });

            component.submit();

            expect(component.alertsService.alerts.errors[0].plainText).toEqual('Error fetching SSO information');

            expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should validate before submitting', () => {
            httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush(USER_INFO_DATA_DUMMY);

            component.submit();

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'person').$$error).toEqual(
                'Mandatory attribute not set',
            );
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'address').$$error).toEqual(
                'Mandatory attribute not set',
            );
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'phone').$$error).toEqual(
                'Mandatory attribute not set',
            );
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mntner').$$error).toEqual(
                'Mandatory attribute not set',
            );

            expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should pre-populate and submit ok', async () => {
            httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush(USER_INFO_DATA_DUMMY);

            component.submit();

            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'person', PERSON_NAME);
            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'phone', '+316');
            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'address', 'home');
            component.whoisResourcesService.setSingleAttributeOnName(component.mntnerAttributes, 'mntner', MNTNER_NAME);

            component.submit();
            fixture.detectChanges();

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'person').value).toBe(PERSON_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'phone').value).toBe('+316');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'address').value).toBe('home');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'nic-hdl').value).toEqual('AUTO-1');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'mnt-by').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'source').value).toEqual(SOURCE);

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mntner').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'admin-c').value).toEqual('AUTO-1');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'auth').value).toEqual('SSO ' + SSO_EMAIL);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'upd-to').value).toEqual(SSO_EMAIL);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mnt-by').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'source').value).toEqual(SOURCE);
            expect(component.isFormValid()).toBe(true);

            httpMock
                .expectOne({ method: 'POST', url: 'api/whois-internal/api/mntner-pair/RIPE/person' })
                .flush(component.whoisResourcesService.validateWhoisResources(PERSON_MNTNER_PAIR_DUMMY));
            await fixture.whenStable();

            const cachedPerson = component.whoisResourcesService.validateWhoisResources(component.messageStoreService.get(PERSON_UID));
            const personAttrs = component.whoisResourcesService.getAttributes(cachedPerson);
            expect(component.whoisResourcesService.getSingleAttributeOnName(personAttrs, 'person').value).toEqual(PERSON_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(personAttrs, 'nic-hdl').value).toEqual(PERSON_UID);

            const cachedMntner = component.messageStoreService.get(MNTNER_NAME);
            const mntnerAttrs = component.whoisResourcesService.getAttributes(cachedMntner);
            expect(component.whoisResourcesService.getSingleAttributeOnName(mntnerAttrs, 'mntner').value).toEqual(MNTNER_NAME);

            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('webupdates/display/RIPE/person/tt-ripe/mntner/TEST71-MNT');
        });

        it('should handle submit failure', async () => {
            httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush(USER_INFO_DATA_DUMMY);

            component.submit();

            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'person', 'Titus Tester');
            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'phone', '+316');
            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'address', 'home');
            component.whoisResourcesService.setSingleAttributeOnName(component.mntnerAttributes, 'mntner', MNTNER_NAME);

            component.submit();

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'person').value).toBe(PERSON_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'nic-hdl').value).toEqual('AUTO-1');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'mnt-by').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'source').value).toEqual(SOURCE);

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mntner').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'auth').value).toEqual('SSO ' + SSO_EMAIL);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'admin-c').value).toEqual('AUTO-1');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'upd-to').value).toEqual(SSO_EMAIL);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mnt-by').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'source').value).toEqual(SOURCE);

            httpMock
                .expectOne({ method: 'POST', url: 'api/whois-internal/api/mntner-pair/' + SOURCE + '/person' })
                .flush(component.whoisResourcesService.validateWhoisResources(WHOIS_OBJECT_WITHE_ERRORS_DUMMY), {
                    status: 400,
                    statusText: 'error',
                });
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.alertsService.alerts.errors[0].plainText).toEqual(
                'Creation of person and maintainer pair failed, please see below for more details',
            );
            expect(component.alertsService.alerts.errors[1].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
            expect(component.alertsService.alerts.warnings[0].plainText).toEqual('Not authenticated');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mntner').$$error).toEqual(
                `"${MNTNER_NAME}" is not valid for this object type`,
            );
        });
    });

    describe('in pair with role object', () => {
        beforeEach(() => {
            routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl', 'events', 'createUrlTree', 'serializeUrl']);
            routerMock.events = of({});
            routerMock.createUrlTree = () => {};
            routerMock.serializeUrl = () => '';
            TestBed.configureTestingModule({
                declarations: [CreateMntnerPairComponent],
                imports: [SharedModule, CoreModule, NgSelectModule, RouterTestingModule],
                providers: [
                    PropertiesService,
                    CreateService,
                    RestService,
                    MessageStoreService,
                    ErrorReporterService,
                    LinkService,
                    CookieService,
                    WhoisResourcesService,
                    UserInfoService,
                    { provide: Location, useValue: { path: () => '' } },
                    { provide: Router, useValue: routerMock },
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            params: of({ personOrRole: 'role' }),
                            queryParams: of({}),
                            snapshot: {
                                paramMap: convertToParamMap({ personOrRole: 'role' }),
                                queryParamMap: convertToParamMap({}),
                            },
                        },
                    },
                    provideHttpClient(withInterceptorsFromDi()),
                    provideHttpClientTesting(),
                ],
            });
            httpMock = TestBed.inject(HttpTestingController);
            fixture = TestBed.createComponent(CreateMntnerPairComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        afterEach(() => {
            httpMock.verify();
        });

        it('should extract data from url', () => {
            httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush(USER_INFO_DATA_DUMMY);

            expect(component.source).toBe(SOURCE);
        });

        it('should be able to handle failing user-info-service', () => {
            httpMock
                .expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' })
                .flush(WHOIS_OBJECT_WITHE_ERRORS_DUMMY, { status: 403, statusText: 'error' });

            component.submit();

            expect(component.alertsService.alerts.errors[0].plainText).toEqual('Error fetching SSO information');

            expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should validate before submitting', () => {
            httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush(USER_INFO_DATA_DUMMY);

            component.submit();

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'role').$$error).toEqual(
                'Mandatory attribute not set',
            );
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'address').$$error).toEqual(
                'Mandatory attribute not set',
            );
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'e-mail').$$error).toEqual(
                'Mandatory attribute not set',
            );
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mntner').$$error).toEqual(
                'Mandatory attribute not set',
            );

            expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should pre-populate and submit ok', async () => {
            httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush(USER_INFO_DATA_DUMMY);

            component.submit();

            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'role', ROLE_NAME);
            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'e-mail', ROLE_EMAIL);
            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'address', 'Amsterdam');
            component.whoisResourcesService.setSingleAttributeOnName(component.mntnerAttributes, 'mntner', MNTNER_NAME);

            component.submit();
            await fixture.detectChanges();

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'role').value).toBe(ROLE_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'e-mail').value).toBe(ROLE_EMAIL);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'address').value).toBe('Amsterdam');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'nic-hdl').value).toEqual('AUTO-1');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'mnt-by').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'source').value).toEqual(SOURCE);

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mntner').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'admin-c').value).toEqual('AUTO-1');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'auth').value).toEqual('SSO ' + SSO_EMAIL);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'upd-to').value).toEqual(SSO_EMAIL);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mnt-by').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'source').value).toEqual(SOURCE);

            httpMock
                .expectOne({ method: 'POST', url: 'api/whois-internal/api/mntner-pair/RIPE/role' })
                .flush(component.whoisResourcesService.validateWhoisResources(ROLE_MNTNER_PAIR_DUMMY));
            await fixture.whenStable();

            const cachedPerson = component.messageStoreService.get('TSTADMINC-RIPE');
            const roleAttrs = component.whoisResourcesService.getAttributes(cachedPerson);
            expect(component.whoisResourcesService.getSingleAttributeOnName(roleAttrs, 'role').value).toEqual(ROLE_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(roleAttrs, 'nic-hdl').value).toEqual('TSTADMINC-RIPE');

            const cachedMntner = component.messageStoreService.get(MNTNER_NAME);
            const mntnerAttrs = component.whoisResourcesService.getAttributes(cachedMntner);
            expect(component.whoisResourcesService.getSingleAttributeOnName(mntnerAttrs, 'mntner').value).toEqual(MNTNER_NAME);

            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('webupdates/display/RIPE/role/TSTADMINC-RIPE/mntner/TEST71-MNT');
        });

        it('should handle submit failure', async () => {
            httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush(USER_INFO_DATA_DUMMY);

            component.submit();

            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'role', ROLE_NAME);
            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'e-mail', ROLE_EMAIL);
            component.whoisResourcesService.setSingleAttributeOnName(component.objectTypeAttributes, 'address', 'Amsterdam');
            component.whoisResourcesService.setSingleAttributeOnName(component.mntnerAttributes, 'mntner', MNTNER_NAME);

            component.submit();

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'role').value).toBe(ROLE_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'nic-hdl').value).toEqual('AUTO-1');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'mnt-by').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.objectTypeAttributes, 'source').value).toEqual(SOURCE);

            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mntner').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'auth').value).toEqual('SSO ' + SSO_EMAIL);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'admin-c').value).toEqual('AUTO-1');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'upd-to').value).toEqual(SSO_EMAIL);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mnt-by').value).toEqual(MNTNER_NAME);
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'source').value).toEqual(SOURCE);

            httpMock
                .expectOne({ method: 'POST', url: 'api/whois-internal/api/mntner-pair/' + SOURCE + '/role' })
                .flush(component.whoisResourcesService.validateWhoisResources(WHOIS_OBJECT_WITHE_ERRORS_DUMMY), {
                    status: 400,
                    statusText: 'error',
                });
            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.alertsService.alerts.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
            expect(component.alertsService.alerts.warnings[0].plainText).toEqual('Not authenticated');
            expect(component.whoisResourcesService.getSingleAttributeOnName(component.mntnerAttributes, 'mntner').$$error).toEqual(
                `"${MNTNER_NAME}" is not valid for this object type`,
            );
        });
    });

    const WHOIS_OBJECT_WITHE_ERRORS_DUMMY = {
        objects: {
            object: [
                {
                    attributes: {
                        attribute: [
                            { name: 'person', value: PERSON_NAME },
                            { name: 'mnt-by', value: MNTNER_NAME },
                            { name: 'source', value: SOURCE },
                        ],
                    },
                },
                {
                    attributes: {
                        attribute: [
                            { name: 'mntner', value: MNTNER_NAME },
                            { name: 'admin-c', value: PERSON_UID },
                            { name: 'mnt-by', value: MNTNER_NAME },
                            { name: 'source', value: SOURCE },
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
                        name: 'mntner',
                        value: MNTNER_NAME,
                    },
                    text: '"%s" is not valid for this object type',
                    args: [{ value: MNTNER_NAME }],
                },
            ],
        },
    };

    const USER_INFO_DATA_DUMMY = {
        user: {
            username: SSO_EMAIL,
            displayName: 'Tester X',
            uuid: '93efb5ac-81f7-40b1-aac7-f2ff497b00e7',
            active: true,
        },
    };

    const PERSON_MNTNER_PAIR_DUMMY = {
        objects: {
            object: [
                {
                    'primary-key': { attribute: [{ name: 'person', value: PERSON_UID }] },
                    attributes: {
                        attribute: [
                            { name: 'person', value: PERSON_NAME },
                            { name: 'mnt-by', value: MNTNER_NAME },
                            { name: 'nic-hdl', value: PERSON_UID },
                            { name: 'source', value: SOURCE },
                        ],
                    },
                },
                {
                    'primary-key': { attribute: [{ name: 'mntner', value: MNTNER_NAME }] },
                    attributes: {
                        attribute: [
                            { name: 'mntner', value: MNTNER_NAME },
                            { name: 'admin-c', value: PERSON_UID },
                            { name: 'mnt-by', value: MNTNER_NAME },
                            { name: 'source', value: SOURCE },
                        ],
                    },
                },
            ],
        },
    };

    const ROLE_MNTNER_PAIR_DUMMY = {
        objects: {
            object: [
                {
                    type: 'role',
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/role/TSTADMINC-RIPE',
                    },
                    source: { id: 'ripe' },
                    'primary-key': {
                        attribute: [{ name: 'nic-hdl', value: 'TSTADMINC-RIPE' }],
                    },
                    attributes: {
                        attribute: [
                            { name: 'role', value: ROLE_NAME },
                            { name: 'address', value: 'Amsterdam' },
                            { name: 'e-mail', value: ROLE_EMAIL },
                            { name: 'nic-hdl', value: 'TSTADMINC-RIPE' },
                            { name: 'mnt-by', value: MNTNER_NAME },
                            { name: 'source', value: SOURCE },
                        ],
                    },
                },
                {
                    type: 'mntner',
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/TEST71-MNT',
                    },
                    source: { id: 'ripe' },
                    'primary-key': {
                        attribute: [{ name: 'mntner', value: MNTNER_NAME }],
                    },
                    attributes: {
                        attribute: [
                            { name: 'mntner', value: MNTNER_NAME },
                            { name: 'admin-c', value: 'TSTADMINC-RIPE' },
                            { name: 'upd-to', value: 'teste2e@ripe.net' },
                            { name: 'auth', value: 'SSO teste2e@ripe.net' },
                            { name: 'mnt-by', value: MNTNER_NAME },
                            { name: 'source', value: SOURCE },
                        ],
                    },
                },
            ],
        },
    };
});
