import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import supportedBrowsers from '../../src/assets/supportedBrowsers.js';
import { PropertiesService } from './properties.service';
import { SessionInfoService } from './sessioninfo/session-info.service';
import { ReleaseNotificationService } from './shared/release-notification.service';

@Component({
    selector: 'app-db-web-ui',
    templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, AfterViewInit {
    // for mobileView breaking point is 1025 properties.BREAKPOINTS_MOBILE_VIEW
    public isDesktopView: boolean;
    public isOpenMenu: boolean = true;
    public innerWidth: number;
    public showSessionExpireBanner: boolean = false;
    public loginUrl: string;
    public isBrowserSupported: boolean = true;

    @ViewChild('switcher', { static: false }) switcher!: ElementRef;

    constructor(
        public properties: PropertiesService,
        private releaseNotificationService: ReleaseNotificationService,
        private router: Router,
        private location: Location,
        private sessionInfoService: SessionInfoService,
    ) {
        this.sessionInfoService.expiredSession$.subscribe((raiseSessionExpireBanner: boolean) => {
            this.loginUrl = `${this.properties.LOGIN_URL}?originalUrl=${encodeURIComponent(window.location.href)}`;
            this.showSessionExpireBanner = raiseSessionExpireBanner;
            if (raiseSessionExpireBanner) {
                // notify component of a user logout - icon
                const userLogin = document.querySelector('user-login');
                userLogin.dispatchEvent(new Event('access-logout'));
            }
        });
        this.skipHash();
    }

    public ngOnInit() {
        this.isBrowserSupported = supportedBrowsers.test(navigator.userAgent);
        this.mobileOrDesktopView();
        this.releaseNotificationService.startPolling();
    }

    ngAfterViewInit() {
        if (this.switcher) {
            this.switcher.nativeElement.addEventListener('click', this.handleSwitcherClick);
        }
    }

    handleSwitcherClick = (event: Event) => {
        (window as any)._paq = (window as any)._paq || [];
        (window as any)._paq.push(['trackEvent', 'Web Component', 'Click', 'app-switcher']);
    };

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
        this.innerWidth = PropertiesService.getInnerWidth();
        this.isDesktopView = !PropertiesService.isMobileView();
        this.isOpenMenu = this.isDesktopView;
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
