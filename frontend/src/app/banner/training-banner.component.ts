import {Component} from "@angular/core";
import {CookieService} from "ngx-cookie-service";
import {UserInfoService} from "../userinfo/user-info.service";

@Component({
  selector: "training-banner",
  templateUrl: "./training-banner.component.html",
})
export class TrainingBannerComponent {

  public closed: boolean;
  public member: boolean;

  constructor(private cookies: CookieService,
              private userInfoService: UserInfoService) {}

  public ngOnInit() {
    this.closed = this.cookies.get("training-banner") === "closed";
    this.member = this.isUserMember();
  }

  public closeAlert() {
    this.cookies.set("training-banner", "closed");
  }

  private isUserMember() {
    if(!this.userInfoService.isLogedIn()) {
      return false;
    }

    this.userInfoService.getSelectedOrganisation()
      .subscribe((selOrg: any) => {
        return selOrg && selOrg.orgObjectId;
      });
  }
}
