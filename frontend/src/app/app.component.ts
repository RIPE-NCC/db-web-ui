import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FeedbackSupportDialogComponent } from './feedbacksupport/feedback-support-dialog.component';
import { MainContainerComponent } from './main-container/main-container.component';
import { dbMenuObject } from './menu/db-menu.json';
import { ActiveMenu, MenuService } from './menu/menu.service';
import { resourcesMenuObject } from './menu/resources-menu.json';
import { PropertiesService } from './properties.service';

export const EnvNamesInRipeWebComponents = {
    local: 'local',
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
    imports: [CommonModule, RouterModule, MainContainerComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit, OnDestroy {
    activeMenu: ActiveMenu;
    activeMenuItem: string;
    envNameInRipeWebComponents: string;

    properties = inject(PropertiesService);
    dialog = inject(MatDialog);
    private router = inject(Router);
    private menuService = inject(MenuService);

    private readonly navigationEnd: Subscription;

    labelEnv: string;
    labelEnvImg: string;

    constructor() {
        this.envNameInRipeWebComponents = EnvNamesInRipeWebComponents[this.properties.ENV];
        const event = this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)) as Observable<NavigationEnd>;
        this.navigationEnd = event.subscribe((evt) => {
            this.setActiveMenuItem(evt.url);
        });
        effect(() => {
            this.activeMenu = this.menuService.activeMenu();
        });
    }

    ngOnInit() {
        const env = this.properties.ENV?.toLowerCase();
        this.labelEnv = envDisplayMap[env] ?? `${this.properties.ENV} Database`;
        this.labelEnvImg = this.properties.isTrainingEnv() ? 'assets/icons/fa-graduation-cap.svg' : 'assets/icons/fa-axe.svg';
        this.menuService.setActiveMenu();
    }

    public ngOnDestroy() {
        if (this.navigationEnd) {
            this.navigationEnd.unsubscribe();
        }
    }

    onMenuItemClick(event) {
        event.preventDefault();
        this.setActiveMenuItem(event.detail.url);

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

    setActiveMenuItem(url: string) {
        this.menuService.setActiveMenu();
        this.activeMenuItem = `${location.origin}/db-web-ui/${url}`;
    }

    protected readonly ActiveMenu = ActiveMenu;
    protected readonly dbMenuObject = dbMenuObject;
    protected readonly resourcesMenuObject = resourcesMenuObject;
}
