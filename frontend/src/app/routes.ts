import { Routes } from '@angular/router';
import { AuthenticationGuard } from './authentication-guard.service';
import { queryFlagResolver } from './query/query-flag.resolver';

export const appRoutes: Routes = [
    {
        path: 'myresources/overview',
        loadComponent: () => import('./myresources/resources.component').then((m) => m.ResourcesComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'myresources/detail/:objectType/:objectName',
        loadComponent: () => import('./myresources/resourcedetails/resource-details.component').then((m) => m.ResourceDetailsComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'myresources/detail/:objectType/:objectName/:sponsored',
        loadComponent: () => import('./myresources/resourcedetails/resource-details.component').then((m) => m.ResourceDetailsComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'webupdates/wizard/:source/:objectType',
        loadComponent: () => import('./domainobject/domain-object-wizard.component').then((m) => m.DomainObjectWizardComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'webupdates/wizard/:source/:objectType/success',
        loadComponent: () => import('./domainobject/display-domain-objects.component').then((m) => m.DisplayDomainObjectsComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'webupdates/select',
        loadComponent: () => import('./updatesweb/select.component').then((m) => m.SelectComponent),
    },
    {
        path: 'webupdates/create/:source/mntner/self',
        loadComponent: () => import('./updatesweb/create-self-maintained-maintainer.component').then((m) => m.CreateSelfMaintainedMaintainerComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'webupdates/create/:source/:personOrRole/self',
        loadComponent: () => import('./updatesweb/createmntnerpair/create-mntner-pair.component').then((m) => m.CreateMntnerPairComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'webupdates/create/:source/:objectType',
        loadComponent: () => import('./updatesweb/create-modify.component').then((m) => m.CreateModifyComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'webupdates/display/:source/person/:person/mntner/:mntner',
        loadComponent: () => import('./updatesweb/display-mntner-pair.component').then((m) => m.DisplayMntnerPairComponent),
    },
    {
        path: 'webupdates/display/:source/role/:role/mntner/:mntner',
        loadComponent: () => import('./updatesweb/display-mntner-pair.component').then((m) => m.DisplayMntnerPairComponent),
    },
    {
        path: 'webupdates/modify/:source/:objectType/:objectName',
        loadComponent: () => import('./updatesweb/create-modify.component').then((m) => m.CreateModifyComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'webupdates/display/:source/:objectType/:objectName',
        loadComponent: () => import('./updatesweb/display.component').then((m) => m.DisplayComponent),
    },
    {
        path: 'webupdates/delete/:source/:objectType/:objectName',
        loadComponent: () => import('./updatesweb/delete.component').then((m) => m.DeleteComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'forceDeleteSelect',
        loadComponent: () => import('./updatesweb/forcedeleteselect/force-delete-select.component').then((m) => m.ForceDeleteSelectComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'forceDelete/:source/:objectType/:objectName',
        loadComponent: () => import('./updatesweb/forcedelete/force-delete.component').then((m) => m.ForceDeleteComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'lookup',
        loadComponent: () => import('./query/lookup-single-object.component').then((m) => m.LookupSingleObjectComponent),
    },
    {
        path: 'query',
        loadComponent: () => import('./query/query.component').then((m) => m.QueryComponent),
        resolve: { data: queryFlagResolver },
    },
    {
        path: 'api-keys',
        loadComponent: () => import('./apikeys/api-keys.component').then((m) => m.ApiKeysComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'syncupdates',
        loadComponent: () => import('./syncupdates/syncupdates.component').then((m) => m.SyncupdatesComponent),
    },
    {
        path: 'fulltextsearch',
        loadComponent: () => import('./fulltextsearch/full-text-search.component').then((m) => m.FullTextSearchComponent),
    },
    {
        path: 'textupdates/create/:source/:objectType',
        loadComponent: () => import('./updatestext/text-create.component').then((m) => m.TextCreateComponent),
        canActivate: [AuthenticationGuard],
    },
    {
        path: 'textupdates/modify/:source/:objectType/:objectName',
        loadComponent: () => import('./updatestext/text-modify.component').then((m) => m.TextModifyComponent),
        canActivate: [AuthenticationGuard],
    },

    // syncupdates BETA was removed so redirect to syncupdates
    { path: 'textupdates/multiDecision', redirectTo: 'syncupdates', pathMatch: 'full' },
    { path: 'textupdates/multi', redirectTo: 'syncupdates', pathMatch: 'full' },
    {
        path: 'fmp',
        loadComponent: () => import('./fmp/find-maintainer.component').then((m) => m.FindMaintainerComponent),
    },
    {
        path: 'fmp/requireLogin',
        loadComponent: () => import('./fmp/require-login.component').then((m) => m.RequireLoginComponent),
    },
    {
        path: 'fmp/mailSent/:email',
        loadComponent: () => import('./fmp/mail-sent.component').then((m) => m.MailSentComponent),
    },
    {
        path: 'fmp/forgotMaintainerPassword',
        loadComponent: () => import('./fmp/forgot-maintainer-password.component').then((m) => m.ForgotMaintainerPasswordComponent),
    },
    {
        path: 'fmp/change-auth',
        loadComponent: () => import('./fmp/forgot-maintainer-password.component').then((m) => m.ForgotMaintainerPasswordComponent),
    },
    {
        path: 'fmp/ssoAdded/:mntnerKey/:user',
        loadComponent: () => import('./fmp/sso-added.component').then((m) => m.SsoAddedComponent),
    },
    {
        path: 'fmp/confirm',
        loadComponent: () => import('./fmp/confirm-maintainer.component').then((m) => m.ConfirmMaintainerComponent),
    },
    {
        path: 'legal',
        loadComponent: () => import('./footer-legal/legal.component').then((m) => m.LegalComponent),
    },
    {
        path: 'error',
        loadComponent: () => import('./errorpages/error-page.component').then((m) => m.ErrorPageComponent),
    },
    {
        path: 'not-found',
        loadComponent: () => import('./errorpages/not-found-page.component').then((m) => m.NotFoundPageComponent),
    },
    {
        path: 'confirmEmail',
        loadComponent: () => import('./emailconfirmation/email-confirmation.component').then((m) => m.EmailConfirmationComponent),
    },
    {
        path: 'unsubscribe/:messageId',
        loadComponent: () => import('./unsubscribe/unsubscribe.component').then((m) => m.UnsubscribeComponent),
    },
    {
        path: 'unsubscribe-confirm/:messageId',
        loadComponent: () => import('./unsubscribe-confirm/unsubscribe-confirm.component').then((m) => m.UnsubscribeConfirmComponent),
    },
    { path: '', redirectTo: 'query', pathMatch: 'full' },
    { path: '**', redirectTo: 'query' },
];
