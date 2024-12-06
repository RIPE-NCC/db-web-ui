import { Routes } from '@angular/router';
import { ApiKeysComponent } from './apikeys/api-keys.component';
import { AuthenticationGuard } from './authentication-guard.service';
import { DisplayDomainObjectsComponent } from './domainobject/display-domain-objects.component';
import { DomainObjectWizardComponent } from './domainobject/domain-object-wizard.component';
import { EmailConfirmationComponent } from './emailconfirmation/email-confirmation.component';
import { ErrorPageComponent } from './errorpages/error-page.component';
import { NotFoundPageComponent } from './errorpages/not-found-page.component';
import { ConfirmMaintainerComponent } from './fmp/confirm-maintainer.component';
import { FindMaintainerComponent } from './fmp/find-maintainer.component';
import { ForgotMaintainerPasswordComponent } from './fmp/forgot-maintainer-password.component';
import { MailSentComponent } from './fmp/mail-sent.component';
import { RequireLoginComponent } from './fmp/require-login.component';
import { SsoAddedComponent } from './fmp/sso-added.component';
import { LegalComponent } from './footer-legal/legal.component';
import { FullTextSearchComponent } from './fulltextsearch/full-text-search.component';
import { ResourceDetailsComponent } from './myresources/resourcedetails/resource-details.component';
import { ResourcesComponent } from './myresources/resources.component';
import { LookupSingleObjectComponent } from './query/lookup-single-object.component';
import { queryFlagResolver } from './query/query-flag.resolver';
import { QueryComponent } from './query/query.component';
import { SyncupdatesComponent } from './syncupdates/syncupdates.component';
import { UnsubscribeConfirmComponent } from './unsubscribe-confirm/unsubscribe-confirm.component';
import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component';
import { TextCreateComponent } from './updatestext/text-create.component';
import { TextModifyComponent } from './updatestext/text-modify.component';
import { CreateModifyComponent } from './updatesweb/create-modify.component';
import { CreateSelfMaintainedMaintainerComponent } from './updatesweb/create-self-maintained-maintainer.component';
import { CreateMntnerPairComponent } from './updatesweb/createmntnerpair/create-mntner-pair.component';
import { DeleteComponent } from './updatesweb/delete.component';
import { DisplayMntnerPairComponent } from './updatesweb/display-mntner-pair.component';
import { DisplayComponent } from './updatesweb/display.component';
import { ForceDeleteComponent } from './updatesweb/forcedelete/force-delete.component';
import { ForceDeleteSelectComponent } from './updatesweb/forcedeleteselect/force-delete-select.component';
import { SelectComponent } from './updatesweb/select.component';

export const appRoutes: Routes = [
    { path: 'myresources/overview', component: ResourcesComponent, canActivate: [AuthenticationGuard] },
    { path: 'myresources/detail/:objectType/:objectName', component: ResourceDetailsComponent, canActivate: [AuthenticationGuard] },
    { path: 'myresources/detail/:objectType/:objectName/:sponsored', component: ResourceDetailsComponent, canActivate: [AuthenticationGuard] },
    { path: 'webupdates/wizard/:source/:objectType', component: DomainObjectWizardComponent, canActivate: [AuthenticationGuard] },
    { path: 'webupdates/wizard/:source/:objectType/success', component: DisplayDomainObjectsComponent, canActivate: [AuthenticationGuard] },
    { path: 'webupdates/select', component: SelectComponent },
    { path: 'webupdates/create/:source/mntner/self', component: CreateSelfMaintainedMaintainerComponent, canActivate: [AuthenticationGuard] },
    { path: 'webupdates/create/:source/:personOrRole/self', component: CreateMntnerPairComponent, canActivate: [AuthenticationGuard] },
    { path: 'webupdates/create/:source/:objectType', component: CreateModifyComponent, canActivate: [AuthenticationGuard] },
    { path: 'webupdates/display/:source/person/:person/mntner/:mntner', component: DisplayMntnerPairComponent },
    { path: 'webupdates/display/:source/role/:role/mntner/:mntner', component: DisplayMntnerPairComponent },
    { path: 'webupdates/modify/:source/:objectType/:objectName', component: CreateModifyComponent, canActivate: [AuthenticationGuard] },
    { path: 'webupdates/display/:source/:objectType/:objectName', component: DisplayComponent },
    { path: 'webupdates/delete/:source/:objectType/:objectName', component: DeleteComponent, canActivate: [AuthenticationGuard] },
    { path: 'forceDeleteSelect', component: ForceDeleteSelectComponent, canActivate: [AuthenticationGuard] },
    { path: 'forceDelete/:source/:objectType/:objectName', component: ForceDeleteComponent, canActivate: [AuthenticationGuard] },
    { path: 'lookup', component: LookupSingleObjectComponent },
    { path: 'query', component: QueryComponent, resolve: { data: queryFlagResolver } },
    { path: 'api-keys', component: ApiKeysComponent, canActivate: [AuthenticationGuard] },
    { path: 'syncupdates', component: SyncupdatesComponent },
    { path: 'fulltextsearch', component: FullTextSearchComponent },
    { path: 'textupdates/create/:source/:objectType', component: TextCreateComponent, canActivate: [AuthenticationGuard] },
    { path: 'textupdates/modify/:source/:objectType/:objectName', component: TextModifyComponent, canActivate: [AuthenticationGuard] },
    // syncupdates BETA was removed so redirect to syncupdates
    { path: 'textupdates/multiDecision', redirectTo: 'syncupdates', pathMatch: 'full' },
    { path: 'textupdates/multi', redirectTo: 'syncupdates', pathMatch: 'full' },
    { path: 'fmp', component: FindMaintainerComponent },
    { path: 'fmp/requireLogin', component: RequireLoginComponent },
    { path: 'fmp/mailSent/:email', component: MailSentComponent },
    { path: 'fmp/forgotMaintainerPassword', component: ForgotMaintainerPasswordComponent },
    { path: 'fmp/change-auth', component: ForgotMaintainerPasswordComponent },
    { path: 'fmp/ssoAdded/:mntnerKey/:user', component: SsoAddedComponent },
    { path: 'fmp/confirm', component: ConfirmMaintainerComponent },
    { path: 'legal', component: LegalComponent },
    { path: 'error', component: ErrorPageComponent },
    { path: 'not-found', component: NotFoundPageComponent },
    { path: 'confirmEmail', component: EmailConfirmationComponent },
    { path: 'unsubscribe/:messageId', component: UnsubscribeComponent },
    { path: 'unsubscribe-confirm/:messageId', component: UnsubscribeConfirmComponent },
    { path: '', redirectTo: 'query', pathMatch: 'full' },
    { path: '**', redirectTo: 'query' },
];
