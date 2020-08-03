import {Component} from "@angular/core";
import {Router} from "@angular/router";
import * as _ from "lodash";
import {WhoisMetaService} from "../shared/whois-meta.service";
import {UserInfoService} from "../userinfo/user-info.service";
import {PropertiesService} from "../properties.service";

interface ISelectedObjectType {
    objectType: string;
    source: string;
}

@Component({
    selector: "select-component",
    templateUrl: "./select.component.html",
})
export class SelectComponent {
    public selected: ISelectedObjectType;
    public objectTypes: string[];
    public loggedIn: boolean;

    constructor(private router: Router,
                public whoisMetaService: WhoisMetaService,
                public userInfoService: UserInfoService,
                private properties: PropertiesService) {
        this.userInfoService.userLoggedIn$.subscribe(() => {
            this.loggedIn = true;
        });
    }

    /*
     * UI initialisation
     */
    public ngOnInit() {
        this.objectTypes = this.filterObjectTypes(this.whoisMetaService.getObjectTypes());
        this.userInfoService.getUserOrgsAndRoles().subscribe(() => {
                this.loggedIn = true;
            }
        , () => {});
        this.selected = {
            objectType: "role-mntnr",
            source: this.properties.SOURCE,
        };
    }

    /*
     * Methods called from the html-teplate
     */
    public labelForSource(src: string): string {
        return src === "RIPE" ? "RIPE    production database" : "Test database (currently not available)";
    }

    public navigateToCreate() {
        if (this.selected.objectType === "mntner") {
            this.router.navigate(["webupdates/create", this.selected.source, "mntner", "self"]);
        } else if (this.selected.objectType === "domain") {
            this.router.navigate(["webupdates/wizard", this.selected.source, "domain"]);
        } else if (this.selected.objectType === "role-mntnr") {
            this.router.navigate(["webupdates/create", this.selected.source, "role", "self"]);
        } else {
            this.router.navigate(["webupdates/create", this.selected.source, this.selected.objectType]);
        }
    }

    public filterObjectTypes(unfiltered: string[]): string[] {
        return _.filter(unfiltered, (item: string) => {
            return item !== "as-block" && item !== "poem" && item !== "poetic-form" && item != "aut-num";
        });
    }
}
