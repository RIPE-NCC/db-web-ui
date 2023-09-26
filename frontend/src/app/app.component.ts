import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    public isOpenMenu: boolean = true;
    public innerWidth: number;
    public showSessionExpireBanner: boolean = false;
    public showUserLoginIcon: boolean = false;
    public loginUrl: string;

    constructor(
        public properties: PropertiesService,
        private releaseNotificationService: ReleaseNotificationService,
        private router: Router,
        private location: Location,
        private sessionInfoService: SessionInfoService,
    ) {
        this.sessionInfoService.expiredSession$.subscribe((raiseSessionExpireBanner) => {
            this.loginUrl = `${this.properties.LOGIN_URL}?originalUrl=${encodeURIComponent(window.location.href)}`;
            this.showSessionExpireBanner = raiseSessionExpireBanner;
        });
        this.sessionInfoService.showUserLoggedIcon$.subscribe((showUserLoggedIcon) => {
            this.showUserLoginIcon = showUserLoggedIcon;
        });
        this.skipHash();
    }

    public ngOnInit() {
        this.mobileOrDesktopView();
        this.releaseNotificationService.startPolling();
    }

    private skipHash() {
        const hash = window.location.hash;
        // /legal#terms-and-conditions open legal-accordion web component on Terms and Conditions Panel
        if (hash && !this.isLegalPage()) {
            this.router.navigateByUrl(hash.substring(1));
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.mobileOrDesktopView();
    }

    public mobileOrDesktopView() {
        this.innerWidth = this.getInnerWidth();
        this.isDesktopView = this.innerWidth >= this.properties.BREAKPOINTS_MOBILE_VIEW;
        this.isOpenMenu = this.isDesktopView;
    }

    public getInnerWidth() {
        return window.innerWidth;
    }

    open = (event: any) => {
        this.isOpenMenu = event.detail.open;
    };

    public isQueryPage(): boolean {
        return this.location.path().startsWith('/query');
    }

    public isLegalPage(): boolean {
        return this.location.path().startsWith('/legal');
    }
}
