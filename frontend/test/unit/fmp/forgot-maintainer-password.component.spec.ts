import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FmpErrorService } from 'src/app/fmp/fmp-error.service';
import { ForgotMaintainerPasswordComponent } from 'src/app/fmp/forgot-maintainer-password.component';
import { ForgotMaintainerPasswordService } from 'src/app/fmp/forgot-maintainer-password.service';
import { PropertiesService } from 'src/app/properties.service';
import { UserInfoService } from 'src/app/userinfo/user-info.service';

describe('ForgotMaintainerPasswordComponent', () => {
    let component: ForgotMaintainerPasswordComponent;
    let fixture: ComponentFixture<ForgotMaintainerPasswordComponent>;
    let userInfoService: any;
    let forgotMaintainerPasswordService: any;
    let paramMapMock: ParamMap;
    let queryParamMock: ParamMap;
    let routerMock: any;

    beforeEach(() => {
        paramMapMock = convertToParamMap({});
        queryParamMock = convertToParamMap({});
        routerMock = {
            navigate: vi.fn().mockName('Router.navigate'),
            navigateByUrl: vi.fn().mockName('Router.navigateByUrl'),
        };
        forgotMaintainerPasswordService = {
            generatePdfAndEmail: vi.fn().mockName('ForgotMaintainerPasswordService.generatePdfAndEmail'),
        };
        userInfoService = {
            getUserOrgsAndRoles: vi.fn().mockName('UserInfoService.getUserOrgsAndRoles'),
        };
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ForgotMaintainerPasswordComponent],
            providers: [
                { provide: ForgotMaintainerPasswordService, useValue: forgotMaintainerPasswordService },
                { provide: UserInfoService, useValue: userInfoService },
                { provide: Router, useValue: routerMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: paramMapMock,
                            queryParamMap: queryParamMock,
                        },
                    },
                },
                FmpErrorService,
                PropertiesService,
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ForgotMaintainerPasswordComponent);
        component = fixture.componentInstance;
    });

    function getFmp(mntnerKey: any, voluntary: boolean) {
        return {
            email: '',
            mntnerKey: mntnerKey,
            reason: '',
            voluntary: voluntary,
        };
    }

    describe('Testing initialisation logged in', () => {
        beforeEach(() => {
            userInfoService.getUserOrgsAndRoles.mockReturnValue(of(200));
        });

        it('should init controller with empty pdf url', () => {
            vi.spyOn(queryParamMock, 'has').mockReturnValue(true);
            vi.spyOn(queryParamMock, 'get').mockReturnValue('mnt-key');
            expect(component).toBeTruthy();
            fixture.detectChanges();
            expect(component.generatedPDFUrl).toEqual('');
        });

        it('should init controller with ForgotMaintainerPassword and voluntary', () => {
            vi.spyOn(queryParamMock, 'has').mockReturnValue(true);
            vi.spyOn(queryParamMock, 'get').mockReturnValue('mnt-key');
            fixture.detectChanges();
            expect(component.fmpModel).toEqual(getFmp('mnt-key', true));
        });

        it('should init controller with ForgotMaintainerPassword and not voluntary', () => {
            vi.spyOn(queryParamMock, 'has').mockReturnValue(false);
            vi.spyOn(queryParamMock, 'get').mockReturnValue('mnt-key');
            fixture.detectChanges();
            expect(component.fmpModel).toEqual(getFmp('mnt-key', false));
        });
    });

    describe('Testing process after click', () => {
        const url = 'api/whois-internal/api/fmp-pub/forgotmntnerpassword';

        beforeEach(() => {
            userInfoService.getUserOrgsAndRoles.mockReturnValue(of(200));
        });

        it('should call backend and generate pdf url', () => {
            const response =
                'api/whois-internal/api/fmp-pub/forgotmntnerpassword/eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJtbnRuZXJLZXkiOiJtbnQta2V5IiwicmVhc29uIjoiVGVzdGluZyByZWFzb24iLCJ2b2x1bnRhcnkiOmZhbHNlfQ==';
            forgotMaintainerPasswordService.generatePdfAndEmail.mockReturnValue(of(response));
            vi.spyOn(queryParamMock, 'has').mockReturnValue(false);
            vi.spyOn(queryParamMock, 'get').mockReturnValue('mnt-key');
            fixture.detectChanges();
            expect(component.fmpModel).toEqual(getFmp('mnt-key', false));
            component.fmpModel.email = 'test@test.com';
            component.fmpModel.reason = 'Testing reason';

            component.next(component.fmpModel, true);
            fixture.detectChanges();
            expect(component.generatedPDFUrl).toEqual(url + '/' + btoa(JSON.stringify(component.fmpModel)));
        });

        it('should not call backend and generate pdf url if form is invalid', () => {
            vi.spyOn(queryParamMock, 'has').mockReturnValue(true);
            vi.spyOn(queryParamMock, 'get').mockReturnValue('mnt-key');
            fixture.detectChanges();
            expect(component.fmpModel).toEqual(getFmp('mnt-key', true));

            component.next(component.fmpModel, false);
            fixture.detectChanges();
            expect(component.generatedPDFUrl).toEqual('');
        });
    });

    describe('Testing Not logged in user', () => {
        beforeEach(() => {
            vi.spyOn(queryParamMock, 'has').mockReturnValue(true);
            vi.spyOn(queryParamMock, 'get').mockReturnValue('mnt-key');
            userInfoService.getUserOrgsAndRoles.mockReturnValue(throwError(() => ({ data: 403 })));
        });

        it('should not logged in user', async () => {
            fixture.detectChanges();
            await fixture.whenStable();

            expect(routerMock.navigate).toHaveBeenCalledWith(['requireLogin'], {
                queryParams: { mntnerKey: component.fmpModel.mntnerKey, voluntary: component.fmpModel.voluntary },
            });
        });
    });
});
