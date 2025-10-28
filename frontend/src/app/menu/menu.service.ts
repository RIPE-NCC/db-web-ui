import { Injectable, inject } from '@angular/core';
import { PropertiesService } from '../properties.service';
import { menuObject } from './menu.json';

export interface IMenu {
    main: IMainMenuItem[];
    footer: IFooterMenuItem[];
}

export interface IMainMenuItem {
    title: string; // title of the menu item
    subtitle?: string;
    id: string; // unique identifier for the menu item (if not specified, title value will be used)
    icon?: string; // the markup of the SVG icon
    url?: string; // optional URL for menu item
    parent?: string; // null || string -- id of parent menu item; used for nested menu items
    roles: string[];
}

export interface IFooterMenuItem {
    title: string;
    subtitle?: string;
    id: string;
    icon: string;
    url?: string;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
    properties = inject(PropertiesService);

    public menu: IMenu;

    createMenu(userRoles: string[]): IMenu {
        this.menu = this.getMenuByEnvironment();
        const filteredItemsByRoles = this.menu.main
            .filter((item) => item.roles.some((role) => userRoles.includes(role)))
            .map((item) => {
                if (item.id === 'resources' && userRoles.includes('NON-MEMBER')) {
                    return { ...item, subtitle: 'My Resources' };
                } else {
                    return item;
                }
            })
            .map((menuItem) => {
                return {
                    ...menuItem,
                    url: this.properties[menuItem.url] ? this.properties[menuItem.url] : menuItem.url,
                    title: this.properties.isProdEnv() ? menuItem.title : menuItem.title.replace('RIPE', this.properties.ENV.toUpperCase()),
                };
            });
        this.menu.footer.forEach((menuItem) => (menuItem.url = this.properties[menuItem.url] ? this.properties[menuItem.url] : menuItem.url));
        return {
            main: filteredItemsByRoles,
            footer: this.menu.footer,
        };
    }

    private getMenuByEnvironment(): IMenu {
        let menu: IMenu = menuObject;
        if (this.properties.SHOW_MENU_IDS?.length > 0) {
            return {
                main: menu.main.filter((menu) => this.properties.SHOW_MENU_IDS.includes(menu.id)),
                footer: menu.footer,
            };
        }
        return menu;
    }
}
