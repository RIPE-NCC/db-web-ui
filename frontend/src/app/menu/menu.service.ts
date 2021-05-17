import {Injectable} from "@angular/core";
import {PropertiesService} from "../properties.service";
import {menuObject} from "./menu.json";
import {menuTestRcEnvObject} from "./menu-test-rc-env.json";
import {menuTrainingObject} from "./menu-training-env.json";
import {EnvironmentStatusService} from "../shared/environment-status.service";

export interface IMenu {
    main: IMainMenuItem[],
    footer: IFooterMenuItem[]
}

export interface IMainMenuItem {
    title: string, // title of the menu item
    subtitle?: string,
    id: string, // unique identifier for the menu item (if not specified, title value will be used)
    icon?: string, // right now this is the markup of the SVG icon - planned to be replaced with only an icon name once we finalize the list of icons used
    url?: string, // optional URL for menu item
    parent?: string, // null || string -- id of parent menu item; used for nested menu items
    roles: string[]
}

export interface IFooterMenuItem {
    title: string,
    subtitle?: string,
    id: string,
    icon: string,
    url?: string
}

export interface IRoles {
    unauthorised: boolean;
    admin: boolean;
    billing: boolean;
    certification: boolean;
    general: boolean;
    generalMeeting: boolean;
    guest: boolean;
    myResources: boolean;
    ticketing: boolean;
}

@Injectable()
export class MenuService {

    public menu: IMenu;
    public roles: IRoles;

    constructor(public properties: PropertiesService) {
        this.roles= {
            unauthorised: true,
            admin: false,
            billing: false,
            certification: false,
            general: false,
            generalMeeting: false,
            guest: false,
            myResources: false,
            ticketing: false,
        };
    }

    createMenu(userRoles: string[]): IMenu {
        this.menu = MenuService.getMenuByEnvironment();
        this.setRoles(userRoles);
        const filteredItemsByRoles = this.menu.main.filter(item => item.roles.some(role => userRoles.includes(role)));
        // @ts-ignore
        this.menu.main.forEach(menuItem =>  menuItem.url = this.properties[menuItem.url] ? this.properties[menuItem.url] : menuItem.url);
        this.menu.footer.forEach(menuItem =>  menuItem.url = this.properties[menuItem.url] ? this.properties[menuItem.url] : menuItem.url);
        return {
            main: filteredItemsByRoles,
            footer: this.menu.footer
        }
    }

    private static getMenuByEnvironment(): IMenu {
        if (EnvironmentStatusService.isTestRcEnv()) {
            return menuTestRcEnvObject;
        } else if (EnvironmentStatusService.isTrainingEnv()) {
            return menuTrainingObject;
        } else {
            return menuObject;
        }
    }

    private clearRoles() {
        this.roles.admin = this.roles.general = this.roles.billing
            = this.roles.generalMeeting = this.roles.ticketing = this.roles.certification
            = this.roles.myResources = this.roles.guest = false;
    }

    private setRoles(userRoles: string[]) {
        this.clearRoles();

        if (!userRoles) {
            return;
        }
        for (const role of userRoles) {
            switch (role) {
                case "admin":
                    this.roles.admin = true;
                    break;
                case "billing":
                    this.roles.billing = true;
                    break;
                case "certification":
                    this.roles.certification = true;
                    break;
                case "general":
                    this.roles.general = true;
                    break;
                case "generalMeeting":
                    this.roles.generalMeeting = true;
                    break;
                case "guest":
                    this.roles.guest = true;
                    break;
                case "myResources":
                    this.roles.myResources = true;
                    break;
                case "ticketing":
                    this.roles.ticketing = true;
                    break;
                default:
                    break;
            }
        }
    }
}
