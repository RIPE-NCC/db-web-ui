import {Component, OnChanges, SimpleChanges} from "@angular/core";
import {CookieService} from "ngx-cookie-service";
import {UserInfoService} from "../userinfo/user-info.service";

@Component({
  selector: "certificate-banner",
  templateUrl: "./certificate-banner.component.html",
})
export class CertificateBannerComponent {

  public closed: boolean;
  public member: boolean;

  constructor(private cookies: CookieService,
              private userInfoService: UserInfoService) {}

  public ngOnInit() {
    this.closed = localStorage.getItem("certificate-banner")  === "closed";
    this.isUserMember();
  }

  public closeAlert() {
    localStorage.setItem("certificate-banner", "closed");
  }

  private isUserMember() {

    //cannot use this.userInfoService.isLogedIn as it does not work with refresh
    this.userInfoService.getLoggedInUser()
      .subscribe((user: any) => {

        if(user) {
          this.userInfoService.getSelectedOrganisation()
            .subscribe((selOrg: any) => {
              this.member = selOrg && selOrg.orgObjectId && selOrg.roles.indexOf("LIR") > -1;
            });
        } else {
          this.member = false;
        }
      });
  }
}