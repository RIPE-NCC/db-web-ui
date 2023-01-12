import { Location } from '@angular/common';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WINDOW } from './core/window.service';
import { PropertiesService } from './properties.service';
import { SessionInfoService } from './sessioninfo/session-info.service';
import { ReleaseNotificationService } from './shared/release-notification.service';

@Component({
    selector: 'app-db-web-ui',
    templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
    // for mobileView breaking point is 1025 properties.BREAKPOINTS_MOBILE_VIEW
    public isDesktopView: boolean;
    public isOpenMenu: boolean;
    private innerWidth: number;
    public showSessionExpireBanner: boolean = false;
    public showUserLoginIcon: boolean = false;
    public loginUrl: string;

    constructor(
        public properties: PropertiesService,
        private releaseNotificationService: ReleaseNotificationService,
        private router: Router,
        private location: Location,
        @Inject(WINDOW) public window: any,
        private sessionInfoService: SessionInfoService,
    ) {
        this.sessionInfoService.expiredSession$.subscribe((raiseSessionExpireBanner) => {
            this.loginUrl = `${this.properties.LOGIN_URL}?originalUrl=${encodeURIComponent(this.window.location.href)}`;
            this.showSessionExpireBanner = raiseSessionExpireBanner;
        });
        this.sessionInfoService.showUserLoggedIcon$.subscribe((showUserLoggedIcon) => {
            this.showUserLoginIcon = showUserLoggedIcon;
        });
        this.skipHash();
    }

    public ngOnInit() {
        this.mobileOrDesktopView();
        this.isOpenMenu = this.isDesktopView;
        this.releaseNotificationService.startPolling();
    }

    private skipHash() {
        const hash = this.window.location.hash;
        // /legal#terms-and-conditions open legal-accordion web component on Terms and Conditions Panel
        if (hash && !this.isLegalPage()) {
            this.router.navigateByUrl(hash.substring(1));
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.mobileOrDesktopView();
    }

    open = (event: any) => {
        this.isOpenMenu = event.detail.open;
    };

    public mobileOrDesktopView() {
        this.innerWidth = this.window.innerWidth;
        this.isDesktopView = this.innerWidth >= this.properties.BREAKPOINTS_MOBILE_VIEW;
        this.isOpenMenu = this.isDesktopView;
    }

    public isQueryPage(): boolean {
        return this.location.path().startsWith('/query');
    }

    public isLegalPage(): boolean {
        return this.location.path().startsWith('/legal');
    }
}
