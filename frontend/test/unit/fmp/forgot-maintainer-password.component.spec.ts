import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CoreModule } from '../../../src/app/core/core.module';
import { FmpErrorService } from '../../../src/app/fmp/fmp-error.service';
import { ForgotMaintainerPasswordComponent } from '../../../src/app/fmp/forgot-maintainer-password.component';
import { ForgotMaintainerPasswordService } from '../../../src/app/fmp/forgot-maintainer-password.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';

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
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        forgotMaintainerPasswordService = jasmine.createSpyObj('ForgotMaintainerPasswordService', ['generatePdfAndEmail']);
        userInfoService = jasmine.createSpyObj('UserInfoService', ['getUserOrgsAndRoles']);
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule],
            declarations: [ForgotMaintainerPasswordComponent],
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
            userInfoService.getUserOrgsAndRoles.and.returnValue(of(200));
        });

        it('should init controller with empty pdf url', () => {
            spyOn(queryParamMock, 'has').and.returnValue(true);
            spyOn(queryParamMock, 'get').and.returnValue('mnt-key');
            expect(component).toBeTruthy();
            fixture.detectChanges();
            expect(component.generatedPDFUrl).toEqual('');
        });

        it('should init controller with ForgotMaintainerPassword and voluntary', () => {
            spyOn(queryParamMock, 'has').and.returnValue(true);
            spyOn(queryParamMock, 'get').and.returnValue('mnt-key');
            fixture.detectChanges();
            expect(component.fmpModel).toEqual(getFmp('mnt-key', true));
        });

        it('should init controller with ForgotMaintainerPassword and not voluntary', () => {
            spyOn(queryParamMock, 'has').and.returnValue(false);
            spyOn(queryParamMock, 'get').and.returnValue('mnt-key');
            fixture.detectChanges();
            expect(component.fmpModel).toEqual(getFmp('mnt-key', false));
        });
    });

    describe('Testing process after click', () => {
        const url = 'api/whois-internal/api/fmp-pub/forgotmntnerpassword';

        beforeEach(() => {
            userInfoService.getUserOrgsAndRoles.and.returnValue(of(200));
        });

        it('should call backend and generate pdf url', () => {
            const response =
                'api/whois-internal/api/fmp-pub/forgotmntnerpassword/eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJtbnRuZXJLZXkiOiJtbnQta2V5IiwicmVhc29uIjoiVGVzdGluZyByZWFzb24iLCJ2b2x1bnRhcnkiOmZhbHNlfQ==';
            forgotMaintainerPasswordService.generatePdfAndEmail.and.returnValue(of(response));
            spyOn(queryParamMock, 'has').and.returnValue(false);
            spyOn(queryParamMock, 'get').and.returnValue('mnt-key');
            fixture.detectChanges();
            expect(component.fmpModel).toEqual(getFmp('mnt-key', false));
            component.fmpModel.email = 'test@test.com';
            component.fmpModel.reason = 'Testing reason';

            component.next(component.fmpModel, true);
            fixture.detectChanges();
            expect(component.generatedPDFUrl).toEqual(url + '/' + btoa(JSON.stringify(component.fmpModel)));
        });

        it('should not call backend and generate pdf url if form is invalid', () => {
            spyOn(queryParamMock, 'has').and.returnValue(true);
            spyOn(queryParamMock, 'get').and.returnValue('mnt-key');
            fixture.detectChanges();
            expect(component.fmpModel).toEqual(getFmp('mnt-key', true));

            component.next(component.fmpModel, false);
            fixture.detectChanges();
            expect(component.generatedPDFUrl).toEqual('');
        });
    });

    describe('Testing Not logged in user', () => {
        beforeEach(() => {
            spyOn(queryParamMock, 'has').and.returnValue(true);
            spyOn(queryParamMock, 'get').and.returnValue('mnt-key');
            userInfoService.getUserOrgsAndRoles.and.returnValue(throwError(() => ({ data: 403 })));
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
