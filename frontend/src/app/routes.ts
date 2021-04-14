import {Routes} from "@angular/router";
import {ForgotMaintainerPasswordComponent} from "./fmp/forgot-maintainer-password.component";
import {RequireLoginComponent} from "./fmp/require-login.component";
import {ResourcesComponent} from "./myresources/resources.component";
import {ResourceDetailsComponent} from "./myresources/resourcedetails/resource-details.component";
import {DomainObjectWizardComponent} from "./domainobject/domain-object-wizard.component";
import {DisplayDomainObjectsComponent} from "./domainobject/display-domain-objects.component";
import {SelectComponent} from "./updatesweb/select.component";
import {DisplayMntnerPairComponent} from "./updatesweb/display-mntner-pair.component";
import {CreateSelfMaintainedMaintainerComponent} from "./updatesweb/create-self-maintained-maintainer.component";
import {CreateModifyComponent} from "./updatesweb/create-modify.component";
import {DisplayComponent} from "./updatesweb/display.component";
import {ForceDeleteSelectComponent} from "./updatesweb/forcedeleteselect/force-delete-select.component";
import {ForceDeleteComponent} from "./updatesweb/forcedelete/force-delete.component";
import {LookupSingleObjectComponent} from "./query/lookup-single-object.component";
import {QueryComponent} from "./query/query.component";
import {SyncupdatesComponent} from "./syncupdates/syncupdates.component";
import {FullTextSearchComponent} from "./fulltextsearch/full-text-search.component";
import {TextCreateComponent} from "./updatestext/text-create.component";
import {TextModifyComponent} from "./updatestext/text-modify.component";
import {FindMaintainerComponent} from "./fmp/find-maintainer.component";
import {MailSentComponent} from "./fmp/mail-sent.component";
import {SsoAddedComponent} from "./fmp/sso-added.component";
import {ConfirmMaintainerComponent} from "./fmp/confirm-maintainer.component";
import {ErrorPageComponent} from "./errorpages/error-page.component";
import {NotFoundPageComponent} from "./errorpages/not-found-page.component";
import {EmailConfirmationComponent} from "./emailconfirmation/email-confirmation.component";
import {AuthenticationGuard} from "./authentication-guard.service";
import {DeleteComponent} from "./updatesweb/delete.component";
import {CreateMntnerPairComponent} from "./updatesweb/createmntnerpair/create-mntner-pair.component";
import {LegalComponent} from "./footer-legal/legal.component";

export const appRoutes: Routes = [
    {path: "myresources/overview", component: ResourcesComponent, canActivate: [AuthenticationGuard]},
    {path: "myresources/detail/:objectType/:objectName", component: ResourceDetailsComponent, canActivate: [AuthenticationGuard]},
    {path: "myresources/detail/:objectType/:objectName/:sponsored", component: ResourceDetailsComponent, canActivate: [AuthenticationGuard]},
    {path: "webupdates/wizard/:source/:objectType", component: DomainObjectWizardComponent, canActivate: [AuthenticationGuard]},
    {path: "webupdates/wizard/:source/:objectType/success", component: DisplayDomainObjectsComponent, canActivate: [AuthenticationGuard]},
    {path: "webupdates/select", component: SelectComponent},
    {path: "webupdates/create/:source/mntner/self", component: CreateSelfMaintainedMaintainerComponent, canActivate: [AuthenticationGuard]},
    {path: "webupdates/create/:source/:personOrRole/self", component: CreateMntnerPairComponent, canActivate: [AuthenticationGuard]},
    {path: "webupdates/create/:source/:objectType", component: CreateModifyComponent, canActivate: [AuthenticationGuard]},
    {path: "webupdates/display/:source/person/:person/mntner/:mntner", component: DisplayMntnerPairComponent},
    {path: "webupdates/display/:source/role/:role/mntner/:mntner", component: DisplayMntnerPairComponent},
    {path: "webupdates/modify/:source/:objectType/:objectName", component: CreateModifyComponent, canActivate: [AuthenticationGuard]},
    {path: "webupdates/display/:source/:objectType/:objectName", component: DisplayComponent},
    {path: "webupdates/delete/:source/:objectType/:objectName", component: DeleteComponent, canActivate: [AuthenticationGuard]},
    {path: "forceDeleteSelect", component: ForceDeleteSelectComponent, canActivate: [AuthenticationGuard]},
    {path: "forceDelete/:source/:objectType/:objectName", component: ForceDeleteComponent, canActivate: [AuthenticationGuard]},
    {path: "lookup", component: LookupSingleObjectComponent},
    {path: "query", component: QueryComponent},
    {path: "syncupdates", component: SyncupdatesComponent},
    {path: "fulltextsearch", component: FullTextSearchComponent},
    {path: "textupdates/create/:source/:objectType", component: TextCreateComponent, canActivate: [AuthenticationGuard]},
    {path: "textupdates/modify/:source/:objectType/:objectName", component: TextModifyComponent, canActivate: [AuthenticationGuard]},
    // syncupdates BETA was removed so redirect to syncupdates
    {path: "textupdates/multiDecision", redirectTo: "syncupdates", pathMatch: "full"},
    {path: "textupdates/multi", redirectTo: "syncupdates", pathMatch: "full"},
    {path: "fmp", component: FindMaintainerComponent},
    {path: "fmp/requireLogin", component: RequireLoginComponent},
    {path: "fmp/mailSent/:email", component: MailSentComponent},
    {path: "fmp/forgotMaintainerPassword", component: ForgotMaintainerPasswordComponent},
    {path: "fmp/change-auth", component: ForgotMaintainerPasswordComponent},
    {path: "fmp/ssoAdded/:mntnerKey/:user", component: SsoAddedComponent},
    {path: "fmp/confirm", component: ConfirmMaintainerComponent},
    {path: "legal", component: LegalComponent},
    {path: "error", component: ErrorPageComponent},
    {path: "not-found", component: NotFoundPageComponent},
    {path: "confirmEmail", component: EmailConfirmationComponent},
    {path: "", redirectTo: "webupdates/select", pathMatch: "full"},
    {path: "**", redirectTo: "webupdates/select"},
];
