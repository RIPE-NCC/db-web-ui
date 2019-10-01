import {Component} from "@angular/core";
import {AlertsService} from "../../../shared/alert/alerts.service";
import {Router} from "@angular/router";
import {PropertiesService} from "../../../properties.service";

@Component({
    selector: "force-delete-select",
    templateUrl: "./force-delete-select.component.html",
})
export class ForceDeleteSelectComponent {

    public objectTypes: string[] = ["inetnum", "inet6num", "route", "route6", "domain"];
    public selected: any;

    constructor(public alertService: AlertsService,
                private properties: PropertiesService,
                private router: Router) {
    }

    public ngOnInit() {
        this.alertService.clearErrors();
        this.selected = {
            name: undefined,
            objectType: this.objectTypes[0],
            source: this.properties.SOURCE,
        };
    }

    public navigateToForceDelete() {
        return this.router.navigateByUrl(`forceDelete/${this.selected.source}/${this.selected.objectType}/${encodeURIComponent(this.selected.name)}`);
    }

    public isFormValid(): boolean {
        return this.selected.name !== undefined && this.selected.name !== "";
    }
}
