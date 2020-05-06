import {Component} from "@angular/core";
import {CookieService} from "ngx-cookie-service";

@Component({
    selector: "bof-banner",
    template: `
        <div *ngIf="!closed" class="alert alert-info alert-dismissible fade show" role="alert">
            The RIPE Database Requirements Task Force (DBTF) will organise its BoF on Wednesday, 6 May from 14h00-15h00 CEST via Zoom.<br/>
            Register for the BoF: (<a href="https://ripe.zoom.us/meeting/register/tJMkd-yhrz4uHNDuOIBm8hGvcj8DSDK1Ybog" target="_blank" class="alert-link">https://ripe.zoom.us/meeting/register/tJMkd-yhrz4uHNDuOIBm8hGvcj8DSDK1Ybog</a>)
            <button type="button" class="close" data-dismiss="alert" aria-label="Close" (click)="closeAlert()">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`,
})
export class BofBannerComponent {

    public closed: boolean;

    constructor(private cookies: CookieService) {}

    public ngOnInit() {
        this.closed = this.cookies.get("bof") === "closed";
    }

    public closeAlert() {
        this.cookies.set("bof", "closed");
    }
}
