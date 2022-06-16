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
    icon?: string; // right now this is the markup of the SVG icon - planned to be replaced with only an icon name once we finalize the list of icons used
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
        this.menu.main.forEach((menuItem) => (menuItem.url = this.properties[menuItem.url] ? this.properties[menuItem.url] : menuItem.url));
        this.menu.footer.forEach((menuItem) => (menuItem.url = this.properties[menuItem.url] ? this.properties[menuItem.url] : menuItem.url));
        return {
            main: filteredItemsByRoles,
            footer: this.menu.footer,
        };
    }

    private getMenuByEnvironment(): IMenu {
        if (this.properties.isTestRcEnv()) {
            return menuTestRcEnvObject;
        } else if (this.properties.isTrainingEnv()) {
            return menuTrainingObject;
        } else {
            return menuObject;
        }
    }
}
