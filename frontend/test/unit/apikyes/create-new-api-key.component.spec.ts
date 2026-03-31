import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ApiKeyConfirmationDialogComponent } from '../../../src/app/apikeys/api-key-confirmation-dialog/api-key-confirmation-dialog.component';
import { ApiKeysService } from '../../../src/app/apikeys/api-keys.service';
import { CreateNewApiKeyComponent, KeyType } from '../../../src/app/apikeys/create-new-api-key/create-new-api-key.component';
import { ApiKey } from '../../../src/app/apikeys/types';
import { IUserInfoOrganisation } from '../../../src/app/dropdown/org-data-type.model';
import { AlertsService } from '../../../src/app/shared/alert/alerts.service';
import { IMntByModel } from '../../../src/app/shared/whois-response-type.model';
import { RestService } from '../../../src/app/updatesweb/rest.service';
import SpyObj = jasmine.SpyObj;

describe('CreateNewApiKeyComponent', () => {
    let component: CreateNewApiKeyComponent;
    let fixture: ComponentFixture<CreateNewApiKeyComponent>;
    let restServiceMock: SpyObj<RestService>;
    let apiKeysServiceMock: SpyObj<ApiKeysService>;
    let matDialogMock: SpyObj<MatDialog>;
    let alertsServiceMock: SpyObj<AlertsService>;

    const mockOrg: IUserInfoOrganisation = {
        orgObjectId: '123',
        roles: ['ADMIN'],
    } as IUserInfoOrganisation;

    const mockSuccessfulApiKeyCreateResponse: ApiKey = {
        expiresAt: '2025-11-26',
        lastUsed: new Date('2025-11-26T23:00:00Z'),
        label: 'my key name',
        id: 'accessKey',
        secretKey: 'secretKey',
        keyType: 'mntner',
    };

    beforeEach(waitForAsync(() => {
        restServiceMock = jasmine.createSpyObj<RestService>('RestService', ['autocomplete']);
        apiKeysServiceMock = jasmine.createSpyObj<ApiKeysService>('ApiKeysService', ['saveApiKey']);
        matDialogMock = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
        alertsServiceMock = jasmine.createSpyObj<AlertsService>('AlertsService', ['addGlobalError', 'clearAlertMessages']);
        void TestBed.configureTestingModule({
            imports: [MatDialogModule, MatNativeDateModule, NoopAnimationsModule, CreateNewApiKeyComponent],
            providers: [
                { provide: RestService, useValue: restServiceMock },
                { provide: ApiKeysService, useValue: apiKeysServiceMock },
                { provide: MatDialog, useValue: matDialogMock },
                { provide: AlertsService, useValue: alertsServiceMock },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateNewApiKeyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should init component for MAINTAINER key type by default', () => {
        component.ngOnInit();
        expect(component.selectedKeyType).toEqual(KeyType.MAINTAINER);
    });

    it('should init component with proper type', () => {
        component.initialCreateKeyType = KeyType.IP_ANALYSER;
        component.selectedOrg = mockOrg;
        component.ngOnInit();
        expect(component.selectedKeyType).toEqual(KeyType.IP_ANALYSER);
    });

    it('should init component with MAINTAINER type in case no selected organisation', () => {
        component.initialCreateKeyType = KeyType.IP_ANALYSER;
        component.ngOnInit();
        expect(component.selectedKeyType).toEqual(KeyType.MAINTAINER);
    });

    it('should search maintainers', fakeAsync(() => {
        const autocompleteResponse: IMntByModel[] = [{ key: 'maint-m', type: 'a' }];
        restServiceMock.autocomplete.and.returnValue(of(autocompleteResponse));

        component.maintainers = [{ key: 'search me' }];
        component.onInputChange(0, 'search me');
        tick(500);

        expect(restServiceMock.autocomplete).toHaveBeenCalledWith('mnt-by', 'search me', true, ['auth']);
        expect(component.maintainersOptions).toEqual(autocompleteResponse);
    }));

    it('should save the new MAINTAINER apikey', () => {
        const apiKeyResponse: ApiKey = {
            expiresAt: '2024-01-01',
            lastUsed: new Date('2023-12-08T10:21:49.96061Z'),
            label: 'my key name',
            id: 'accessKey',
            secretKey: 'secretKey',
            keyType: 'mntner',
        };
        apiKeysServiceMock.saveApiKey.and.returnValue(of(apiKeyResponse));

        component.selectedKeyType = KeyType.MAINTAINER;
        component.apiKeyName = 'fake api key name';
        component.expiresAt = new Date();
        component.maintainers = [{ key: 'fake maintainer' }];
        component.selectedOrg = mockOrg;
        component.saveApiKey();

        //should clear previous error messages
        expect(alertsServiceMock.clearAlertMessages).toHaveBeenCalled();

        expect(component.apiKeyName).toBeUndefined();
        expect(component.expiresAt).toBeUndefined();
        expect(component.maintainers).toEqual([{ key: '' }]);
        expect(matDialogMock.open).toHaveBeenCalledWith(ApiKeyConfirmationDialogComponent, {
            data: { id: apiKeyResponse.id, secretKey: apiKeyResponse.secretKey },
        });
    });

    it('should save the new MAINTAINER apikey when maintainer is undefined', () => {
        apiKeysServiceMock.saveApiKey.and.returnValue(of(mockSuccessfulApiKeyCreateResponse));

        component.selectedKeyType = KeyType.MAINTAINER;
        component.apiKeyName = 'fake api key name';
        component.expiresAt = new Date('2025-11-26T23:00:00Z');
        component.maintainers = [{ key: '' }];
        component.selectedOrg = mockOrg;
        component.saveApiKey();

        expect(apiKeysServiceMock.saveApiKey).toHaveBeenCalledWith('fake api key name', '2025-11-27T00:00:00+01:00', KeyType.MAINTAINER, undefined, '123');

        expect(matDialogMock.open).toHaveBeenCalledWith(ApiKeyConfirmationDialogComponent, {
            data: { id: mockSuccessfulApiKeyCreateResponse.id, secretKey: mockSuccessfulApiKeyCreateResponse.secretKey },
        });
    });

    it('should handle errors when saving new api key', () => {
        const akiKeyErrorResponse = {
            error: {
                errormessages: {
                    errormessage: [{ text: 'my error' }],
                },
            },
        };
        apiKeysServiceMock.saveApiKey.and.returnValue(throwError(() => akiKeyErrorResponse));

        component.selectedKeyType = KeyType.MAINTAINER;
        component.apiKeyName = 'fake api key name';
        component.expiresAt = new Date();
        component.maintainers = [{ key: 'fake maintainer' }];
        component.selectedOrg = mockOrg;
        component.saveApiKey();

        //should clear previous error messages
        expect(alertsServiceMock.clearAlertMessages).toHaveBeenCalled();
        expect(alertsServiceMock.addGlobalError).toHaveBeenCalledWith('my error');
    });

    it('should save the new IP_ANALYSER apikey', () => {
        apiKeysServiceMock.saveApiKey.and.returnValue(of(mockSuccessfulApiKeyCreateResponse));

        component.selectedKeyType = KeyType.IP_ANALYSER;
        component.apiKeyName = 'IP_ANALYSER-KEY';
        component.expiresAt = new Date('2025-11-26T23:00:00Z');
        component.selectedOrg = mockOrg;
        component.saveApiKey();

        expect(apiKeysServiceMock.saveApiKey).toHaveBeenCalledWith('IP_ANALYSER-KEY', '2025-11-27T00:00:00+01:00', KeyType.IP_ANALYSER, undefined, '123');

        expect(matDialogMock.open).toHaveBeenCalledWith(ApiKeyConfirmationDialogComponent, {
            data: { id: mockSuccessfulApiKeyCreateResponse.id, secretKey: mockSuccessfulApiKeyCreateResponse.secretKey },
        });
    });

    it('should save the new MY_RESOURCES apikey', () => {
        apiKeysServiceMock.saveApiKey.and.returnValue(of(mockSuccessfulApiKeyCreateResponse));

        component.selectedKeyType = KeyType.MY_RESOURCES;
        component.apiKeyName = 'MY_RESOURCES-KEY';
        component.expiresAt = new Date('2025-11-26T23:00:00Z');
        component.selectedOrg = mockOrg;
        component.saveApiKey();

        expect(apiKeysServiceMock.saveApiKey).toHaveBeenCalledWith('MY_RESOURCES-KEY', '2025-11-27T00:00:00+01:00', KeyType.MY_RESOURCES, undefined, '123');

        expect(matDialogMock.open).toHaveBeenCalledWith(ApiKeyConfirmationDialogComponent, {
            data: { id: mockSuccessfulApiKeyCreateResponse.id, secretKey: mockSuccessfulApiKeyCreateResponse.secretKey },
        });
    });
});
