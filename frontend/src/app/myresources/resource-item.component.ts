import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbProgressbar, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { Labels } from '../label.constants';
import { FlagComponent, IFlag } from '../shared/flag/flag.component';
import { NameFormatterComponent } from '../shared/name-formatter.component';
import { ResourceStatusService } from './resource-status.service';

@Component({
    selector: 'resource-item',
    templateUrl: './resource-item.component.html',
    imports: [RouterLink, NameFormatterComponent, NgIf, NgFor, FlagComponent, NgClass, NgbTooltip, NgbProgressbar, DecimalPipe],
})
export class ResourceItemComponent implements OnInit {
    private router = inject(Router);
    private resourceStatusService = inject(ResourceStatusService);

    @Input()
    public item: any;
    @Input()
    public sponsored: boolean;
    public ipanalyserRedirect: boolean;
    public usedPercentage: number;
    public showProgressbar: boolean;

    public flags: Array<IFlag> = [];

    public ngOnInit() {
        if (this.item.usage) {
            this.usedPercentage = Math.round((this.item.usage.used * 100) / this.item.usage.total);
        }
        this.showProgressbar =
            this.item.type.toLowerCase() !== 'aut-num' && !this.sponsored && this.resourceStatusService.isResourceWithUsage(this.item.type, this.item.status);

        if (this.item.status) {
            this.flags.push({ text: this.item.status, tooltip: 'status' });
        }
        if (this.item.netname) {
            this.flags.push({ text: this.item.netname, tooltip: 'netname' });
        }
        if (this.item.asname) {
            this.flags.push({ text: this.item.asname, tooltip: 'as-name' });
        }
        if (this.item.noContract) {
            this.flags.push({
                colour: 'orange',
                text: Labels['flag.noContract.text'],
                tooltip: Labels['flag.noContract.title'],
            });
        }
        if (this.item.sponsoredByOther) {
            this.flags.push({
                colour: 'orange',
                text: Labels['flag.otherSponsor.text'],
                tooltip: Labels['flag.otherSponsor.title'],
            });
        }
        if (this.item.sponsored) {
            this.flags.push({
                colour: 'orange',
                text: Labels['flag.sponsored.text'],
                tooltip: Labels['flag.sponsored.title'],
            });
        }
        if (this.item.iRR) {
            this.flags.push({
                colour: 'green',
                text: Labels['flag.iRR.text'],
                tooltip: Labels['flag.iRR.title'],
            });
        }
        if (this.item.rDNS) {
            this.flags.push({
                colour: 'green',
                text: Labels['flag.rDNS.text'],
                tooltip: Labels['flag.rDNS.title'],
            });
        }
    }
}
