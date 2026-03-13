import { CommonModule, Location } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import supportedBrowsers from '../../../src/assets/supportedBrowsers.js';
import { BannerComponent, BannerTypes } from '../banner/banner.component';
import { OrgDropDownComponent } from '../dropdown/org-drop-down.component';
import { dbMenuObject } from '../menu/db-menu.json';
import { ActiveMenu } from '../menu/menu.service';
import { PropertiesService } from '../properties.service';
import { SessionInfoService } from '../sessioninfo/session-info.service';
import { AlertBannersComponent } from '../shared/alert/alert-banners.component';
import { LabelPipe } from '../shared/label.pipe';
import { ReleaseNotificationService } from '../shared/release-notification.service';

@Component({
    selector: 'main-container',
    standalone: true,
    templateUrl: './main-container.component.html',
    styleUrl: 'main-container.component.scss',
    imports: [CommonModule, RouterModule, BannerComponent, LabelPipe, AlertBannersComponent, OrgDropDownComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainContainerComponent implements OnInit {
    properties = inject(PropertiesService);
    private releaseNotificationService = inject(ReleaseNotificationService);
    private router = inject(Router);
    private location = inject(Location);
    private sessionInfoService = inject(SessionInfoService);

    isDesktopView: boolean;
    collapsedMenu: boolean = false;
    innerWidth: number;
    showSessionExpireBanner: boolean = false;
    loginUrl: string;
    isBrowserSupported: boolean = true;
    activeMenu: ActiveMenu;

    browserUnsuportedText = `Your browser is not supported by this application. Some features may not display or function properly. Please upgrade to a <a href="https://www.ripe.net/about-us/legal/supported-browsers" target="_blank">supported browser</a>.`;

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
        const dbMenuIds = dbMenuObject.menu.main.map((item) => item.id.toLowerCase());
        this.activeMenu = dbMenuIds.some((id) => location.href.includes(id)) ? ActiveMenu.DB : ActiveMenu.RESOURCES;
        this.isBrowserSupported = supportedBrowsers.test(navigator.userAgent);
        this.mobileOrDesktopView();
        this.releaseNotificationService.startPolling();
    }

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
        this.collapsedMenu = !this.isDesktopView;
    }

    isQueryPage(): boolean {
        return this.location.path().startsWith('/query');
    }

    isLegalPage(): boolean {
        return this.location.path().startsWith('/legal');
    }

    protected readonly BannerTypes = BannerTypes;
}
