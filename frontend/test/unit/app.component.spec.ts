import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppComponent } from '../../src/app/app.component';
import { BannerComponent } from '../../src/app/banner/banner.component';
import { WINDOW } from '../../src/app/core/window.service';
import { PropertiesService } from '../../src/app/properties.service';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let routerMock: any;

    beforeEach(waitForAsync(() => {
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [AppComponent, BannerComponent],
            providers: [
                {
                    provide: PropertiesService,
                    useValue: {
                        LOGIN_URL: 'https://access.prepdev.ripe.net/',
                        LOGOUT_URL: 'https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/query',
                        RIPE_APP_WEBCOMPONENTS_ENV: 'pre',
                        BREAKPOINTS_MOBILE_VIEW: 1025,
                    },
                },
                { provide: Router, useValue: { navigate: () => {}, navigateByUrl: () => {}, url: '/not-query' } },
                { provide: WINDOW, useValue: { location: {} } },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    });

    it('should set properties to app-switcher', () => {
        component.window.innerWidth = 1025;
        fixture.detectChanges();
        const appSwitch = fixture.debugElement.query(By.css('app-switcher'));
        expect(appSwitch.properties.appenv).toBe('pre');
        expect(appSwitch.properties.current).toBe('database');
    });

    it('should set properties to user-login', () => {
        component.window.innerWidth = 1025;
        fixture.detectChanges();
        const appSwitch = fixture.debugElement.query(By.css('user-login'));
        expect(appSwitch.properties.accessurl).toBe('https://access.prepdev.ripe.net/');
        expect(appSwitch.properties.logoutredirecturl).toBe(
            'https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/query',
        );
    });

    it("shouldn't open menu on init for mobile screen size", () => {
        component.window.innerWidth = 1024;
        fixture.detectChanges();
        component.mobileOrDesktopView();
        expect(component.isOpenMenu).toBeFalsy();
    });

    it('should open menu on init for desktop screen size', () => {
        component.window.innerWidth = 1025;
        fixture.detectChanges();
        component.mobileOrDesktopView();
        expect(component.isOpenMenu).toBeTruthy();
    });

    it('should show mobile-menu for mobile screen size', () => {
        component.window.innerWidth = 1024;
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
        component.window.innerWidth = 1025;
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
