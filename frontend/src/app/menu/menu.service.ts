import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

export enum ActiveMenu {
    DB = 'db',
    RESOURCES = 'resources',
}

export type Active = (current: URL) => boolean;

export type SidebarMenuItem = {
    title: string;
    url: string;
    id: string;
    external?: boolean;
    icon?: string;
    active?: Active;
};

export type SidebarMenu = {
    main: SidebarMenuItem[];
    footer: SidebarMenuItem[];
};

@Injectable({
    providedIn: 'root',
})
export class MenuService {
    private router = inject(Router);
    private _activeMenu = signal<ActiveMenu | null>(null);
    readonly activeMenu = this._activeMenu.asReadonly();

    constructor() {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.setActiveMenu());
    }

    setActiveMenu() {
        const url = this.router.url;
        const activeMenu = ['myresources', 'ip-analyser'].some((id) => url.includes(id)) ? ActiveMenu.RESOURCES : ActiveMenu.DB;

        this._activeMenu.set(activeMenu);
    }

    readonly isActiveDBMenu = computed(() => this.activeMenu() === ActiveMenu.DB);

    readonly isActiveResourcesMenu = computed(() => this.activeMenu() === ActiveMenu.RESOURCES);
}
