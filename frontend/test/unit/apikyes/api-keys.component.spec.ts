import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { ApiKeysComponent } from '../../../src/app/apikeys/api-keys.component';
import { ApiKeysService } from '../../../src/app/apikeys/api-keys.service';
import { KeyType } from '../../../src/app/apikeys/create-new-api-key/create-new-api-key.component';
import { IUserInfoOrganisation } from '../../../src/app/dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../../../src/app/dropdown/org-drop-down-shared.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { AlertsService } from '../../../src/app/shared/alert/alerts.service';
import { RestService } from '../../../src/app/updatesweb/rest.service';
import SpyObj = jasmine.SpyObj;

describe('ApiKeysComponent', () => {
    let component: ApiKeysComponent;
    let fixture: ComponentFixture<ApiKeysComponent>;
    let apiKeysServiceMock: SpyObj<ApiKeysService>;
    let properties: SpyObj<PropertiesService>;
    let alertsServiceMock: SpyObj<AlertsService>;
    let matDialogMock: SpyObj<MatDialog>;
    let paramMock: ParamMap;
    let selectedOrgSubject: Subject<IUserInfoOrganisation>;

    const mockOrg: IUserInfoOrganisation = {
        orgObjectId: '123',
        roles: ['ADMIN'],
    } as IUserInfoOrganisation;

    beforeEach(waitForAsync(() => {
        properties = jasmine.createSpyObj('PropertiesService', ['getTitleEnvironment'], {
            ENV: 'prod',
            SHOW_MENU_IDS: [],
        });
        // apiKeysServiceMock = jasmine.createSpyObj<ApiKeysService>('ApiKeysService', ['getApiKeys', 'deleteApiKey']);
        alertsServiceMock = jasmine.createSpyObj<AlertsService>('AlertsService', ['addGlobalError']);
        matDialogMock = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
        paramMock = convertToParamMap({});
        selectedOrgSubject = new Subject();

        let mockOrgService = {
            selectedOrgChanged$: selectedOrgSubject.asObservable(),
            getSelectedOrg: jasmine.createSpy().and.returnValue(mockOrg),
        };

        void TestBed.configureTestingModule({
            imports: [MatDialogModule, NoopAnimationsModule, ApiKeysComponent],
            providers: [
                provideNativeDateAdapter(),
                { provide: PropertiesService, useValue: properties },
                { provide: ApiKeysService, useValue: apiKeysServiceMock },
                { provide: RestService, useValue: {} },
                { provide: AlertsService, useValue: alertsServiceMock },
                { provide: MatDialog, useValue: matDialogMock },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: paramMock } } },
                { provide: OrgDropDownSharedService, useValue: mockOrgService },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        // apiKeysServiceMock.getApiKeys.and.returnValue(of(apiKeysResponse));
        fixture = TestBed.createComponent(ApiKeysComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should open create panel if apiKeyType in url-path is IP_ANALAYSER or MY_RESOURCES', () => {
        spyOn(paramMock, 'get').and.callFake(() => {
            return 'IP_ANALYSER';
        });
        component.ngOnInit();
        expect(component.initialCreateKeyType).toEqual(KeyType.IP_ANALYSER);
    });
});
