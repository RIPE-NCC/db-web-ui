import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Observable, Subscription } from 'rxjs';
import { FeedbackSupportDialogComponent } from 'src/app/feedbacksupport/feedback-support-dialog.component';
import { MainContainerComponent } from 'src/app/main-container/main-container.component';
import { dbMenuObject } from 'src/app/menu/db-menu.json';
import { ActiveMenu, MenuService, SidebarMenu } from 'src/app/menu/menu.service';
import { getResourceMenu } from 'src/app/menu/resources-menu.json';
import { PropertiesService } from 'src/app/properties.service';
import { UserInfoService } from 'src/app/userinfo/user-info.service';

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
    standalone: true,
    templateUrl: './main-layout.component.html',
    styleUrl: 'main-layout.component.scss',
    imports: [RouterModule, MainContainerComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainLayoutComponent implements OnDestroy {
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

    constructor() {
        this.envNameInRipeWebComponents = EnvNamesInRipeWebComponents[this.properties.ENV as keyof typeof EnvNamesInRipeWebComponents];
        const event = this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)) as Observable<NavigationEnd>;
        this.navigationEnd = event.subscribe((evt) => {
            this.setActiveSidebarItem(evt.url);
        });
        effect(() => {
            this.onActiveMenuChange();
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
            this.userInfoService.getUserOrgsAndRoles().subscribe({
                next: (response) => {
                    this.sidebarMenu = getResourceMenu(!!response);
                },
                error: () => {
                    this.sidebarMenu = getResourceMenu(false);
                },
            });
        }
        const env = this.properties.ENV?.toLowerCase();
        this.labelEnv = envDisplayMap[env] ?? `${this.properties.ENV} Database`;
        this.labelEnvImg = this.properties.isTrainingEnv() ? 'assets/icons/fa-graduation-cap.svg' : 'assets/icons/fa-axe.svg';
    }

    public ngOnDestroy() {
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
