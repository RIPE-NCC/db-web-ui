import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConfirmMaintainerComponent } from '../../../src/app/fmp/confirm-maintainer.component';
import { EmailLinkService } from '../../../src/app/fmp/email-link.services';
import { FmpErrorService } from '../../../src/app/fmp/fmp-error.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { AlertsService } from '../../../src/app/shared/alert/alerts.service';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';

describe('ConfirmMaintainerComponent', () => {
    let component: ConfirmMaintainerComponent;
    let fixture: ComponentFixture<ConfirmMaintainerComponent>;
    let mockEmailLinkService: any;
    let mockFmpErrorService: any;

    beforeEach(() => {
        mockEmailLinkService = jasmine.createSpyObj('EmailLinkService', ['get', 'update']);
        mockFmpErrorService = jasmine.createSpyObj('FmpErrorService', ['isYourAccountBlockedError']);
        TestBed.configureTestingModule({
            declarations: [ConfirmMaintainerComponent],
            imports: [],
            providers: [
                AlertsService,
                WhoisMetaService,
                WhoisResourcesService,
                PropertiesService,
                { provide: FmpErrorService, useValue: mockFmpErrorService },
                { provide: EmailLinkService, useValue: mockEmailLinkService },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
                { provide: Router, useValue: { navigate: () => {} } },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmMaintainerComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set maintainer and email on valid hash', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            hash: 'validhash',
            get: () => '',
            has: () => true,
        };
        const response = {
            mntner: 'maintainer',
            email: 'a@b.c',
            username: 'user',
            expiredDate: 20280808,
            currentUserAlreadyAssociated: false,
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.key).toBe('maintainer');
        expect(component.email).toBe('a@b.c');
        expect(component.user).toBe('user');

        expect(component.alertsService.hasErrors()).toBeFalsy();
        expect(component.alertsService.hasWarnings()).toBeFalsy();
        expect(component.alertsService.alerts?.infos.length > 0).toBeTruthy();
        expect(component.alertsService.alerts.infos[0].plainText).toBe('You are logged in with the RIPE NCC Access account user');
    });

    it('should throw an error if hash is not found', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            get: () => '',
            has: () => false,
        };
        fixture.detectChanges();
        expect(component.alertsService.alerts.errors.length).toBe(1);
        expect(component.alertsService.alerts.errors[0].plainText).toBe('No hash passed along');
    });

    it('should redirect to legacy on invalid hash', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            hash: 'invalidhash',
            get: () => '',
            has: () => true,
        };
        mockEmailLinkService.get.and.returnValue(throwError(() => 404));
        component.ngOnInit();
        fixture.detectChanges();

        expect(mockFmpErrorService.isYourAccountBlockedError).toHaveBeenCalled();
        expect(component.alertsService.alerts.errors[0].plainText).toContain('Error fetching email-link');
        expect(component.alertsService.alerts.warnings.length > 0).toBeFalsy();
        expect(component.alertsService.alerts.infos.length > 0).toBeFalsy();
    });

    it('should redirect to legacy on expired hash', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            hash: 'expiredhash',
            get: () => '',
            has: () => true,
        };
        const response = {
            mntner: 'maintainer',
            email: 'a@b.c',
            username: 'user',
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.alertsService.alerts.errors.length).toBe(0);
        expect(component.alertsService.alerts.warnings[0].plainText).toBe('Your link has expired');
        expect(component.alertsService.alerts.infos.length).toBe(0);
    });

    it('should parse correctly a date in the future', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            hash: 'parsefuturedatestringhash',
            get: () => '',
            has: () => true,
        };
        const response = {
            mntner: 'maintainer',
            email: 'a@b.c',
            expiredDate: '2114-08-20T02:35:51+02:00',
            username: 'user',
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.key).toBe('maintainer');
        expect(component.email).toBe('a@b.c');
        expect(component.user).toBe('user');

        expect(component.alertsService.alerts.errors.length).toBe(0);
        expect(component.alertsService.alerts.warnings.length).toBe(0);
        expect(component.alertsService.alerts.infos.length).toBe(1);
        expect(component.alertsService.alerts.infos[0].plainText).toBe('You are logged in with the RIPE NCC Access account user');
    });

    it('should inform user mntner already associated with current user', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            hash: 'validhash',
            get: () => '',
            has: () => true,
        };
        const response = {
            mntner: 'maintainer',
            email: 'a@b.c',
            username: 'user',
            expiredDate: 20280808,
            currentUserAlreadyManagesMntner: true,
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.key).toBe('maintainer');
        expect(component.email).toBe('a@b.c');
        expect(component.user).toBe('user');

        expect(component.alertsService.alerts.errors.length).toBe(0);
        expect(component.alertsService.alerts.warnings[0].plainText).toBe('Your RIPE NCC Access account is already associated with this mntner.');
        expect(component.alertsService.alerts.infos.length).toBe(0);
    });

    it('should return message if associate is cancelled', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            hash: 'validhash',
            get: () => '',
            has: () => true,
        };
        component.cancelAssociate();
        expect(component.alertsService.alerts.warnings[0].plainText).toBe(
            `<p>No changes were made to the <span class="mntner">MNTNER</span> object .</p><p>If you wish to add a different RIPE NCC Access account to your <strong>MNTNER</strong> object:<ol><li>Sign out of RIPE NCC Access.</li><li>Sign back in to RIPE NCC Access with the account you wish to use.</li><li>Click on the link in the instruction email again.</li></ol>`,
        );
    });

    it('should return message that linking account with mntner has succeeded', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            hash: 'validhash',
            get: () => '',
            has: () => true,
        };
        const response = {
            mntner: 'maintainer',
            email: 'a@b.c',
            username: 'user',
            expiredDate: 20280808,
            currentUserAlreadyManagesMntner: true,
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        const responsePut = {
            data: {
                mntner: 'maintainer',
                email: 'a@b.c',
                username: 'user',
                expiredDate: 20280808,
            },
        };
        mockEmailLinkService.update.and.returnValue(of(responsePut));
        spyOn(component.router, 'navigate');
        component.ngOnInit();
        fixture.detectChanges();
        component.associate();
        fixture.detectChanges();
        expect(component.router.navigate).toHaveBeenCalledWith(['fmp/ssoAdded', 'maintainer', 'user']);
    });

    it('should return a message that linking account with mntner has failed', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            hash: 'validhash',
            get: () => '',
            has: () => true,
        };
        const response = {
            mntner: 'maintainer',
            email: 'a@b.c',
            username: 'user',
            expiredDate: 20280808,
            currentUserAlreadyManagesMntner: true,
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        mockEmailLinkService.update.and.returnValue(throwError(() => 400));
        component.ngOnInit();
        fixture.detectChanges();
        component.associate();

        expect(component.alertsService.alerts.errors[0].plainText).toBe(
            `<p>An error occurred while adding the RIPE NCC Access account to the <span class="mntner">MNTNER</span> object.</p>` +
                `<p>No changes were made to the <span class="mntner">MNTNER</span> object maintainer.</p>` +
                `<p>If this error continues, please contact us at ripe-dbm@ripe.net for assistance.</p>`,
        );
    });

    it('should return a message that linking account with mntner has failed already contains SSO', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            hash: 'validhash',
            get: () => '',
            has: () => true,
        };
        const response = {
            mntner: 'maintainer',
            email: 'a@b.c',
            username: 'user',
            expiredDate: 20280808,
            currentUserAlreadyManagesMntner: true,
        };
        mockEmailLinkService.get.and.returnValue(of(response));
        mockEmailLinkService.update.and.returnValue(throwError(() => ({ status: 400, data: 'already contains SSO' })));
        component.ngOnInit();
        fixture.detectChanges();

        component.associate();
        expect(component.alertsService.alerts.errors[0].plainText).toBe('already contains SSO');
    });
});
