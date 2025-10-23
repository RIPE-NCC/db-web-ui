import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { UserInfoService } from '../userinfo/user-info.service';
import { ConfirmMaintainerComponent } from './confirm-maintainer.component';
import { EmailLinkService } from './email-link.services';
import { FindMaintainerComponent } from './find-maintainer.component';
import { FindMaintainerService } from './find-maintainer.service';
import { FmpErrorService } from './fmp-error.service';
import { ForgotMaintainerPasswordComponent } from './forgot-maintainer-password.component';
import { ForgotMaintainerPasswordService } from './forgot-maintainer-password.service';
import { MailSentComponent } from './mail-sent.component';
import { RequireLoginComponent } from './require-login.component';
import { SsoAddedComponent } from './sso-added.component';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        SharedModule,
        FindMaintainerComponent,
        ConfirmMaintainerComponent,
        ForgotMaintainerPasswordComponent,
        MailSentComponent,
        RequireLoginComponent,
        SsoAddedComponent,
    ],
    providers: [FindMaintainerService, EmailLinkService, ForgotMaintainerPasswordService, UserInfoService, FmpErrorService],
})
export class FmpModule {}
