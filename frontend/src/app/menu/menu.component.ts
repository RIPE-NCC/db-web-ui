import {Component, Input} from "@angular/core";
import {NavigationEnd, Router} from "@angular/router";
import {Location} from "@angular/common";
import {filter} from "rxjs/operators";
import {Observable, Subscription} from "rxjs";
import {PropertiesService} from "../properties.service";
import {MenuService} from "./menu.service";
import {OrgDropDownSharedService} from "../dropdown/org-drop-down-shared.service";
import {IUserInfoOrganisation} from "../dropdown/org-data-type.model";

declare var useUsersnap: () => any;

@Component({
    selector: "swe-menu",
    template: `<app-nav-bar (app-nav-bar-select)="handle($event)"
                            [menu]="menu" [open]=open [active]="activeItem"></app-nav-bar>`,
})
export class MenuComponent {

    @Input()
    public open: boolean;
    public menu: string;
    public dbMenuIsActive: boolean;
    public activeItem: string = "create"; // id from menu.json
    public activeUrl: string; // browser url - location path
    private readonly navigationEnd: Subscription;

    constructor(public properties: PropertiesService,
                public orgDropDownSharedService: OrgDropDownSharedService,
                private menuService: MenuService,
                private location: Location,
                private router: Router) {
        // mainly because switching between My Resources and Sponsored Resources
        const event = this.router.events.pipe(filter(evt => evt instanceof NavigationEnd)) as Observable<NavigationEnd>;
        this.navigationEnd = event.subscribe(evt => {
            this.activeUrl = evt.url;
            this.setActive();
        });
        orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            if (!selected || !selected.roles) {
                return;
            }
            this.menu = JSON.stringify(this.menuService.createMenu(selected.roles));
        })
    }

    ngOnInit() {
        this.activeUrl = this.location.path();
        this.setActive();
        this.menu = JSON.stringify(this.menuService.createMenu(["unauthorised"]));
    }

    public ngOnDestroy() {
        if (this.navigationEnd) {
            this.navigationEnd.unsubscribe();
        }
    }

    handle = (event: any) => {
        if (event.detail && event.detail.selected && event.detail.selected.url) {
            const url = event.detail.selected.url;
            if (event.detail.selected.id === "feedback") {
                useUsersnap();
            } else if (url.startsWith("http")) {
                window.location.href = url;
            } else if (event.detail.selected.id === "sponsored") {
                this.router.navigate([eval("`${this.properties." + url + "}`")], {queryParams: {sponsored: true }});
            } else {
                this.router.navigate([eval("`${this.properties." + url + "}`")]);
            }
        }
    }

    private setActive() {
        if (this.activeUrl.indexOf("/wizard") > -1 ||
            this.activeUrl.indexOf("/select") > -1 ||
            this.activeUrl.indexOf("/create") > -1) {
            this.activeItem = "create";
        } else if (this.activeUrl.indexOf("/myresources") > -1) {
            this.activeItem = (this.activeUrl.indexOf("sponsored") === -1 || this.activeUrl.indexOf("sponsored=false") > -1)
                ? "myresources" : "sponsored";
        } else {
            this.activeItem = this.activeUrl.substring(this.activeUrl.lastIndexOf('/') + 1);
        }
    }
}
