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
import { ModalAuthenticationSSOPrefilledComponent } from '../../../../src/app/updatesweb/modal-authentication-sso-prefilled.component';
import { RestService } from '../../../../src/app/updatesweb/rest.service';
import { UserInfoService } from '../../../../src/app/userinfo/user-info.service';

describe('ModalAuthenticationSSOPrefilledComponent', () => {
    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ModalAuthenticationSSOPrefilledComponent>;
    let modalAuthenticationSSOPrefilledComponent: ModalAuthenticationSSOPrefilledComponent;
    let modalMock: any;
    let credentialsServiceMock: any;

    const mntners = [
        { type: 'mntner', key: 'TEST29-MNT', auth: ['MD5-PW'] },
        { type: 'mntner', name: 'b-mnt', auth: ['MD5-PW'] },
    ];

    const mntnersWithoutPassword = [{ type: 'mntner', key: 'z-mnt', auth: ['SSO'] }];

    let MockPropertiesService = {
        WHOIS_OVERRIDE: 'whois,test',
        SOURCE: 'RIPE',
        PORTAL_URL: 'https://access.test.ripe.net/',
    };

    beforeEach(() => {
        modalMock = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
        const routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        credentialsServiceMock = jasmine.createSpyObj('CredentialsService', ['hasCredentials', 'getCredentials', 'removeCredentials', 'setCredentials']);
        TestBed.configureTestingModule({
            imports: [FormsModule, SharedModule, RouterModule, ModalAuthenticationSSOPrefilledComponent],
            providers: [
                { provide: NgbActiveModal, useValue: modalMock },
                WhoisResourcesService,
                UserInfoService,
                { provide: CredentialsService, useValue: credentialsServiceMock },
                { provide: PropertiesService, useValue: MockPropertiesService },
                RestService,
                CookieService,
                { provide: Router, useValue: routerMock },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(ModalAuthenticationSSOPrefilledComponent);
        modalAuthenticationSSOPrefilledComponent = componentFixture.componentInstance;
        modalAuthenticationSSOPrefilledComponent.resolve = {
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

    it('SSO should be added in case associate', async () => {
        modalAuthenticationSSOPrefilledComponent.selected.item = { type: 'mntner', key: 'b-mnt' };
        modalAuthenticationSSOPrefilledComponent.submit();

        const getResp = {
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
        };

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

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/mntner/b-mnt?override=whois%2Ctest%2CAutomatically%20Added%20SSO%20%7Bnotify%3Dfalse%7D&unfiltered=true',
            })
            .flush(getResp);

        expect(credentialsServiceMock.setCredentials).toHaveBeenCalledWith('b-mnt', 'whois,test,Automatically Added SSO {notify=false}');

        httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush({
            user: {
                username: 'dummy@ripe.net',
                displayName: 'Test User',
                uuid: 'aaaa-bbbb-cccc-dddd',
                active: 'true',
            },
        });

        httpMock
            .expectOne({ method: 'PUT', url: 'api/whois/RIPE/mntner/b-mnt?override=whois%2Ctest%2CAutomatically%20Added%20SSO%20%7Bnotify%3Dfalse%7D' })
            .flush(resp);

        await componentFixture.whenStable();

        expect(credentialsServiceMock.removeCredentials).toHaveBeenCalled();

        expect(modalMock.close).toHaveBeenCalledWith({
            $value: {
                selectedItem: { type: 'mntner', key: 'b-mnt', auth: ['SSO'], mine: true },
                response: jasmine.any(Object),
            },
        });
    });
});
