import {Component, Input} from "@angular/core";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import {PropertiesService} from "../properties.service";
import {MenuService} from "./menu.service";
import {OrgDropDownSharedService} from "../dropdown/org-drop-down-shared.service";
import {IUserInfoOrganisation} from "../dropdown/org-data-type.model";

declare var useUsersnap: () => any;

@Component({
    selector: "swe-menu",
    template: `<app-nav-bar (app-nav-bar-select)="handle($event)"
                            [menu]="menu" [open]=open></app-nav-bar>`,
})
export class MenuComponent {

    @Input()
    public open: boolean;
    public menu: string;

    constructor(public properties: PropertiesService,
                public orgDropDownSharedService: OrgDropDownSharedService,
                private menuService: MenuService,
                private location: Location,
                private router: Router) {
        orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            if (!selected || !selected.roles) {
                return;
            }
            this.menu = JSON.stringify(this.menuService.createMenu(selected.roles));
        })
    }

    ngOnInit() {
        this.menu = JSON.stringify(this.menuService.createMenu(["unauthorised"]));
    }

    handle = (event: any) => {
        if (event.detail && event.detail.selected && event.detail.selected.url) {
            const url = event.detail.selected.url;
            if (event.detail.selected.id === "feedback") {
                useUsersnap();
            } else if (url.startsWith("http")) {
                window.location.href = url;
            } else {
                this.router.navigate([eval("`${this.properties." + url + "}`")]);
            }
        }
    }
}
