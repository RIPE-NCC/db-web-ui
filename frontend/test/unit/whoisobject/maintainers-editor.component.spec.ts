import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { EMPTY, of, throwError } from 'rxjs';
import { AttributeMetadataService } from '../../../src/app/attribute/attribute-metadata.service';
import { AttributeSharedService } from '../../../src/app/attribute/attribute-shared.service';
import { CoreModule } from '../../../src/app/core/core.module';
import { PrefixService } from '../../../src/app/domainobject/prefix.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { MessageStoreService } from '../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../src/app/updatesweb/mntner.service';
import { RestService } from '../../../src/app/updatesweb/rest.service';
import { WebUpdatesCommonsService } from '../../../src/app/updatesweb/web-updates-commons.service';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';
import { MaintainersEditorComponent } from '../../../src/app/whois-object/maintainers-editor.component';
import { defaultMntsMock } from '../updates/mntner.service.spec';

describe('MaintainersEditorComponent', () => {
    describe('- create mode', () => {
        let httpMock: HttpTestingController;
        let component: MaintainersEditorComponent;
        let fixture: ComponentFixture<MaintainersEditorComponent>;
        let modalMock: any;
        const BACKSPACE_KEYCODE = 8;

        beforeEach(() => {
            modalMock = jasmine.createSpyObj('NgbModal', ['open']);
            TestBed.configureTestingModule({
                declarations: [MaintainersEditorComponent],
                imports: [SharedModule, CoreModule, NgSelectModule],
                providers: [
                    AttributeSharedService,
                    AttributeMetadataService,
                    MntnerService,
                    MessageStoreService,
                    RestService,
                    {
                        provide: Router,
                        useValue: {
                            navigate: () => {},
                        },
                    },
                    PropertiesService,
                    PrefixService,
                    WebUpdatesCommonsService,
                    UserInfoService,
                    { provide: NgbModal, useValue: modalMock },
                    provideHttpClient(withInterceptorsFromDi()),
                    provideHttpClientTesting(),
                ],
            });
            httpMock = TestBed.inject(HttpTestingController);
            fixture = TestBed.createComponent(MaintainersEditorComponent);
            component = fixture.componentInstance;
            component.whoisObject = NG_MODEL();
        });

        afterEach(() => {
            httpMock.verify();
        });

        it('should ask for password after add non-sso maintainer with password - create case.', async () => {
            modalMock.open.and.returnValue({ componentInstance: {}, closed: EMPTY, dismissed: EMPTY });
            spyOn(component.restService, 'fetchMntnersForSSOAccount').and.returnValue(of(USER_WITH_ONE_SSO_ASSOCIATED_MNT_MOCK));
            spyOn(component, 'onMntnerRemoved');
            fixture.detectChanges();
            await fixture.whenStable();
            // simulate manual removal of the last and only mntner
            const mntInput = fixture.debugElement.query(By.css('ng-select'));
            triggerKeyDownEvent(mntInput, BACKSPACE_KEYCODE);
            expect(component.onMntnerRemoved).toHaveBeenCalled();
            expect(component.mntners.object.length === 0).toBeTruthy();

            // simulate manual addition of a new mntner with only md5
            component.mntners.object = [{ mine: false, type: 'mntner', auth: ['MD5'], key: 'TEST-MNT-1' }];
            component.onMntnerAdded({ mine: false, type: 'mntner', auth: ['MD5'], key: 'TEST-MNT-1' });
            await fixture.whenStable();
            expect(modalMock.open).toHaveBeenCalled();
        });

        it('should add a null when removing the last maintainer.', async () => {
            spyOn(component.restService, 'fetchMntnersForSSOAccount').and.returnValue(of(USER_WITH_ONE_SSO_ASSOCIATED_MNT_MOCK));
            fixture.detectChanges();
            expect(component.mntners.object.length).toEqual(1);
            expect(component.mntners.object[0].key).toEqual('TEST-MNT');
            // remove last mntner
            component.onMntnerRemoved(component.mntners.object[0]);
            await fixture.whenStable();
            expect(component.attributes.find((attr) => attr.name === 'mnt-by').value).toEqual('');
        });

        it('should add the selected maintainers to the object emit update-mntners-clbk', async () => {
            spyOn(component.updateMntnersClbk, 'emit');
            spyOn(component.mntnerService, 'needsPasswordAuthentication').and.returnValue(false);
            fixture.detectChanges();
            expect(component.mntners.object.length).toEqual(0);
            component.onMntnerAdded({ mine: false, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT-1' });
            httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(MNTNERS_SSO_ACCOUNT_RESPONS);
            await fixture.whenStable();
            expect(component.mntners.object.length).toEqual(2);
            expect(component.updateMntnersClbk.emit).toHaveBeenCalled();
        });

        it('should remove just added mnt in case authentication was canceled', async () => {
            modalMock.open.and.returnValue({ componentInstance: {}, closed: EMPTY, dismissed: of('cancel') });
            spyOn(component.mntnerService, 'needsPasswordAuthentication').and.returnValue(true);
            component.ngOnInit();
            httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(MNTNERS_SSO_ACCOUNT_RESPONS);
            expect(component.attributes.length).toEqual(10);
            component.onMntnerAdded({ mine: false, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT-1' });
            expect(component.attributes.length).toEqual(10);
        });

        it('should not remove just added mnt in case authentication was success', async () => {
            modalMock.open.and.returnValue({ componentInstance: {}, closed: EMPTY, dismissed: EMPTY });
            spyOn(component.mntnerService, 'needsPasswordAuthentication').and.returnValue(true);
            component.ngOnInit();
            httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(MNTNERS_SSO_ACCOUNT_RESPONS);
            expect(component.attributes.length).toEqual(10);
            component.onMntnerAdded({ mine: false, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT-1' });
            expect(component.attributes.length).toEqual(11);
        });

        it('should remove the selected maintainers from the object emit update-mntners-clbk', async () => {
            spyOn(component.updateMntnersClbk, 'emit');
            spyOn(component.mntnerService, 'needsPasswordAuthentication').and.returnValue(false);
            fixture.detectChanges();
            httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([
                {
                    mine: false,
                    type: 'mntner',
                    auth: ['MD5'],
                    key: 'TEST-MNT-1',
                },
            ]);
            await fixture.whenStable();
            component.mntners.object = [{ mine: false, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT-1' }];
            expect(component.mntners.object.length).toEqual(1);
            component.onMntnerRemoved({ mine: false, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT-1' });
            await fixture.whenStable();
            expect(component.mntners.object.length).toEqual(0);
            expect(component.mntners.sso.length).toEqual(1);
            expect(component.updateMntnersClbk.emit).toHaveBeenCalled();
        });

        it('should remove mnt-by on backspace one by one', async () => {
            spyOn(component.restService, 'fetchMntnersForSSOAccount').and.returnValue(of(USER_WITH_MORE_ASSOCIATED_MNT_MOCK));
            spyOn(component, 'onMntnerRemoved').and.callThrough();
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.attributes.length).toBe(12);
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('#selectMaintainerDropdown .ng-value')).length).toBe(4);
            const mntInput = fixture.debugElement.query(By.css('ng-select'));
            triggerKeyDownEvent(mntInput, BACKSPACE_KEYCODE);
            expect(component.onMntnerRemoved).toHaveBeenCalled(); //method which remove mnt-by from attributes
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('#selectMaintainerDropdown .ng-value')).length).toBe(3);
            expect(component.attributes.length).toBe(11);
            triggerKeyDownEvent(mntInput, BACKSPACE_KEYCODE);
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('#selectMaintainerDropdown .ng-value')).length).toBe(2);
            expect(component.attributes.length).toBe(10);
        });

        it('should populate mntner data', async () => {
            spyOn(component.restService, 'fetchMntnersForSSOAccount').and.returnValue(of(MNTNERS_SSO_ACCOUNT_RESPONS));
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.mntners.sso.length).toBe(2);
            expect(component.mntners.objectOriginal.length).toBe(0);
            expect(component.mntners.object.length).toBe(2);
            expect(component.mntners.defaultMntner.length).toBe(0);

            expect(component.mntners.sso[0].key).toEqual('TEST-MNT');
            expect(component.mntners.sso[0].type).toEqual('mntner');
            expect(component.mntners.sso[1].key).toEqual('TESTSSO-MNT');
            expect(component.mntners.sso[1].type).toEqual('mntner');

            expect(component.mntners.object[0].key).toEqual('TEST-MNT');
            expect(component.mntners.object[0].type).toEqual('mntner');
            expect(component.mntners.object[0].mine).toEqual(true);
            expect(component.mntners.object[0].auth).toEqual(['SSO']);

            expect(component.mntners.object[1].key).toEqual('TESTSSO-MNT');
            expect(component.mntners.object[1].type).toEqual('mntner');
            expect(component.mntners.object[1].mine).toEqual(true);
            expect(component.mntners.object[1].auth).toEqual(['MD5-PW', 'SSO']);
        });

        it('should filter associated mnts by showing just associated default mnts of selected organisation', async () => {
            const selectedOrg = {
                membershipId: 72439,
                orgObjectId: 'ORG-TEST1-RIPE',
                organisationName: 'TEST LIR',
                regId: 'test.regid',
            };
            spyOn(component.restService, 'fetchMntnersForSSOAccount').and.returnValue(of(MNTNERS_SSO_ACCOUNT_RESPONS));
            spyOn(component.mntnerService, 'getDefaultMaintainers').and.returnValue(of(defaultMntsMock));
            //@ts-ignore
            spyOn(component.orgDropDownSharedService, 'getSelectedOrg').and.returnValue(selectedOrg);
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.mntners.sso.length).toBe(2);
            expect(component.mntners.objectOriginal.length).toBe(0);
            expect(component.mntners.object.length).toBe(1);
            expect(component.mntners.defaultMntner.length).toBe(1);

            expect(component.mntners.sso[0].key).toEqual('TEST-MNT');
            expect(component.mntners.sso[0].type).toEqual('mntner');
            expect(component.mntners.sso[1].key).toEqual('TESTSSO-MNT');
            expect(component.mntners.sso[1].type).toEqual('mntner');

            expect(component.mntners.object[0].key).toEqual('TEST-MNT');
            expect(component.mntners.object[0].type).toEqual('mntner');
            expect(component.mntners.object[0].mine).toEqual(true);
            expect(component.mntners.object[0].auth).toEqual(['SSO']);

            expect(component.mntners.defaultMntner[0].key).toEqual('TEST-MNT');
            expect(component.mntners.defaultMntner[0].type).toEqual('mntner');
            expect(component.mntners.defaultMntner[0].mine).toEqual(true);
            expect(component.mntners.defaultMntner[0].auth).toEqual(['SSO']);
        });

        it('should report error when fetching sso maintainers fails', () => {
            spyOn(component.restService, 'fetchMntnersForSSOAccount').and.returnValue(throwError(() => ({ data: 'error' })));
            fixture.detectChanges();
            expect(component.alertsService.alerts.errors.length > 0).toBeTruthy();
            expect(component.alertsService.alerts.errors[0].plainText).toEqual('Error fetching maintainers associated with this SSO account');
        });
    });

    describe('- modify mode', () => {
        let httpMock: HttpTestingController;
        let component: MaintainersEditorComponent;
        let fixture: ComponentFixture<MaintainersEditorComponent>;
        let modalMock: any;
        let webUpdatesCommonsServiceMock: any;

        beforeEach(() => {
            modalMock = jasmine.createSpyObj('NgbModal', ['open']);
            webUpdatesCommonsServiceMock = jasmine.createSpyObj('WebUpdatesCommonsService', ['performAuthentication']);
            TestBed.configureTestingModule({
                declarations: [MaintainersEditorComponent],
                imports: [SharedModule, CoreModule, NgSelectModule],
                providers: [
                    AttributeSharedService,
                    AttributeMetadataService,
                    MntnerService,
                    MessageStoreService,
                    RestService,
                    {
                        provide: Router,
                        useValue: {
                            navigate: () => {},
                        },
                    },
                    PropertiesService,
                    PrefixService,
                    WebUpdatesCommonsService,
                    UserInfoService,
                    { provide: NgbModal, useValue: modalMock },
                    provideHttpClient(withInterceptorsFromDi()),
                    provideHttpClientTesting(),
                ],
            });
            httpMock = TestBed.inject(HttpTestingController);
            fixture = TestBed.createComponent(MaintainersEditorComponent);
            component = fixture.componentInstance;
            component.whoisObject = ORG_MOCK();
        });

        afterEach(() => {
            httpMock.verify();
        });

        it('should remove duplicated maintainers', async () => {
            fixture.detectChanges();
            // get SSO maintainers
            httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([
                { key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true },
                { key: 'TESTSSO-MNT', type: 'mntner', auth: ['MD5-PW'], mine: true },
            ]);
            // fail to get maintainer details
            httpMock
                .expectOne({
                    method: 'GET',
                    url: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT',
                })
                .flush(
                    [
                        {
                            key: 'TEST-MNT',
                            type: 'mntner',
                            auth: ['MD5-PW'],
                        },
                    ],
                    { status: 200, statusText: 'OK' },
                );
            await fixture.whenStable();
            expect(component.mntners.object.length).toBe(1);
        });

        it('should report error when fetching maintainer details fails', async () => {
            fixture.detectChanges();
            // get SSO maintainers
            httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([
                { key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true },
                { key: 'TESTSSO-MNT', type: 'mntner', auth: ['MD5-PW'], mine: true },
            ]);
            // fail to get maintainer details
            httpMock
                .expectOne({
                    method: 'GET',
                    url: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT',
                })
                .flush({}, { status: 404, statusText: 'error' });
            await fixture.whenStable();
            expect(component.alertsService.alerts.errors.length > 0).toBeTruthy();
            expect(component.alertsService.alerts.errors[0].plainText).toEqual('Error fetching maintainer details');
        });
    });

    function triggerKeyDownEvent(element: DebugElement, which: number, key = ''): void {
        element.triggerEventHandler('keydown', {
            which: which,
            key: key,
            preventDefault: () => {},
        });
    }
});

const NG_MODEL = () => ({
    attributes: {
        attribute: [
            {
                name: 'prefix',
                value: '',
                $$error: '',
                $$info: '',
                $$invalid: true,
                $$hidden: true,
                $$disable: false,
                $$id: 'attr-0',
            },
            {
                name: 'nserver',
                value: '',
                $$error: '',
                $$invalid: true,
                $$hidden: true,
                $$disable: false,
                $$id: 'attr-1',
            },
            {
                name: 'nserver',
                value: '',
                $$error: '',
                $$invalid: true,
                $$hidden: true,
                $$disable: false,
                $$id: 'attr-2',
            },
            {
                name: 'reverse-zone',
                value: '',
                $$invalid: true,
                $$hidden: true,
                $$disable: false,
                $$id: 'attr-3',
            },
            {
                name: 'admin-c',
                value: '',
                $$invalid: true,
                $$hidden: true,
                $$disable: false,
                $$id: 'attr-4',
            },
            {
                name: 'tech-c',
                value: '',
                $$invalid: true,
                $$hidden: true,
                $$disable: false,
                $$id: 'attr-5',
            },
            {
                name: 'zone-c',
                value: '',
                $$invalid: true,
                $$hidden: true,
                $$disable: false,
                $$id: 'attr-6',
            },
            {
                name: 'mnt-by',
                value: '',
                $$invalid: true,
                $$hidden: false,
                $$disable: false,
                $$id: 'attr-7',
            },
            {
                name: 'source',
                value: '',
                $$invalid: true,
                $$hidden: true,
                $$disable: true,
                $$id: 'attr-8',
            },
        ],
    },
    source: {
        id: 'RIPE',
    },
});

const ORG_MOCK = () => ({
    type: 'organisation',
    link: {
        type: 'locator',
        href: 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-TEST70-RIPE',
    },
    source: {
        id: 'ripe',
    },
    'primary-key': {
        attribute: [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
        ],
    },
    attributes: {
        attribute: [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
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
});

const USER_WITH_MORE_ASSOCIATED_MNT_MOCK = [
    { mine: true, type: 'mntner', auth: ['MD5-PW', 'SSO'], key: 'TST12-MNT' },
    { mine: true, type: 'mntner', auth: ['MD5-PW', 'SSO', 'PGPKEY-TEST01', 'PGPKEY-TEST02'], key: 'TST10-MNT' },
    { mine: true, type: 'mntner', auth: ['MD5-PW', 'SSO'], key: 'TEST01-MNT' },
    { mine: true, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT' },
];

const USER_WITH_ONE_SSO_ASSOCIATED_MNT_MOCK = [{ mine: true, type: 'mntner', auth: ['SSO'], key: 'TEST-MNT' }];

const MNTNERS_SSO_ACCOUNT_RESPONS = [
    { key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true },
    { key: 'TESTSSO-MNT', type: 'mntner', auth: ['MD5-PW', 'SSO'], mine: true },
];
