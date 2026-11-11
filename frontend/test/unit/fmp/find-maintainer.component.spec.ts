import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FindMaintainerComponent } from 'src/app/fmp/find-maintainer.component';
import { FindMaintainerService } from 'src/app/fmp/find-maintainer.service';
import { FmpErrorService } from 'src/app/fmp/fmp-error.service';
import { PropertiesService } from 'src/app/properties.service';
import { UserInfoService } from 'src/app/userinfo/user-info.service';

describe('FindMaintainerComponent', () => {
    let component: FindMaintainerComponent;
    let fixture: ComponentFixture<FindMaintainerComponent>;
    let findMaintainerService: any;
    let userInfoService: any;
    let mockFmpErrorService: any;

    beforeEach(() => {
        findMaintainerService = {
            search: vi.fn().mockName('FindMaintainerService.search'),
            sendMail: vi.fn().mockName('FindMaintainerService.sendMail'),
        };
        userInfoService = {
            getUserOrgsAndRoles: vi.fn().mockName('UserInfoService.getUserOrgsAndRoles'),
        };
        mockFmpErrorService = {
            isYourAccountBlockedError: vi.fn().mockName('FmpErrorService.isYourAccountBlockedError'),
        };
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FindMaintainerComponent],
            providers: [
                { provide: FindMaintainerService, useValue: findMaintainerService },
                { provide: UserInfoService, useValue: userInfoService },
                { provide: Router, useValue: { navigate: () => {} } },
                PropertiesService,
                { provide: FmpErrorService, useValue: mockFmpErrorService },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: (_username: string) => 'ana' } } } },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FindMaintainerComponent);
        component = fixture.componentInstance;
    });

    describe('Testing logged in user', () => {
        beforeEach(() => {
            userInfoService.getUserOrgsAndRoles.mockReturnValue(of(200));
        });

        it('should prefill maintainer name', () => {
            fixture.detectChanges();
            expect(component.maintainerKey).toBe('ana');
        });

        it('should retrieve maintainer data', () => {
            const maintainerKey = 'I-AM-MNT';
            const response = {
                maintainerKey: 'I-AM-MNT',
                selectedMaintainer: {
                    name: 'world',
                    attributes: {
                        attribute: [
                            {
                                name: 'mntner',
                                value: 'I-AM-MNT',
                            },
                            {
                                name: 'upd-to',
                                value: 'TSTADMINC-RIPE',
                            },
                        ],
                    },
                },
                email: 'TSTADMINC-RIPE',
                mntnerFound: true,
            };
            findMaintainerService.search.mockReturnValue(of(response));
            fixture.detectChanges();

            component.selectMaintainer(maintainerKey);
            expect(component.foundMaintainer.mntnerFound).toBeTruthy();
            expect(component.foundMaintainer.selectedMaintainer.name).toBe('world');
            expect(component.foundMaintainer.email).toBe('TSTADMINC-RIPE');

            expect(component.alertsService.alerts.errors.length).toBe(0);
            expect(component.alertsService.alerts.warnings.length).toBe(0);
        });

        it('should choose first upd-to address if multiple found', () => {
            const maintainerKey = 'I-AM-MNT';
            const response = {
                maintainerKey: 'I-AM-MNT',
                selectedMaintainer: {
                    name: 'world',
                    attributes: {
                        attribute: [
                            {
                                name: 'mntner',
                                value: 'I-AM-MNT',
                            },
                            {
                                name: 'upd-to',
                                value: 'first@ripe.net',
                            },
                            {
                                name: 'upd-to',
                                value: 'second@ripe.net',
                            },
                        ],
                    },
                },
                email: 'first@ripe.net',
                mntnerFound: true,
            };
            findMaintainerService.search.mockReturnValue(of(response));
            fixture.detectChanges();

            component.selectMaintainer(maintainerKey);
            expect(component.foundMaintainer.mntnerFound).toBeTruthy();
            expect(component.foundMaintainer.selectedMaintainer.name).toBe('world');
            expect(component.foundMaintainer.email).toBe('first@ripe.net');

            expect(component.alertsService.alerts.errors.length).toBe(0);
            expect(component.alertsService.alerts.warnings.length).toBe(0);
        });

        it('Validation result expired', () => {
            const maintainerKey = 'I-AM-MNT';
            const response = {
                maintainerKey: 'I-AM-MNT',
                selectedMaintainer: {
                    name: 'world',
                    attributes: {
                        attribute: [
                            {
                                name: 'mntner',
                                value: 'I-AM-MNT',
                            },
                            {
                                name: 'upd-to',
                                value: 'first@ripe.net',
                            },
                            {
                                name: 'upd-to',
                                value: 'second@ripe.net',
                            },
                        ],
                    },
                },
                email: 'first@ripe.net',
                mntnerFound: true,
                expired: false,
            };
            findMaintainerService.search.mockReturnValue(of(response));
            fixture.detectChanges();

            component.selectMaintainer(maintainerKey);
            expect(component.foundMaintainer.mntnerFound).toBeTruthy();
            expect(component.foundMaintainer.selectedMaintainer.name).toBe('world');
            expect(component.foundMaintainer.email).toBe('first@ripe.net');

            expect(component.alertsService.alerts.errors.length).toBe(0);
            expect(component.alertsService.alerts.warnings.length).toBe(1);
            expect(component.alertsService.alerts.warnings[0].plainText).toBe(
                'There is already an open request to reset the password of this maintainer. Proceeding now will cancel the earlier request.',
            );
        });

        it('should not set a maintainer on not found', () => {
            const maintainerKey = 'I-AM-NO-MNT';
            findMaintainerService.search.mockReturnValue(throwError(() => 'The maintainer could not be found.'));
            fixture.detectChanges();
            component.selectMaintainer(maintainerKey);

            expect(component.foundMaintainer).toBeUndefined();
            expect(component.alertsService.alerts.errors.length).toBe(1);
            expect(component.alertsService.alerts.errors[0].plainText).toBe('The maintainer could not be found.');
            expect(component.alertsService.alerts.warnings.length).toBe(0);
        });

        it('should not set a maintainer Error fetching maintainer', () => {
            const maintainerKey = 'I-AM-NO-MNT';
            findMaintainerService.search.mockReturnValue(throwError(() => 'Error fetching maintainer.'));
            fixture.detectChanges();
            component.selectMaintainer(maintainerKey);

            expect(component.foundMaintainer).toBeUndefined();

            expect(component.alertsService.alerts.errors.length).toBe(1);
            expect(component.alertsService.alerts.errors[0].plainText).toBe('Error fetching maintainer.');
            expect(component.alertsService.alerts.warnings.length).toBe(0);
        });

        it('should go to legacy when error validating email', () => {
            const maintainerKey = 'I-AM-NO-MNT';
            findMaintainerService.search.mockReturnValue(throwError(() => 'switchToManualResetProcess'));
            vi.spyOn(component.router, 'navigate').mockReturnValue(undefined);
            component.selectMaintainer(maintainerKey);
            fixture.detectChanges();

            expect(component.foundMaintainer).toBeUndefined();
            expect(component.alertsService.alerts.errors.length).toBe(0);

            expect(component.alertsService.alerts.warnings.length).toBe(0);
            expect(component.router.navigate).toHaveBeenCalledWith(['fmp/forgotMaintainerPassword'], {
                queryParams: { mntnerKey: 'I-AM-NO-MNT', voluntary: false },
            });
        });

        it('should go to mailSent-page when email is successfully sent', () => {
            const response = {
                mntner: 'WORLD',
                email: 'a@b.c',
            };
            findMaintainerService.sendMail.mockReturnValue(of(response));
            vi.spyOn(component.router, 'navigate').mockReturnValue(undefined);
            component.foundMaintainer = { email: 'a@b.c', maintainerKey: 'I-AM-MNT' };
            component.validateEmail();
            fixture.detectChanges();

            expect(component.alertsService.alerts.errors.length).toBe(0);
            expect(component.router.navigate).toHaveBeenCalledWith(['fmp/mailSent', 'a@b.c'], { queryParams: { maintainerKey: 'I-AM-MNT' } });
        });

        it('should report error validating mail', () => {
            findMaintainerService.sendMail.mockReturnValue(throwError(() => 500));
            vi.spyOn(component.router, 'navigate').mockReturnValue(undefined);
            component.foundMaintainer = { email: 'a@b.c', maintainerKey: 'I-AM-MNT' };
            component.validateEmail();
            fixture.detectChanges();

            expect(mockFmpErrorService.isYourAccountBlockedError).toHaveBeenCalled();
            expect(component.alertsService.alerts.errors.length).toBe(1);
            expect(component.alertsService.alerts.errors[0].plainText).toBe('Error sending email');
            expect(component.router.navigate).toHaveBeenCalledWith(['fmp/forgotMaintainerPassword'], {
                queryParams: { mntnerKey: 'I-AM-MNT', voluntary: false },
            });
        });

        it('should report error validating mail', () => {
            findMaintainerService.sendMail.mockReturnValue(throwError(() => 404));
            vi.spyOn(component.router, 'navigate').mockReturnValue(undefined);
            component.foundMaintainer = { email: 'a@b.c', maintainerKey: 'I-AM-MNT' };
            component.validateEmail();
            fixture.detectChanges();

            expect(component.alertsService.alerts.errors.length).toBe(1);
            expect(component.alertsService.alerts.errors[0].plainText).toBe('Error sending email');
            expect(component.router.navigate).toHaveBeenCalledWith(['fmp/forgotMaintainerPassword'], {
                queryParams: { mntnerKey: 'I-AM-MNT', voluntary: false },
            });
        });

        it('should return unathorized for validate email', () => {
            findMaintainerService.sendMail.mockReturnValue(throwError(() => ({ status: 401, data: 'Unauthorized' })));
            component.foundMaintainer = { email: 'a@b.c', maintainerKey: 'I-AM-MNT' };
            component.validateEmail();
            fixture.detectChanges();

            expect(component.alertsService.alerts.errors.length).toBe(0);
        });

        it('should call history back on cancel Window', () => {
            vi.spyOn(window.history, 'back').mockReturnValue(undefined);
            component.cancel();
            fixture.detectChanges();
            expect(window.history.back).toHaveBeenCalled();
        });

        it('should switchToManualResetProcess', () => {
            const maintainerKey = 'I-AM-MNT';
            vi.spyOn(component.router, 'navigate').mockReturnValue(undefined);
            component.foundMaintainer = { maintainerKey: maintainerKey };
            component.switchToManualResetProcess(maintainerKey);
            fixture.detectChanges();

            expect(component.router.navigate).toHaveBeenCalledWith(['fmp/forgotMaintainerPassword'], {
                queryParams: { mntnerKey: 'I-AM-MNT', voluntary: true },
            });
        });
    });

    describe('Testing Not logged in user', () => {
        beforeEach(async () => {
            userInfoService.getUserOrgsAndRoles.mockReturnValue(throwError(() => 403));
            vi.spyOn(component.router, 'navigate').mockReturnValue(undefined);
            component.ngOnInit();
            await fixture.whenStable();
        });

        it('should not logged in user', () => {
            expect(component.router.navigate).toHaveBeenCalledWith(['fmp/requireLogin']);
        });
    });
});
