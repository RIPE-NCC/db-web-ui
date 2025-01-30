import { Injectable } from '@angular/core';
import { PropertiesService } from '../properties.service';
import { menuTestRcEnvObject } from './menu-test-rc-env.json';
import { menuTrainingObject } from './menu-training-env.json';
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

@Injectable()
export class MenuService {
    public menu: IMenu;

    constructor(public properties: PropertiesService) {}

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
            });
        // @ts-ignore
        this.menu.main.forEach((menuItem) => {
            menuItem.url = this.properties[menuItem.url] ? this.properties[menuItem.url] : menuItem.url;
            menuItem.title = this.properties.isProdEnv() ? menuItem.title : menuItem.title.replace('RIPE', this.properties.ENV.toUpperCase());
        });
        this.menu.footer.forEach((menuItem) => (menuItem.url = this.properties[menuItem.url] ? this.properties[menuItem.url] : menuItem.url));
        return {
            main: filteredItemsByRoles,
            footer: this.menu.footer,
        };
    }

    private getMenuByEnvironment(): IMenu {
        let menu: IMenu;
        if (this.properties.isTestEnv() || this.properties.isRcEnv()) {
            menu = menuTestRcEnvObject;
        } else if (this.properties.isTrainingEnv()) {
            menu = menuTrainingObject;
        } else {
            menu = menuObject;
        }
        if (!this.properties.SHOW_API_KEY_MENU) {
            return { main: menu.main.filter((menu) => menu.id !== 'api_keys'), footer: menu.footer };
        }
        return menu;
    }
}
