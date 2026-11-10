import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Observable, Subscription } from 'rxjs';
import { FeedbackSupportDialogComponent } from './feedbacksupport/feedback-support-dialog.component';
import { MainContainerComponent } from './main-container/main-container.component';
import { dbMenuObject } from './menu/db-menu.json';
import { ActiveMenu, MenuService, SidebarMenu } from './menu/menu.service';
import { getResourceMenu } from './menu/resources-menu.json';
import { PropertiesService } from './properties.service';
import { SessionService } from './sessioninfo/session.service';
import { UserInfoService } from './userinfo/user-info.service';

export const EnvNamesInRipeWebComponents = {
    local: 'prepdev',
    dev: 'development',
    prepdev: 'prepdev',
    prod: 'production',
    rc: 'rc',
    test: 'test',
    training: 'training',
};

const envDisplayMap: Record<string, string> = {
    training: 'Training Database',
    test: 'Test Database',
    rc: 'RC Database',
};

@Component({
    selector: 'app-db-web-ui',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: 'app.component.scss',
    imports: [RouterModule, MainContainerComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit, OnDestroy {
    activeMenu!: ActiveMenu | null;
    activeSidebarItem!: string;
    sidebarMenu!: SidebarMenu;
    icon!: string;
    envNameInRipeWebComponents: string;

    properties = inject(PropertiesService);
    dialog = inject(MatDialog);
    private router = inject(Router);
    private menuService = inject(MenuService);
    private userInfoService = inject(UserInfoService);
    private sessionService = inject(SessionService);
    private readonly navigationEnd: Subscription;

    labelEnv!: string;
    labelEnvImg!: string;
    isLoggedInUser = this.userInfoService.isLoggedIn;
    usernameOidc = computed(() => this.userInfoService.user()?.name);
    profilePhotoId = computed(() => this.userInfoService.user()?.photo);

    isComponentLoaded: boolean = false;

    currentHref = `/db-web-ui/oauth2/authorization/keycloak?next=${encodeURIComponent(window.location.href)}`;

    constructor() {
        this.envNameInRipeWebComponents = EnvNamesInRipeWebComponents[this.properties.ENV as keyof typeof EnvNamesInRipeWebComponents];
        const event = this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)) as Observable<NavigationEnd>;
        this.navigationEnd = event.subscribe((evt) => {
            this.setActiveSidebarItem(evt.url);

            this.currentHref = `/db-web-ui/oauth2/authorization/keycloak?next=${encodeURIComponent(window.location.href)}`;
        });
        effect(() => {
            this.onActiveMenuChange();
        });
    }

    ngOnInit(): void {
        this.isComponentLoaded = false;

        const params = new URLSearchParams(window.location.search);

        if (params.has('idpError')) {
            this.isComponentLoaded = true;
            return;
        }

        if (this.tryHandleSilentLoginFailure(params)) {
            return;
        }

        this.userInfoService.getLoggedInOidc().subscribe({
            next: () => {
                this.loadOidcDataAndInitialiseEvent();
            },
            error: (_err) => {
                window.location.href = `/db-web-ui/oauth2/authorization/keycloak?silent=true&next=${encodeURIComponent(this.getCleanUrlForNext())}`;
            },
        });
    }

    private loadOidcDataAndInitialiseEvent() {
        this.isComponentLoaded = true;
        this.sessionService.initialize();
    }

    onActiveMenuChange() {
        this.menuService.setActiveMenu();
        this.activeMenu = this.menuService.activeMenu();
        if (this.menuService.isActiveDBMenu()) {
            this.icon = 'assets/images/RIPE_NCC_Database_White_2025.svg';
            this.sidebarMenu = this.properties.isTestEnv()
                ? {
                      ...dbMenuObject.menu,
                      main: dbMenuObject.menu.main.map((item) =>
                          item.id === 'test-database'
                              ? {
                                    ...item,
                                    title: 'RIPE Database',
                                    url: 'https://apps.db.ripe.net/db-web-ui/query',
                                    id: 'database',
                                    external: true,
                                    icon: 'assets/icons/fa-server.svg',
                                }
                              : item,
                      ),
                  }
                : dbMenuObject.menu;
        } else {
            this.icon = 'assets/images/Resources_2025-05.svg';
            this.userInfoService.isLoggedIn() ? (this.sidebarMenu = getResourceMenu(true)) : (this.sidebarMenu = getResourceMenu(false));
        }
        const env = this.properties.ENV?.toLowerCase();
        this.labelEnv = envDisplayMap[env] ?? `${this.properties.ENV} Database`;
        this.labelEnvImg = this.properties.isTrainingEnv() ? 'assets/icons/fa-graduation-cap.svg' : 'assets/icons/fa-axe.svg';
    }

    ngOnDestroy() {
        if (this.navigationEnd) {
            this.navigationEnd.unsubscribe();
        }
    }

    @HostListener('click', ['$event'])
    onHostClick(event: MouseEvent) {
        const path = event.composedPath() as HTMLElement[]; // Find elements event inside shadow DOM
        const loginAnchor = path.find((el) => el instanceof HTMLAnchorElement && el.href.includes('oauth2/authorization/keycloak'));

        if (loginAnchor) {
            event.preventDefault();
            event.stopImmediatePropagation();

            window.location.href = `/db-web-ui/oauth2/authorization/keycloak?next=${encodeURIComponent(window.location.href)}`;
        }
    }

    onSidebarItemClick(event: CustomEvent) {
        event.preventDefault();
        this.setActiveSidebarItem(event.detail.url);

        if (event.detail.id === 'feedback') {
            this.dialog.open(FeedbackSupportDialogComponent, { panelClass: 'feedback-support-panel' });
        } else if (event.detail.url.startsWith('http')) {
            window.open(event.detail.url, '_blank');
        } else {
            if (event.detail.id === 'sponsored') {
                void this.router.navigate([event.detail.url], { queryParams: { sponsored: true } });
            } else {
                void this.router.navigate([event.detail.url]);
            }
        }
    }

    setActiveSidebarItem(url: string) {
        this.activeSidebarItem = `${location.origin}/db-web-ui/${url}`;
    }

    private getCleanUrlForNext(): string {
        const url = new URL(window.location.href);
        url.searchParams.delete('silent');
        url.searchParams.delete('next');
        url.searchParams.delete('silentLoginFailed');
        return url.toString();
    }

    /**
     * Handles the return trip from a failed silent SSO check: cleans the marker from the URL
     * and restores the sidebar highlight. Returns true if it handled this case (caller should stop).
     */
    private tryHandleSilentLoginFailure(params: URLSearchParams): boolean {
        if (!params.has('silentLoginFailed')) {
            return false;
        }

        this.isComponentLoaded = true;

        const cleanParams = new URLSearchParams(window.location.search);
        cleanParams.delete('silentLoginFailed');

        const path = window.location.pathname.replace('/db-web-ui/', '');
        const queryParams: Record<string, string> = {};
        cleanParams.forEach((value, key) => (queryParams[key] = value));

        this.setActiveSidebarItem(path);

        void this.router.navigate([path], {
            queryParams,
            replaceUrl: true, // swaps the current history entry, same intent as Location.replaceState
        });
        return true;
    }
}
