import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from 'src/app/sessioninfo/session.service';
import supportedBrowsers from '../../assets/supportedBrowsers.js';
import { BannerComponent, BannerTypes } from '../banner/banner.component';
import { OrgDropDownComponent } from '../dropdown/org-drop-down.component';
import { ActiveMenu, MenuService } from '../menu/menu.service';
import { PropertiesService } from '../properties.service';
import { AlertBannersComponent } from '../shared/alert/alert-banners.component';
import { LabelPipe } from '../shared/label.pipe';
import { ReleaseNotificationService } from '../shared/release-notification.service';

@Component({
    selector: 'main-container',
    standalone: true,
    templateUrl: './main-container.component.html',
    styleUrl: 'main-container.component.scss',
    imports: [RouterModule, BannerComponent, LabelPipe, AlertBannersComponent, OrgDropDownComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainContainerComponent implements OnInit {
    properties = inject(PropertiesService);
    private releaseNotificationService = inject(ReleaseNotificationService);
    private router = inject(Router);
    private location = inject(Location);
    private menuService = inject(MenuService);
    private sessionService = inject(SessionService);

    isDesktopView: boolean;
    collapsedMenu: boolean = false;
    innerWidth: number;
    showSessionExpireBanner: boolean = false;
    loginUrl: string;
    isBrowserSupported: boolean = true;
    activeMenu: ActiveMenu;

    browserUnsuportedText = `Your browser is not supported by this application. Some features may not display or function properly. Please upgrade to a <a href="https://www.ripe.net/about-us/legal/supported-browsers" target="_blank">supported browser</a>.`;

    constructor() {
        this.skipHash();
    }

    ngOnInit() {
        this.sessionService.expiredSession$.subscribe(() => {
            this.loginUrl = `/db-web-ui/oauth2/authorization/keycloak?next=${encodeURIComponent(window.location.href)}`;
            this.showSessionExpireBanner = true;

            const userLogin = document.querySelector('user-login');
            userLogin?.dispatchEvent(new Event('access-logout'));
        });
        this.activeMenu = this.menuService.activeMenu();
        this.isBrowserSupported = supportedBrowsers.test(navigator.userAgent);
        this.mobileOrDesktopView();
        this.releaseNotificationService.startPolling();
    }

    private skipHash() {
        const hash = window.location.hash;
        if (hash && !this.isLegalPage()) {
            void this.router.navigateByUrl(hash.substring(1));
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
