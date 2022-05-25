import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import { HeaderInterceptor } from '../interceptor/header.interceptor';
import { SharedModule } from '../shared/shared.module';
import { WhoisObjectModule } from '../whois-object/whois-object.module';
import { CharsetToolsService } from './charset-tools.service';
import { CreateModifyComponent } from './create-modify.component';
import { CreateSelfMaintainedMaintainerComponent } from './create-self-maintained-maintainer.component';
import { CreateService } from './create.service';
import { CreateMntnerPairComponent } from './createmntnerpair/create-mntner-pair.component';
import { CryptService } from './crypt.service';
import { DeleteComponent } from './delete.component';
import { DisplayMntnerPairComponent } from './display-mntner-pair.component';
import { DisplayComponent } from './display.component';
import { EnumService } from './enum.service';
import { ErrorReporterService } from './error-reporter.service';
import { ForceDeleteComponent } from './forcedelete/force-delete.component';
import { ForceDeleteSelectComponent } from './forcedeleteselect/force-delete-select.component';
import { LinkService } from './link.service';
import { MessageStoreService } from './message-store.service';
import { MntnerService } from './mntner.service';
import { ModalAddAttributeComponent } from './modal-add-attribute.component';
import { ModalAuthenticationComponent } from './modal-authentication.component';
import { ModalCreateRoleForAbuseCComponent } from './modal-create-role-for-abusec.component';
import { ModalDeleteObjectComponent } from './modal-delete-object.component';
import { ModalEditAttributeComponent } from './modal-edit-attribute.component';
import { ModalMd5PasswordComponent } from './modal-md5-password.component';
import { OrganisationHelperService } from './organisation-helper.service';
import { PreferenceService } from './preference.service';
import { RestService } from './rest.service';
import { ScreenLogicInterceptorService } from './screen-logic-interceptor.service';
import { SelectComponent } from './select.component';
import { TypeaheadComponent } from './typeahead.component';

@NgModule({
    imports: [CommonModule, FormsModule, HttpClientModule, SharedModule, NgSelectModule, WhoisObjectModule, RouterModule],
    declarations: [
        DisplayComponent,
        DisplayMntnerPairComponent,
        SelectComponent,
        ForceDeleteComponent,
        ForceDeleteSelectComponent,
        DeleteComponent,
        CreateModifyComponent,
        CreateMntnerPairComponent,
        CreateSelfMaintainedMaintainerComponent,
        ModalAddAttributeComponent,
        ModalAuthenticationComponent,
        ModalCreateRoleForAbuseCComponent,
        ModalDeleteObjectComponent,
        ModalMd5PasswordComponent,
        ModalEditAttributeComponent,
        TypeaheadComponent,
    ],
    providers: [
        PreferenceService,
        CookieService,
        CreateService,
        CharsetToolsService,
        ErrorReporterService,
        LinkService,
        MessageStoreService,
        MntnerService,
        RestService,
        ScreenLogicInterceptorService,
        EnumService,
        CryptService,
        OrganisationHelperService,
        { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
    ],
})
export class UpdatesWebModule {}
