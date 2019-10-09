import {Component, Input} from "@angular/core";
import {Router} from "@angular/router";
import {ResourceStatusService} from "./resource-status.service";
import {Labels} from "../label.constants";

@Component({
    selector: "resource-item",
    templateUrl: "./resource-item.component.html",
})
export class ResourceItemComponent {

    @Input()
    public item: any;//IResourceScreenItem;
    @Input()
    public sponsored: boolean;
    public ipanalyserRedirect: boolean;
    public usedPercentage: number;
    public showProgressbar: boolean;

    public flags: Array<{
        colour?: string;
        text: string;
        tooltip: string;
    }> = [];

    constructor(private router: Router,
                private resourceStatusService: ResourceStatusService) {
    }

    public ngOnInit() {
        if (this.item.usage) {
            this.usedPercentage = Math.round(this.item.usage.used * 100 / this.item.usage.total);
        }
        this.showProgressbar = this.item.type.toLowerCase() !== "aut-num" && !this.sponsored &&
            this.resourceStatusService.isResourceWithUsage(this.item.type, this.item.status);

        if (this.item.status) {
            this.flags.push({text: this.item.status, tooltip: "status"});
        }
        if (this.item.netname) {
            this.flags.push({text: this.item.netname, tooltip: "netname"});
        }
        if (this.item.asname) {
            this.flags.push({text: this.item.asname, tooltip: "as-name"});
        }
        if (this.item.noContract) {
            this.flags.push({
                colour: "orange",
                text: Labels["flag.noContract.text"],
                tooltip: Labels["flag.noContract.title"],
            });
        }
        if (this.item.sponsoredByOther) {
            this.flags.push({
                colour: "orange",
                text: Labels["flag.otherSponsor.text"],
                tooltip: Labels["flag.otherSponsor.title"],
            });
        }
        if (this.item.sponsored) {
            this.flags.push({
                colour: "orange",
                text: Labels["flag.sponsored.text"],
                tooltip: Labels["flag.sponsored.title"],
            });
        }
    }
}
