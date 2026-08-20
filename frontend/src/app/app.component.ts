import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Observable, Subscription } from 'rxjs';
import { UserOidc } from './dropdown/org-data-type.model';
import { FeedbackSupportDialogComponent } from './feedbacksupport/feedback-support-dialog.component';
import { MainContainerComponent } from './main-container/main-container.component';
import { dbMenuObject } from './menu/db-menu.json';
import { ActiveMenu, MenuService, SidebarMenu } from './menu/menu.service';
import { getResourceMenu } from './menu/resources-menu.json';
import { PropertiesService } from './properties.service';
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

    private readonly navigationEnd: Subscription;

    labelEnv!: string;
    labelEnvImg!: string;

    userOidc: UserOidc;
    usernameOidc: string;
    isLoggedInUser: boolean = false;
    isComponentLoaded: boolean = false;
    profilePhotoId: string;

    currentHref = `/db-web-ui/oauth2/authorization/keycloak?next=${encodeURIComponent(window.location.href)}`;

    constructor() {
        console.log('url', this.currentHref);
        this.envNameInRipeWebComponents = EnvNamesInRipeWebComponents[this.properties.ENV as keyof typeof EnvNamesInRipeWebComponents];
        const event = this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)) as Observable<NavigationEnd>;
        this.navigationEnd = event.subscribe((evt) => {
            this.setActiveSidebarItem(evt.url);

            this.currentHref = `/db-web-ui/oauth2/authorization/keycloak?next=${encodeURIComponent(window.location.href)}`;
            console.log('url', this.currentHref);
        });
        effect(() => {
            this.onActiveMenuChange();
        });
    }

    ngOnInit(): void {
        this.isComponentLoaded = false;
        this.userInfoService.getLoggedInOidc().subscribe({
            next: (response: UserOidc) => {
                this.userOidc = response;
                this.usernameOidc = this.userOidc.name;
                this.isLoggedInUser = true;
                this.isComponentLoaded = true;
                this.profilePhotoId = this.userOidc.photo;
            },
            error: (_err) => {
                this.isComponentLoaded = true;
            },
        });
    }

    onActiveMenuChange() {
        this.menuService.setActiveMenu();
        this.activeMenu = this.menuService.activeMenu();
        if (this.menuService.isActiveDBMenu()) {
            this.icon = 'assets/images/RIPE_NCC_Database_White_2025.svg';
            this.sidebarMenu = dbMenuObject.menu;
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
}
