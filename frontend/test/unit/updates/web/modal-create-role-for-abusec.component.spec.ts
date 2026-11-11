import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { PrefixService } from 'src/app/domainobject/prefix.service';
import { PropertiesService } from 'src/app/properties.service';
import { WhoisMetaService } from 'src/app/shared/whois-meta.service';
import { WhoisResourcesService } from 'src/app/shared/whois-resources.service';
import { MntnerService } from 'src/app/updatesweb/mntner.service';
import { ModalCreateRoleForAbuseCComponent } from 'src/app/updatesweb/modal-create-role-for-abusec.component';
import { RestService } from 'src/app/updatesweb/rest.service';
import type { MockedObject } from 'vitest';
type SpyObj<T> = MockedObject<T>;

describe('ModalCreateRoleForAbuseCComponent', () => {
    const source = 'RIPE';
    const maintainers = [
        { name: 'mntner', value: 'TEST29-MNT' },
        { name: 'mntner', value: 'RIPE-NCC-HM-MNT' },
    ];

    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ModalCreateRoleForAbuseCComponent>;
    let modalCreateRoleForAbuseCComponent: ModalCreateRoleForAbuseCComponent;
    let modalMock: any;
    let restServiceMock: any;
    let propertiesSpy: SpyObj<PropertiesService>;

    beforeEach(() => {
        modalMock = {
            close: vi.fn().mockName('NgbActiveModal.close'),
            dismiss: vi.fn().mockName('NgbActiveModal.dismiss'),
        };
        const routerMock = {
            navigate: vi.fn().mockName('Router.navigate'),
            navigateByUrl: vi.fn().mockName('Router.navigateByUrl'),
        };
        restServiceMock = {
            createObject: vi.fn().mockName('RestService.createObject'),
        };
        propertiesSpy = {
            isEnableNonAuthUpdates: vi.fn().mockName('PropertiesService.isEnableNonAuthUpdates'),
            isProdEnv: vi.fn().mockName('PropertiesService.isProdEnv'),
            ENV: 'prod',
            isAnyNccMntner: (mntnerKey: string) => {
                return ['RIPE-NCC-HM-MNT'].includes(mntnerKey);
            },
        } as any;
        TestBed.configureTestingModule({
            imports: [FormsModule, ModalCreateRoleForAbuseCComponent],
            providers: [
                { provide: NgbActiveModal, useValue: modalMock },
                WhoisResourcesService,
                MntnerService,
                WhoisMetaService,
                PrefixService,
                { provide: PropertiesService, useValue: propertiesSpy },
                { provide: RestService, useValue: restServiceMock },
                { provide: Router, useValue: routerMock },
                provideHttpClient(withXhr(), withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(ModalCreateRoleForAbuseCComponent);
        modalCreateRoleForAbuseCComponent = componentFixture.componentInstance;
        modalCreateRoleForAbuseCComponent.inputData = {
            maintainers: maintainers,
            source: source,
        };
        componentFixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create role with abuse-mailbox and close', () => {
        restServiceMock.createObject.mockReturnValue(of({ getAttributes: () => {} }));

        modalCreateRoleForAbuseCComponent.email = 'm@ripe.net';
        modalCreateRoleForAbuseCComponent.create();

        expect(vi.mocked(restServiceMock.createObject).mock.lastCall[2].objects.object[0].attributes.attribute).toContainEqual(
            expect.objectContaining({
                name: 'abuse-mailbox',
                value: 'm@ripe.net',
            }),
        );
        expect(modalMock.close).toHaveBeenCalled();
    });

    it('should remove mnt-by: RIPE-NCC-HM-MNT from creating role', () => {
        propertiesSpy.isProdEnv.mockReturnValue(true);
        propertiesSpy.ENV = 'prod';
        restServiceMock.createObject.mockReturnValue(of({ getAttributes: () => {} }));

        modalCreateRoleForAbuseCComponent.email = 'm@ripe.net';
        modalCreateRoleForAbuseCComponent.create();

        expect(vi.mocked(restServiceMock.createObject).mock.lastCall[2].objects.object[0].attributes.attribute).not.toContainEqual(
            expect.objectContaining({
                name: 'mnt-by',
                value: 'RIPE-NCC-HM-MNT',
            }),
        );
        expect(modalMock.close).toHaveBeenCalled();
    });

    it('should not remove mnt-by: RIPE-NCC-HM-MNT from creating role on not PROD environment', () => {
        propertiesSpy.isProdEnv.mockReturnValue(false);
        propertiesSpy.ENV = 'test';
        restServiceMock.createObject.mockReturnValue(of({ getAttributes: () => {} }));

        componentFixture.detectChanges();

        modalCreateRoleForAbuseCComponent.email = 'm@ripe.net';
        modalCreateRoleForAbuseCComponent.create();

        expect(vi.mocked(restServiceMock.createObject).mock.lastCall[2].objects.object[0].attributes.attribute).toContainEqual(
            expect.objectContaining({
                name: 'mnt-by',
                value: 'RIPE-NCC-HM-MNT',
            }),
        );
        expect(modalMock.close).toHaveBeenCalled();
    });

    it('should validate as valid email', () => {
        modalCreateRoleForAbuseCComponent.email = 'm@ripe.net';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(true);
    });

    it('should validate as invalid email', () => {
        modalCreateRoleForAbuseCComponent.email = '@ripe.net';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = '.@ripe.net';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = 'a b@ripe.net';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = 'a@b@ripe.net';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = 'ab@ripe';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = 'a..b@ripe.web';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = '.bc@ripe.web';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = 'ab.@ripe.web';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = 'ab@ripe..web';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = 'ab.ripe.web';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = '';
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
    });

    it('should cancel', () => {
        modalCreateRoleForAbuseCComponent.cancel();
        expect(modalMock.dismiss).toHaveBeenCalled();
    });
});
