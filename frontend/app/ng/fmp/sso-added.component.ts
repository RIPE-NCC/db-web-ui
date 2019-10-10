import {Component} from "@angular/core";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: "sso-added",
    templateUrl: "./sso-added.component.html",
})
export class SsoAddedComponent {

    public mntnerKey: string;
    public user: any;

    constructor(private activatedRoute: ActivatedRoute) {}

    public ngOnInit() {
        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.mntnerKey = paramMap.get("mntnerKey");
        this.user = paramMap.get("user");
    }
}

