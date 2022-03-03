import {Component} from "@angular/core";
import {CookieService} from "ngx-cookie-service";
import {UserInfoService} from "../userinfo/user-info.service";
import {IUserInfoResponseData} from "../dropdown/org-data-type.model";

@Component({
  selector: "certificate-banner",
  templateUrl: "./certificate-banner.component.html",
})
export class CertificateBannerComponent {

  public closed: boolean;
  public member: boolean;

  constructor(private cookies: CookieService,
              private userInfoService: UserInfoService) {
    this.userInfoService.userLoggedIn$.subscribe((userInfo: IUserInfoResponseData) => {
      this.isUserMember(userInfo);
    });
  }

  public ngOnInit() {
    this.closed = localStorage.getItem("certificate-banner")  === "closed";
  }

  public closeAlert() {
    const element = document.getElementsByClassName("alert")[0];
    element.parentNode.removeChild(element);
    localStorage.setItem("certificate-banner", "closed");
  }

  private isUserMember(userInfo: IUserInfoResponseData) {
    if(userInfo) {
      this.userInfoService.getSelectedOrganisation()
        .subscribe((selOrg: any) => {
          this.member = selOrg && selOrg.orgObjectId && selOrg.roles.indexOf("LIR") > -1;
        });
    } else {
      this.member = false;
    }
  }
}
