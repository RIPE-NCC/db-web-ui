import {Component, OnChanges, SimpleChanges} from "@angular/core";
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
    this.isUserMember();
  }

  public closeAlert() {
    this.cookies.set("training-banner", "closed");
  }

  private isUserMember() {

    if(!this.userInfoService.isLogedIn()) {
      this.member = false;
      console.info("user is not logged in " + this.member);
    } else {
      console.info("user is logged in " + this.member);
      this.userInfoService.getSelectedOrganisation()
        .subscribe((selOrg: any) => {
          console.info("result from userinfo service " + selOrg);
          this.member = selOrg.lir;
          console.info("is an lir " + this.member);
        });
    }
  }
}
