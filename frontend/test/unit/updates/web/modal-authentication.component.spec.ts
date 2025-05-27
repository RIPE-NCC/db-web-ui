import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { PropertiesService } from '../../../../src/app/properties.service';
import { CredentialsService } from '../../../../src/app/shared/credentials.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';
import { WhoisResourcesService } from '../../../../src/app/shared/whois-resources.service';
import { ModalAuthenticationComponent } from '../../../../src/app/updatesweb/modal-authentication.component';
import { RestService } from '../../../../src/app/updatesweb/rest.service';
import { UserInfoService } from '../../../../src/app/userinfo/user-info.service';

describe('ModalAuthenticationComponent', () => {
    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ModalAuthenticationComponent>;
    let modalAuthenticationComponent: ModalAuthenticationComponent;
    let modalMock: any;
    let credentialsServiceMock: any;

    const mntners = [
        { type: 'mntner', key: 'TEST29-MNT', auth: ['MD5-PW'] },
        { type: 'mntner', name: 'b-mnt', auth: ['MD5-PW'] },
    ];

    const mntnersWithoutPassword = [{ type: 'mntner', key: 'z-mnt', auth: ['SSO'] }];

    beforeEach(() => {
        modalMock = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
        const routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        credentialsServiceMock = jasmine.createSpyObj('CredentialsService', ['hasCredentials', 'getCredentials', 'removeCredentials', 'setCredentials']);
        TestBed.configureTestingModule({
            declarations: [ModalAuthenticationComponent],
            imports: [FormsModule, SharedModule, RouterModule],
            providers: [
                { provide: NgbActiveModal, useValue: modalMock },
                WhoisResourcesService,
                RestService,
                UserInfoService,
                { provide: CredentialsService, useValue: credentialsServiceMock },
                PropertiesService,
                CookieService,
                { provide: Router, useValue: routerMock },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(ModalAuthenticationComponent);
        modalAuthenticationComponent = componentFixture.componentInstance;
        modalAuthenticationComponent.resolve = {
            method: 'PUT',
            objectType: 'mntner',
            objectName: 'someName',
            mntners,
            mntnersWithoutPassword,
            allowForcedDelete: false,
            isLirObject: false,
            source: 'RIPE',
        };
        componentFixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should detect empty password', () => {
        modalAuthenticationComponent.selected.item = { type: 'mntner', key: 'b-mnt' };
        modalAuthenticationComponent.selected.password = '';
        modalAuthenticationComponent.selected.associate = false;
        modalAuthenticationComponent.submit();

        expect(modalAuthenticationComponent.selected.message).toEqual("Password for mntner: 'b-mnt' too short");
    });

    it('should detect invalid password', async () => {
        modalAuthenticationComponent.selected.item = { type: 'mntner', key: 'b-mnt' };
        modalAuthenticationComponent.selected.password = 'secret';
        modalAuthenticationComponent.selected.associate = false;

        modalAuthenticationComponent.submit();

        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true' }).flush({
            objects: {
                object: [
                    {
                        source: { id: 'RIPE' },
                        'primary-key': { attribute: [{ name: 'mntner', value: 'b-mnt' }] },
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'b-mnt' },
                                { name: 'mnt-by', value: 'b-mnt' },
                                { name: 'source', value: 'RIPE', comment: 'Filtered' },
                            ],
                        },
                    },
                ],
            },
        });

        await componentFixture.whenStable();

        expect(modalAuthenticationComponent.selected.message).toEqual("You have not supplied the correct password for mntner: 'b-mnt'");
    });

    it('should close the modal and return selected item when ok', async () => {
        modalAuthenticationComponent.selected.item = { type: 'mntner', key: 'b-mnt' };
        modalAuthenticationComponent.selected.password = 'secret';
        modalAuthenticationComponent.selected.associate = false;

        modalAuthenticationComponent.submit();

        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true' }).flush({
            objects: {
                object: [
                    {
                        source: { id: 'RIPE' },
                        'primary-key': { attribute: [{ name: 'mntner', value: 'b-mnt' }] },
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'b-mnt' },
                                { name: 'mnt-by', value: 'b-mnt' },
                                { name: 'source', value: 'RIPE' },
                            ],
                        },
                    },
                ],
            },
        });

        await componentFixture.whenStable();
        httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush({
            user: {
                username: 'dummy@ripe.net',
                displayName: 'Test User',
                uuid: 'aaaa-bbbb-cccc-dddd',
                active: 'true',
            },
        });

        expect(credentialsServiceMock.setCredentials).toHaveBeenCalledWith('b-mnt', 'secret');

        expect(modalMock.close).toHaveBeenCalledWith({ $value: { selectedItem: { type: 'mntner', key: 'b-mnt' } } });
    });

    it('should associate and close the modal and return selected item when ok', async () => {
        modalAuthenticationComponent.selected.item = { type: 'mntner', key: 'b-mnt', auth: [] };
        modalAuthenticationComponent.selected.password = 'secret';
        modalAuthenticationComponent.selected.associate = true;

        modalAuthenticationComponent.submit();

        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true' }).flush({
            objects: {
                object: [
                    {
                        source: { id: 'RIPE' },
                        'primary-key': { attribute: [{ name: 'mntner', value: 'b-mnt' }] },
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'b-mnt' },
                                { name: 'mnt-by', value: 'b-mnt' },
                                { name: 'source', value: 'RIPE' },
                            ],
                        },
                    },
                ],
            },
        });

        await componentFixture.whenStable();
        httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush({
            user: {
                username: 'dummy@ripe.net',
                displayName: 'Test User',
                uuid: 'aaaa-bbbb-cccc-dddd',
                active: 'true',
            },
        });

        const resp = {
            objects: {
                object: [
                    {
                        'primary-key': { attribute: [{ name: 'mntner', value: 'b-mnt' }] },
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'b-mnt' },
                                { name: 'mnt-by', value: 'b-mnt' },
                                { name: 'auth', value: 'SSO dummy@ripe.net' },
                                { name: 'source', value: 'RIPE' },
                            ],
                        },
                    },
                ],
            },
        };

        httpMock.expectOne({ method: 'PUT', url: 'api/whois/RIPE/mntner/b-mnt?password=secret' }).flush(resp);
        await componentFixture.whenStable();

        expect(credentialsServiceMock.setCredentials).toHaveBeenCalledWith('b-mnt', 'secret');
        expect(credentialsServiceMock.removeCredentials).toHaveBeenCalled();

        expect(modalMock.close).toHaveBeenCalledWith({
            $value: {
                selectedItem: { type: 'mntner', key: 'b-mnt', auth: ['SSO'], mine: true },
                response: jasmine.any(Object),
            },
        });
    });

    it('should sent attributes without comments when authorise-associate current user to object', async () => {
        modalAuthenticationComponent.selected.item = { type: 'mntner', key: 'b-mnt', auth: [] };
        modalAuthenticationComponent.selected.password = 'secret';
        modalAuthenticationComponent.selected.associate = true;

        modalAuthenticationComponent.submit();

        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true' }).flush({
            objects: {
                object: [
                    {
                        source: { id: 'RIPE' },
                        'primary-key': { attribute: [{ name: 'mntner', value: 'b-mnt' }] },
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'b-mnt' },
                                { name: 'mnt-by', value: 'b-mnt' },
                                {
                                    $$meta: {
                                        $$idx: undefined,
                                        $$isEnum: undefined,
                                        $$mandatory: true,
                                        $$multiple: true,
                                        $$primaryKey: undefined,
                                        $$refs: ['KEY-CERT'],
                                    },
                                    comment: 'Remco',
                                    link: { type: 'locator', href: 'https://rest-prepdev.db.ripe.net/ripe/key-cert/PGPKEY-170757B6' },
                                    name: 'auth',
                                    'referenced-type': 'key-cert',
                                    value: 'PGPKEY-170757B6 # Remco',
                                },
                                { name: 'source', value: 'RIPE' },
                            ],
                        },
                    },
                ],
            },
        });

        await componentFixture.whenStable();
        httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush({
            user: {
                username: 'dummy@ripe.net',
                displayName: 'Test User',
                uuid: 'aaaa-bbbb-cccc-dddd',
                active: 'true',
            },
        });

        const resp = {
            objects: {
                object: [
                    {
                        'primary-key': { attribute: [{ name: 'mntner', value: 'b-mnt' }] },
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'b-mnt' },
                                { name: 'mnt-by', value: 'b-mnt' },
                                {
                                    $$meta: {
                                        $$idx: undefined,
                                        $$isEnum: undefined,
                                        $$mandatory: true,
                                        $$multiple: true,
                                        $$primaryKey: undefined,
                                        $$refs: ['KEY-CERT'],
                                    },
                                    comment: 'Remco',
                                    link: { type: 'locator', href: 'https://rest-prepdev.db.ripe.net/ripe/key-cert/PGPKEY-170757B6' },
                                    name: 'auth',
                                    'referenced-type': 'key-cert',
                                    value: 'PGPKEY-170757B6',
                                },
                                { name: 'auth', value: 'SSO dummy@ripe.net' },
                                { name: 'source', value: 'RIPE' },
                            ],
                        },
                    },
                ],
            },
        };

        httpMock.expectOne({ method: 'PUT', url: 'api/whois/RIPE/mntner/b-mnt?password=secret' }).flush(resp);
        await componentFixture.whenStable();

        expect(credentialsServiceMock.setCredentials).toHaveBeenCalledWith('b-mnt', 'secret');
        expect(credentialsServiceMock.removeCredentials).toHaveBeenCalled();

        expect(modalMock.close).toHaveBeenCalledWith({
            $value: {
                selectedItem: { type: 'mntner', key: 'b-mnt', auth: ['SSO'], mine: true },
                response: jasmine.any(Object),
            },
        });
    });

    it('should show error message from backend in case of association error', async () => {
        modalAuthenticationComponent.selected.item = { type: 'mntner', key: 'b-mnt' };
        modalAuthenticationComponent.selected.password = 'secret';
        modalAuthenticationComponent.selected.associate = true;

        modalAuthenticationComponent.submit();
        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true' }).flush({
            objects: {
                object: [
                    {
                        source: { id: 'RIPE' },
                        'primary-key': { attribute: [{ name: 'mntner', value: 'b-mnt' }] },
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'b-mnt' },
                                { name: 'mnt-by', value: 'b-mnt' },
                                { name: 'source', value: 'RIPE' },
                            ],
                        },
                    },
                ],
            },
        });

        await componentFixture.whenStable();
        httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush({
            user: {
                username: 'dummy@ripe.net',
                displayName: 'Test User',
                uuid: 'aaaa-bbbb-cccc-dddd',
                active: 'true',
            },
        });

        httpMock.expectOne({ method: 'PUT', url: 'api/whois/RIPE/mntner/b-mnt?password=secret' }).flush(
            {
                errormessages: {
                    errormessage: [
                        {
                            severity: 'Error',
                            text: 'Value cannot have a comment in auth: PGPKEY-5E5E8986 # LIR # LIR [key-cert] [locator: http://rest-prepdev.db.ripe.net/ripe/key-cert/PGPKEY-5E5E8986]',
                        },
                    ],
                },
                'terms-and-conditions': {
                    type: 'locator',
                    href: 'https://apps.db.ripe.net/db-web-ui/legal#terms-and-conditions',
                },
            },
            { status: 400, statusText: 'bad request' },
        );
        await componentFixture.whenStable();

        expect(modalMock.close).not.toHaveBeenCalledWith();
        expect(modalAuthenticationComponent.selected.message).toEqual(
            'Value cannot have a comment in auth: PGPKEY-5E5E8986 # LIR # LIR [key-cert] [locator: http://rest-prepdev.db.ripe.net/ripe/key-cert/PGPKEY-5E5E8986]',
        );
    });

    it('should formate error message from backend in case of association error', async () => {
        modalAuthenticationComponent.selected.item = { type: 'mntner', key: 'RENATER-MNT' };
        modalAuthenticationComponent.selected.password = 'RENATER-MNT';
        modalAuthenticationComponent.selected.associate = true;

        modalAuthenticationComponent.submit();
        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/mntner/RENATER-MNT?password=RENATER-MNT&unfiltered=true' }).flush({
            objects: {
                object: [
                    {
                        source: { id: 'RIPE' },
                        'primary-key': { attribute: [{ name: 'mntner', value: 'b-mnt' }] },
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'RENATER-MNT' },
                                { name: 'auth', value: 'MD5-PW BLAH1BLAH2BLAH3' },
                                { name: 'auth', value: 'SSO dummy@ripe.net' },
                                {
                                    link: {
                                        type: 'locator',
                                        href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/AS1717-MNT',
                                    },
                                    name: 'mnt-by',
                                    value: 'AS1717-MNT',
                                    'referenced-type': 'mntner',
                                },
                                { name: 'source', value: 'RIPE' },
                            ],
                        },
                    },
                ],
            },
        });

        await componentFixture.whenStable();
        httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush({
            user: {
                username: 'dummy@ripe.net',
                displayName: 'Test User',
                uuid: 'aaaa-bbbb-cccc-dddd',
                active: 'true',
            },
        });

        httpMock.expectOne({ method: 'PUT', url: 'api/whois/RIPE/mntner/RENATER-MNT?password=RENATER-MNT' }).flush(
            {
                errormessages: {
                    errormessage: [
                        {
                            severity: 'Error',
                            text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                            args: [{ value: 'mntner' }, { value: 'RENATER-MNT' }, { value: 'mnt-by' }, { value: 'AS1717-MNT' }],
                        },
                    ],
                },
                'terms-and-conditions': {
                    type: 'locator',
                    href: 'http://www.ripe.net/db/support/db-terms-conditions.pdf',
                },
            },
            { status: 401, statusText: 'Unauthorized' },
        );
        await componentFixture.whenStable();

        expect(modalMock.close).not.toHaveBeenCalledWith();
        expect(modalAuthenticationComponent.selected.message).toEqual(
            'Authorisation for [mntner] RENATER-MNT failed\nusing "mnt-by:"\nnot authenticated by: AS1717-MNT',
        );
    });

    it('should close the modal and return error when canceled', () => {
        modalAuthenticationComponent.cancel();
        expect(modalMock.dismiss).toHaveBeenCalled();
    });

    it('should set mntnersWithoutPassword to the scope', () => {
        expect(modalAuthenticationComponent.resolve.mntnersWithoutPassword).toEqual(mntnersWithoutPassword);
    });

    it('should not allow forceDelete if method is forceDelete', () => {
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        modalAuthenticationComponent.resolve.method = 'ForceDelete';
        expect(modalAuthenticationComponent.allowForceDelete()).toBeFalse();
    });

    it('should allow force delete if objectType is inetnum', () => {
        modalAuthenticationComponent.resolve.objectType = 'inetnum';
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBeTruthy();
    });

    it('should allow force delete if objectType is inet6num', () => {
        modalAuthenticationComponent.resolve.objectType = 'inet6num';
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBeTruthy();
    });

    it('should allow force delete if objectType is route', () => {
        modalAuthenticationComponent.resolve.objectType = 'route';
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBeTruthy();
    });

    it('should allow force delete if objectType is route6', () => {
        modalAuthenticationComponent.resolve.objectType = 'route6';
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBeTruthy();
    });

    it('should allow force delete if objectType is domain', () => {
        modalAuthenticationComponent.resolve.objectType = 'domain';
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBeTruthy();
    });

    it('should not allow force delete if objectType is mntner', () => {
        modalAuthenticationComponent.resolve.objectType = 'mntner';
        modalAuthenticationComponent.resolve.allowForcedDelete = true;
        expect(modalAuthenticationComponent.allowForceDelete()).toBeFalse();
    });

    it('should not allow force delete if objectType has RIPE-NCC-END-MNT', () => {
        modalAuthenticationComponent.resolve.objectType = 'inetnum';
        modalAuthenticationComponent.resolve.allowForcedDelete = false;
        expect(modalAuthenticationComponent.allowForceDelete()).toBeFalse();
    });
});
