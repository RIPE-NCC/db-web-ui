import { Component, Input, OnChanges, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertiesService } from '../properties.service';
import { LabelPipe } from '../shared/label.pipe';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IWhoisObjectModel } from '../shared/whois-response-type.model';
import { WhoisObjectViewerComponent } from '../whois-object/whois-object-viewer.component';

@Component({
    selector: 'lookup',
    templateUrl: './lookup.component.html',
    standalone: true,
    imports: [RouterLink, WhoisObjectViewerComponent, LabelPipe],
})
export class LookupComponent implements OnChanges {
    properties = inject(PropertiesService);

    @Input()
    public whoisObject: IWhoisObjectModel;

    public abuseContactFound = false;
    public abuseContactSuspected = false;
    public abuseContactSuspectedWithoutOrgid: boolean = false;
    public header = false;
    public resourceHolderFound = false;

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
