import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {CookieService} from "ngx-cookie-service";
import {NgSelectModule} from "@ng-select/ng-select";
import {NgOptionHighlightModule} from "@ng-select/ng-option-highlight";
import {DiffMatchPatchModule} from "ng-diff-match-patch";
import {PreferenceService} from "./preference.service";
import {CharsetToolsService} from "./charset-tools.service";
import {ErrorReporterService} from "./error-reporter.service";
import {LinkService} from "./link.service";
import {MessageStoreService} from "./message-store.service";
import {MntnerService} from "./mntner.service";
import {RestService} from "./rest.service";
import {ScreenLogicInterceptorService} from "./screen-logic-interceptor.service";
import {HeaderInterceptor} from "../interceptor/header.interceptor";
import {SharedModule} from "../shared/shared.module";
import {EnumService} from "./web/enum.service";
import {DisplayComponent} from "./web/display.component";
import {DisplayMntnerPairComponent} from "./web/display-mntner-pair.component";
import {SelectComponent} from "./web/select.component";
import {ForceDeleteComponent} from "./web/forcedelete/force-delete.component";
import {ForceDeleteSelectComponent} from "./web/forcedeleteselect/force-delete-select.component";
import {DeleteComponent} from "./web/delete.component";
import {CryptService} from "./web/crypt.service";
import {OrganisationHelperService} from "./web/organisation-helper.service";
import {CreateModifyComponent} from "./web/create-modify.component";
import {CreateMntnerPairComponent} from "./web/create-mntner-pair/create-mntner-pair.component";
import {CreateSelfMaintainedMaintainerComponent} from "./web/create-self-maintained-maintainer.component";
import {ModalAddAttributeComponent} from "./web/modal-add-attribute.component";
import {ModalAuthenticationComponent} from "./web/modal-authentication.component";
import {ModalCreateRoleForAbuseCComponent} from "./web/modal-create-role-for-abusec.component";
import {ModalDeleteObjectComponent} from "./web/modal-delete-object.component";
import {ModalMd5PasswordComponent} from "./web/modal-md5-password.component";
import {ModalEditAttributeComponent} from "./web/modal-edit-attribute.component";
import {CreateService} from "./web/create.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        NgSelectModule,
        NgOptionHighlightModule,
        DiffMatchPatchModule,
        RouterModule
    ],
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
        ModalEditAttributeComponent
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
        {provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true }
    ],
    entryComponents: [
        DisplayComponent,
        DisplayMntnerPairComponent,
        SelectComponent,
        CreateModifyComponent,
        CreateMntnerPairComponent,
        CreateSelfMaintainedMaintainerComponent,
        ModalAddAttributeComponent,
        ModalAuthenticationComponent,
        ModalCreateRoleForAbuseCComponent,
        ModalDeleteObjectComponent,
        ModalMd5PasswordComponent,
        ModalEditAttributeComponent
    ]
})
export class UpdatesModule {
}
