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
import {EnumService} from "./enum.service";
import {DisplayComponent} from "./display.component";
import {DisplayMntnerPairComponent} from "./display-mntner-pair.component";
import {SelectComponent} from "./select.component";
import {ForceDeleteComponent} from "./forcedelete/force-delete.component";
import {ForceDeleteSelectComponent} from "./forcedeleteselect/force-delete-select.component";
import {DeleteComponent} from "./delete.component";
import {CryptService} from "./crypt.service";
import {OrganisationHelperService} from "./organisation-helper.service";
import {CreateModifyComponent} from "./create-modify.component";
import {CreateMntnerPairComponent} from "./createmntnerpair/create-mntner-pair.component";
import {CreateSelfMaintainedMaintainerComponent} from "./create-self-maintained-maintainer.component";
import {ModalAddAttributeComponent} from "./modal-add-attribute.component";
import {ModalAuthenticationComponent} from "./modal-authentication.component";
import {ModalCreateRoleForAbuseCComponent} from "./modal-create-role-for-abusec.component";
import {ModalDeleteObjectComponent} from "./modal-delete-object.component";
import {ModalMd5PasswordComponent} from "./modal-md5-password.component";
import {ModalEditAttributeComponent} from "./modal-edit-attribute.component";
import {CreateService} from "./create.service";

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
export class UpdatesWebModule {
}
