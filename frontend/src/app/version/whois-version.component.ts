import {Component, Input, OnChanges} from "@angular/core";
import {PropertiesService} from "../properties.service";
import {IVersion} from "../shared/whois-response-type.model";

@Component({
    selector: "whois-version",
    template: `
        <div class="db-version-footer text-muted">
            <span *ngIf="version">RIPE Database Software Version {{version.version}}</span>
        </div>`
})
export class WhoisVersionComponent implements OnChanges {

    @Input()
    public version: IVersion;

    ngOnChanges() {}
}
