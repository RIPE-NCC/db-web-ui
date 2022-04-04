import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FindMaintainerService} from "./find-maintainer.service";
import {CoreModule} from "../core/core.module";
import {FindMaintainerComponent} from "./find-maintainer.component";
import {ConfirmMaintainerComponent} from "./confirm-maintainer.component";
import {EmailLinkService} from "./email-link.services";
import {ForgotMaintainerPasswordComponent} from "./forgot-maintainer-password.component";
import {MailSentComponent} from "./mail-sent.component";
import {RequireLoginComponent} from "./require-login.component";
import {SsoAddedComponent} from "./sso-added.component";
import {ForgotMaintainerPasswordService} from "./forgot-maintainer-password.service";
import {SharedModule} from "../shared/shared.module";
import {UserInfoService} from "../userinfo/user-info.service";

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        SharedModule
    ],
    declarations: [
        FindMaintainerComponent,
        ConfirmMaintainerComponent,
        ForgotMaintainerPasswordComponent,
        MailSentComponent,
        RequireLoginComponent,
        SsoAddedComponent
    ],
    providers: [
        FindMaintainerService,
        EmailLinkService,
        ForgotMaintainerPasswordService,
        UserInfoService,
    ]
})
export class FmpModule {
}
