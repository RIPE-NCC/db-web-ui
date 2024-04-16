import { Component, Input, OnChanges } from '@angular/core';
import { PropertiesService } from '../properties.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IWhoisObjectModel } from '../shared/whois-response-type.model';

@Component({
    selector: 'lookup',
    templateUrl: './lookup.component.html',
})
export class LookupComponent implements OnChanges {
    @Input()
    public whoisObject: IWhoisObjectModel;

    public abuseContactFound = false;
    public abuseContactSuspected = false;
    public abuseContactSuspectedWithoutOrgid: boolean = false;
    public header = false;
    public resourceHolderFound = false;

    constructor(public properties: PropertiesService) {}

    public ngOnChanges() {
        this.header = !!(this.whoisObject['resource-holder'] || this.whoisObject['abuse-contact']);
        this.abuseContactFound = !!this.whoisObject['abuse-contact'];
        this.abuseContactSuspected = this.abuseContactFound && this.whoisObject['abuse-contact'].suspect;
        this.abuseContactSuspectedWithoutOrgid =
            this.abuseContactSuspected && (!this.whoisObject['abuse-contact']['org-id'] || this.whoisObject['abuse-contact']['org-id'] === '');
        this.resourceHolderFound = !!this.whoisObject['resource-holder'];
    }

    formatObjectMessages(whoisObject: IWhoisObjectModel): string[] {
        return WhoisResourcesService.getReadableObjectMessages(whoisObject);
    }
}
