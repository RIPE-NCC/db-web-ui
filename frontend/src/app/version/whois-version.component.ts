import {Component, Input} from "@angular/core";
import {IVersion} from "../shared/whois-response-type.model";

@Component({
    selector: "whois-version",
    template: `
        <div class="text-muted">
            <span *ngIf="version">RIPE Database Software Version {{version.version}}</span>
        </div>`
})
export class WhoisVersionComponent {

    @Input()
    public version: IVersion;

}
