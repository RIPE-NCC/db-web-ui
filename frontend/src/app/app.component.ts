import { CommonModule, Location } from '@angular/common';
import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import supportedBrowsers from '../../src/assets/supportedBrowsers.js';
import { BannerTypes } from './banner/banner.component';
import { PropertiesService } from './properties.service';
import { SessionInfoService } from './sessioninfo/session-info.service';
import { ReleaseNotificationService } from './shared/release-notification.service';

import { BannerComponent } from './banner/banner.component';
import { OrgDropDownComponent } from './dropdown/org-drop-down.component';
import { MenuComponent } from './menu/menu.component';
import { AlertBannersComponent } from './shared/alert/alert-banners.component';
import { LabelPipe } from './shared/label.pipe';

@Component({
    selector: 'app-db-web-ui',
    standalone: true,
    templateUrl: './app.component.html',
    imports: [CommonModule, RouterModule, BannerComponent, MenuComponent, LabelPipe, AlertBannersComponent, OrgDropDownComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit, AfterViewInit {
    properties = inject(PropertiesService);
    private releaseNotificationService = inject(ReleaseNotificationService);
    private router = inject(Router);
    private location = inject(Location);
    private sessionInfoService = inject(SessionInfoService);

    public isDesktopView: boolean;
    public isOpenMenu: boolean = true;
    public innerWidth: number;
    public showSessionExpireBanner: boolean = false;
    public loginUrl: string;
    public isBrowserSupported: boolean = true;

    browserUnsuportedText = `Your browser is not supported by this application. Some features may not display or function properly. Please upgrade to a <a href="https://www.ripe.net/about-us/legal/supported-browsers" target="_blank">supported browser</a>.`;

    @ViewChild('switcher', { static: false }) switcher!: ElementRef;

    constructor() {
        this.sessionInfoService.expiredSession$.subscribe((raiseSessionExpireBanner: boolean) => {
            this.loginUrl = `${this.properties.LOGIN_URL}?originalUrl=${encodeURIComponent(window.location.href)}`;
            this.showSessionExpireBanner = raiseSessionExpireBanner;

            if (raiseSessionExpireBanner) {
                const userLogin = document.querySelector('user-login');
                userLogin?.dispatchEvent(new Event('access-logout'));
            }
        });

        this.skipHash();
    }

    ngOnInit() {
        this.isBrowserSupported = supportedBrowsers.test(navigator.userAgent);
        this.mobileOrDesktopView();
        this.releaseNotificationService.startPolling();
    }

    ngAfterViewInit() {
        if (this.switcher) {
            this.switcher.nativeElement.addEventListener('click', this.handleSwitcherClick);
        }
    }

    handleSwitcherClick = () => {
        (window as any)._paq = (window as any)._paq || [];
        (window as any)._paq.push(['trackEvent', 'Web Component', 'Click', 'app-switcher']);
    };

    private skipHash() {
        const hash = window.location.hash;
        if (hash && !this.isLegalPage()) {
            this.router.navigateByUrl(hash.substring(1));
        }
    }

    @HostListener('window:resize')
    onResize() {
        this.mobileOrDesktopView();
    }

    mobileOrDesktopView() {
        this.innerWidth = PropertiesService.getInnerWidth();
        this.isDesktopView = !PropertiesService.isMobileView();
        this.isOpenMenu = this.isDesktopView;
    }

    open = (event: any) => {
        this.isOpenMenu = event.detail.open;
    };

    isQueryPage(): boolean {
        return this.location.path().startsWith('/query');
    }

    isLegalPage(): boolean {
        return this.location.path().startsWith('/legal');
    }

    protected readonly BannerTypes = BannerTypes;
}
