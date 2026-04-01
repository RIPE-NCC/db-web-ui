import { computed, Injectable, signal } from '@angular/core';

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
    private _activeMenu = signal<ActiveMenu | null>(null);
    readonly activeMenu = this._activeMenu.asReadonly();

    setActiveMenu() {
        const activeMenu = ['myresources', 'ip-analyser'].some((id) => location.href.includes(id)) ? ActiveMenu.RESOURCES : ActiveMenu.DB;
        this._activeMenu.set(activeMenu);
    }

    readonly isActiveDBMenu = computed(() => this.activeMenu() === ActiveMenu.DB);

    readonly isActiveResourcesMenu = computed(() => this.activeMenu() === ActiveMenu.RESOURCES);
}
