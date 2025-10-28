import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ApiKeyConfirmationDialogComponent } from '../../../src/app/apikeys/api-key-confirmation-dialog/api-key-confirmation-dialog.component';
import { ApiKeysService } from '../../../src/app/apikeys/api-keys.service';
import { CreateNewApiKeyComponent } from '../../../src/app/apikeys/create-new-api-key/create-new-api-key.component';
import { ApiKey } from '../../../src/app/apikeys/types';
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

    it('should search maintainers', fakeAsync(() => {
        const autocompleteResponse: IMntByModel[] = [{ key: 'maint-m', type: 'a' }];
        restServiceMock.autocomplete.and.returnValue(of(autocompleteResponse));

        component.maintainers = [{ key: 'search me' }];
        component.onInputChange(0, 'search me');
        tick(500);

        expect(restServiceMock.autocomplete).toHaveBeenCalledWith('mnt-by', 'search me', true, ['auth']);
        expect(component.maintainersOptions).toEqual(autocompleteResponse);
    }));

    it('should save the new apikey', () => {
        const apiKeyResponse: ApiKey = {
            expiresAt: '2024-01-01',
            lastUsed: new Date('2023-12-08T10:21:49.96061Z'),
            label: 'my key name',
            id: 'accessKey',
            secretKey: 'secretKey',
        };
        apiKeysServiceMock.saveApiKey.and.returnValue(of(apiKeyResponse));

        component.apiKeyName = 'fake api key name';
        component.expiresAt = new Date();
        component.maintainers = [{ key: 'fake maintainer' }];
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

    it('should save the new apikey when maintainer is undefined', () => {
        const apiKeyResponse: ApiKey = {
            expiresAt: '2025-11-26',
            lastUsed: new Date('2025-11-26T23:00:00Z'),
            label: 'my key name',
            id: 'accessKey',
            secretKey: 'secretKey',
        };
        apiKeysServiceMock.saveApiKey.and.returnValue(of(apiKeyResponse));

        component.apiKeyName = 'fake api key name';
        component.expiresAt = new Date('2025-11-26T23:00:00Z');
        component.maintainers = [{ key: '' }];
        component.saveApiKey();

        expect(apiKeysServiceMock.saveApiKey).toHaveBeenCalledWith('fake api key name', '2025-11-27T00:00:00+01:00', undefined);

        expect(matDialogMock.open).toHaveBeenCalledWith(ApiKeyConfirmationDialogComponent, {
            data: { id: apiKeyResponse.id, secretKey: apiKeyResponse.secretKey },
        });
    });

    it('should handle errors when saving new api aki', () => {
        const akiKeyErrorResponse = {
            error: {
                errormessages: {
                    errormessage: [{ text: 'my error' }],
                },
            },
        };
        apiKeysServiceMock.saveApiKey.and.returnValue(throwError(() => akiKeyErrorResponse));

        component.apiKeyName = 'fake api key name';
        component.expiresAt = new Date();
        component.maintainers = [{ key: 'fake maintainer' }];
        component.saveApiKey();

        //should clear previous error messages
        expect(alertsServiceMock.clearAlertMessages).toHaveBeenCalled();
        expect(alertsServiceMock.addGlobalError).toHaveBeenCalledWith('my error');
    });
});
