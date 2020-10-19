import {Component, OnChanges, SimpleChanges} from "@angular/core";
import {CookieService} from "ngx-cookie-service";
import {UserInfoService} from "../userinfo/user-info.service";

@Component({
  selector: "bof-banner",
  templateUrl: "./bof-banner.component.html",
})
export class BofBannerComponent {

  public closed: boolean;

  constructor() {}

  public ngOnInit() {
    this.closed = localStorage.getItem("bof-banner")  === "closed";
  }

  public closeAlert() {
    localStorage.setItem("bof-banner", "closed");
  }
}
