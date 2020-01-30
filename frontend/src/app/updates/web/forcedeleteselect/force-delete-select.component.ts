import {Component, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {PropertiesService} from "../../../properties.service";
import {AlertsComponent} from "../../../shared/alert/alerts.component";

@Component({
    selector: "force-delete-select",
    templateUrl: "./force-delete-select.component.html",
})
export class ForceDeleteSelectComponent {

    public objectTypes: string[] = ["inetnum", "inet6num", "route", "route6", "domain"];
    public selected: any;

    @ViewChild(AlertsComponent, {static: true})
    private alertsComponent: AlertsComponent;

    constructor(private properties: PropertiesService,
                private router: Router) {
    }

    public ngOnInit() {
        this.alertsComponent.clearErrors();
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
