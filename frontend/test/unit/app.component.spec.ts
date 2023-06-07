import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from '../../src/app/app.component';
import { BannerComponent } from '../../src/app/banner/banner.component';
import { PropertiesService } from '../../src/app/properties.service';
import { SessionInfoService } from '../../src/app/sessioninfo/session-info.service';
import { LabelPipe } from '../../src/app/shared/label.pipe';
import { ReleaseNotificationService } from '../../src/app/shared/release-notification.service';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let routerMock: any;
    let releaseNotificationService: ReleaseNotificationService;

    beforeEach(waitForAsync(() => {
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        releaseNotificationService = jasmine.createSpyObj('ReleaseNotificationService', ['startPolling']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [AppComponent, BannerComponent, LabelPipe],
            providers: [
                {
                    provide: PropertiesService,
                    useValue: {
                        LOGIN_URL: 'https://access.prepdev.ripe.net/',
                        LOGOUT_URL: 'https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/query',
                        RIPE_APP_WEBCOMPONENTS_ENV: 'pre',
                        BREAKPOINTS_MOBILE_VIEW: 1025,
                        isTestEnv: () => false,
                        isTrainingEnv: () => false,
                        isRcEnv: () => false,
                        isProdEnv: () => true,
                    },
                },
                {
                    provide: Router,
                    useValue: {
                        navigate: () => {},
                        navigateByUrl: () => {},
                        url: '/not-query',
                    },
                },
                { provide: SessionInfoService, useValue: { expiredSession$: of(), showUserLoggedIcon$: of() } },
                {
                    provide: ReleaseNotificationService,
                    useValue: releaseNotificationService,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    });

    it('should start checking if new release is available', () => {
        fixture.detectChanges();
        expect(releaseNotificationService.startPolling).toHaveBeenCalled();
    });

    it('should set properties to app-switcher', () => {
        spyOn(component, 'getInnerWidth').and.returnValue(1025);
        fixture.detectChanges();
        const appSwitch = fixture.debugElement.query(By.css('app-switcher'));
        expect(appSwitch.properties.appenv).toBe('pre');
        expect(appSwitch.properties.current).toBe('database');
    });

    it('should set properties to user-login', () => {
        spyOn(component, 'getInnerWidth').and.returnValue(1025);
        fixture.detectChanges();
        const appSwitch = fixture.debugElement.query(By.css('user-login'));
        expect(appSwitch.properties.accessurl).toBe('https://access.prepdev.ripe.net/');
        expect(appSwitch.properties.logoutredirecturl).toBe(
            'https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/query',
        );
    });

    it("shouldn't open menu on init for mobile screen size", () => {
        spyOn(component, 'getInnerWidth').and.returnValue(1024);
        fixture.detectChanges();
        component.mobileOrDesktopView();
        expect(component.isOpenMenu).toBeFalsy();
    });

    it('should open menu on init for desktop screen size', () => {
        spyOn(component, 'getInnerWidth').and.returnValue(1025);
        fixture.detectChanges();
        component.mobileOrDesktopView();
        expect(component.isOpenMenu).toBeTruthy();
    });

    it('should show mobile-menu for mobile screen size', () => {
        spyOn(component, 'getInnerWidth').and.returnValue(1024);
        fixture.detectChanges();
        component.mobileOrDesktopView();
        expect(component.isDesktopView).toBeFalsy();
        const mobileMenuElement = fixture.debugElement.nativeElement.querySelector('mobile-menu');
        expect(mobileMenuElement).not.toBeNull();
        const appSwitcherElement = fixture.debugElement.nativeElement.querySelector('app-switcher');
        expect(appSwitcherElement).toBeNull();
        const userLoginElement = fixture.debugElement.nativeElement.querySelector('user-login');
        expect(userLoginElement).toBeNull();
    });

    it('should show app-switcher and user-login for desktop screen size', () => {
        spyOn(component, 'getInnerWidth').and.returnValue(1025);
        fixture.detectChanges();
        component.mobileOrDesktopView();
        expect(component.isDesktopView).toBeTruthy();
        const mobileMenuElement = fixture.debugElement.nativeElement.querySelector('mobile-menu');
        expect(mobileMenuElement).toBeNull();
        const appSwitcherElement = fixture.debugElement.nativeElement.querySelector('app-switcher');
        expect(appSwitcherElement).not.toBeNull();
        const userLoginElement = fixture.debugElement.nativeElement.querySelector('user-login');
        expect(userLoginElement).not.toBeNull();
    });
});
