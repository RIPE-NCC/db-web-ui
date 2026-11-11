import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { PropertiesService } from 'src/app/properties.service';
import { WhoisResourcesService } from 'src/app/shared/whois-resources.service';
import { ModalAuthenticationSSOPrefilledComponent } from 'src/app/updatesweb/modal-authentication-sso-prefilled.component';
import { RestService } from 'src/app/updatesweb/rest.service';
import { UserInfoService } from 'src/app/userinfo/user-info.service';

describe('ModalAuthenticationSSOPrefilledComponent', () => {
    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ModalAuthenticationSSOPrefilledComponent>;
    let modalAuthenticationSSOPrefilledComponent: ModalAuthenticationSSOPrefilledComponent;
    let modalMock: any;

    const mntners = [
        { type: 'mntner', key: 'TEST29-MNT', auth: ['SSO'] },
        { type: 'mntner', name: 'b-mnt', auth: ['SSO'] },
        { type: 'mntner', key: 'z-mnt', auth: ['SSO'] },
    ];

    let MockPropertiesService = {
        SOURCE: 'RIPE',
        PORTAL_URL: 'https://access.test.ripe.net/',
    };

    beforeEach(() => {
        modalMock = {
            close: vi.fn().mockName('NgbActiveModal.close'),
            dismiss: vi.fn().mockName('NgbActiveModal.dismiss'),
        };
        const routerMock = {
            navigate: vi.fn().mockName('Router.navigate'),
            navigateByUrl: vi.fn().mockName('Router.navigateByUrl'),
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, RouterModule, ModalAuthenticationSSOPrefilledComponent],
            providers: [
                { provide: NgbActiveModal, useValue: modalMock },
                WhoisResourcesService,
                UserInfoService,
                { provide: PropertiesService, useValue: MockPropertiesService },
                RestService,
                CookieService,
                { provide: Router, useValue: routerMock },
                provideHttpClient(withXhr(), withInterceptorsFromDi()),
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
                url: 'api/whois/override/RIPE/mntner/b-mnt?unfiltered=true',
            })
            .flush(getResp);

        httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' }).flush({
            user: {
                username: 'dummy@ripe.net',
                displayName: 'Test User',
                uuid: 'aaaa-bbbb-cccc-dddd',
                active: 'true',
            },
        });

        httpMock.expectOne({ method: 'PUT', url: 'api/whois/override/RIPE/mntner/b-mnt' }).flush(resp);

        await componentFixture.whenStable();

        expect(modalMock.close).toHaveBeenCalledWith({
            $value: {
                selectedItem: { type: 'mntner', key: 'b-mnt', auth: ['SSO'], mine: true },
                response: expect.any(Object),
            },
        });
    });
});
