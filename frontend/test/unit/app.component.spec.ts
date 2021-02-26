import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {AppComponent} from "../../src/app/app.component"
import {PropertiesService} from "../../src/app/properties.service";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {BannerComponent} from "../../src/app/banner/banner.component";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {Router} from "@angular/router";
import {WINDOW} from "../../src/app/core/window.service";
import {By} from "@angular/platform-browser";

describe("AppComponent", () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let routerMock: any;

    beforeEach(async(() => {
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            declarations: [
                AppComponent,
                BannerComponent,
            ],
            providers: [
                PropertiesService,
                {provide: Router, useValue: routerMock},
                {provide: WINDOW, useValue: {location: {}}},

            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],

        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    });

    it("should set properties to app-switcher", () => {
        fixture.detectChanges();
        const appSwitch = fixture.debugElement.query(By.css('app-switcher'));
        expect(appSwitch.properties.appenv).toBe("pre");
        expect(appSwitch.properties.current).toBe("database");
    });

    it("should set properties to user-login", () => {
        fixture.detectChanges();
        const appSwitch = fixture.debugElement.query(By.css('user-login'));
        expect(appSwitch.properties.accessurl).toBe("https://access.prepdev.ripe.net/");
        expect(appSwitch.properties.logoutredirecturl).toBe("https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/query");
    });

    it("shouldn\'t open menu on init for mobile screen size",() => {
        component.window.innerWidth = 767;
        fixture.detectChanges();
        component.openOrCloseMenu();
        expect(component.isOpenMenu).toBeFalsy();
    });

    it("should open menu on init for desktop screen size", () => {
        component.window.innerWidth = 768;
        fixture.detectChanges();
        component.openOrCloseMenu();
        expect(component.isOpenMenu).toBeTruthy();
    });
});
