import {Component, Inject} from "@angular/core";
import {Location} from "@angular/common";
import {NavigationEnd, Router} from "@angular/router";
import {Observable, Subscription} from "rxjs";
import {filter} from "rxjs/operators";
import {WINDOW} from "../core/window.service";
import {EnvironmentStatusService} from "../shared/environment-status.service";
import {OrgDropDownSharedService} from "../dropdown/org-drop-down-shared.service";
import {IUserInfoOrganisation} from "../dropdown/org-data-type.model";
import {PropertiesService} from "../properties.service";

@Component({
    selector: "left-hand-menu",
    templateUrl: "./left-hand-menu.component.html",
})
export class LeftHandMenuComponent {

    public activeUrl: string;
    public show: {
        admin: boolean;
        billing: boolean;
        certification: boolean;
        general: boolean;
        generalMeeting: boolean;
        guest: boolean;
        myResources: boolean;
        testRcEnv: boolean;
        ticketing: boolean;
        // Only temporary for the test environment
        trainingEnv: boolean;
    } = {
        admin: false,
        billing: false,
        certification: false,
        general: false,
        generalMeeting: false,
        guest: false,
        myResources: false,
        testRcEnv: false,
        ticketing: false,
        // Only temporary for the test environment
        trainingEnv: false,
    };

    public dbMenuIsActive: boolean;
    public selectMyResourceMenuItem: boolean;
    public selectSponsoredMenuItem: boolean;

    private navigationEnd: Subscription;

    constructor(public environmentStatusService: EnvironmentStatusService,
                public properties: PropertiesService,
                @Inject(WINDOW) private window: any,
                public orgDropDownSharedService: OrgDropDownSharedService,
                private location: Location,
                private router: Router) {

        const event = this.router.events.pipe(filter(evt => evt instanceof NavigationEnd)) as Observable<NavigationEnd>;
        this.navigationEnd = event.subscribe(evt => {
            this.activeUrl = evt.url;
            this.isResourceOrSponsoredMenuActive();
            this.isDbMenuActive();
        });
        orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            this.show.admin = this.show.general = this.show.billing
                = this.show.generalMeeting = this.show.ticketing = this.show.certification
                = this.show.myResources = this.show.guest = false;

            // Only temporary for the test environment
            this.show.testRcEnv = this.environmentStatusService.isTestRcEnv();
            this.show.trainingEnv = this.environmentStatusService.isTrainingEnv();

            if (!selected || !selected.roles) {
                return;
            }
            for (const role of selected.roles) {
                switch (role) {
                    case "admin":
                        this.show.admin = true;
                        break;
                    case "billing":
                        this.show.billing = true;
                        break;
                    case "certification":
                        this.show.certification = true;
                        break;
                    case "general":
                        this.show.general = true;
                        break;
                    case "generalMeeting":
                        this.show.generalMeeting = true;
                        break;
                    case "guest":
                        this.show.guest = true;
                        break;
                    case "myResources":
                        this.show.myResources = true;
                        break;
                    case "ticketing":
                        this.show.ticketing = true;
                        break;
                    default:
                        break;
                }
            }
        });
    }

    public ngOnInit() {
        this.window.init_portlet_menu();
        this.activeUrl = this.location.path();
        this.isDbMenuActive();
    }

    public ngOnDestroy() {
        if (this.navigationEnd) {
            this.navigationEnd.unsubscribe();
        }
    }

    private isDbMenuActive() {
        this.dbMenuIsActive =
            this.activeUrl.indexOf("/wizard") > -1 ||
            this.activeUrl.indexOf("/select") > -1 ||
            this.activeUrl.indexOf("/create") > -1 ||
            this.activeUrl.indexOf("/display") > -1 ||
            this.activeUrl.indexOf("/modify") > -1 ||
            this.activeUrl.indexOf("/query") > -1 ||
            this.activeUrl.indexOf("/fulltextsearch") > -1 ||
            this.activeUrl.indexOf("/lookup") > -1 ||
            this.activeUrl.indexOf("/multi") > -1 ||
            this.activeUrl.indexOf("/syncupdates") > -1 ||
            this.activeUrl === "/";
    }

    private isResourceOrSponsoredMenuActive() {
        this.selectMyResourceMenuItem = this.location.path().indexOf("/myresources/") > -1
            && (this.location.path().indexOf("sponsored") === -1
                || this.location.path().indexOf("sponsored=false") > -1);
        this.selectSponsoredMenuItem = this.location.path().indexOf("/myresources/") > -1
            && !this.selectMyResourceMenuItem;
    }
}
