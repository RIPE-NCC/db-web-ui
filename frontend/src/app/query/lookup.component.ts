import {Component, EventEmitter, Input, OnChanges, Output} from "@angular/core";
import {IWhoisObjectModel} from "../shared/whois-response-type.model";
import {PropertiesService} from "../properties.service";

@Component({
    selector: "lookup",
    templateUrl: "./lookup.component.html",
})
export class LookupComponent implements OnChanges {
    
    @Input("whois-object")
    public whoisObject: IWhoisObjectModel;
    @Output("update-clicked")
    public updateClicked = new EventEmitter();
    public abuseContactFound = false;
    public abuseContactSuspected = false;
    public abuseContactSuspectedWithoutOrgid: boolean = false;
    public header = false;
    public resourceHolderFound = false;

    constructor(public properties: PropertiesService) {}

    public ngOnChanges() {
        this.header = !!(this.whoisObject["resource-holder"] || this.whoisObject["abuse-contact"]);
        this.abuseContactFound = !!this.whoisObject["abuse-contact"];
        this.abuseContactSuspected = this.abuseContactFound && this.whoisObject["abuse-contact"].suspect;
        this.abuseContactSuspectedWithoutOrgid = this.abuseContactSuspected
            && (!this.whoisObject["abuse-contact"]["org-id"] || this.whoisObject["abuse-contact"]["org-id"] === "");
        this.resourceHolderFound = !!this.whoisObject["resource-holder"];
    }

    public emitUpdateClicked() {
        this.updateClicked.emit();
    }
}
