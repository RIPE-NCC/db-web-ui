import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {APP_INITIALIZER, NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {UpgradeModule} from "@angular/upgrade/static";
import {CookieService} from "ngx-cookie-service";
import {NgSelectModule} from "@ng-select/ng-select";
import {LoadingBarHttpClientModule} from "@ngx-loading-bar/http-client";
import {AppComponent} from "./app.component";
import {SyncupdatesComponent} from "./syncupdates/syncupdates.component";
import {SyncupdatesService} from "./syncupdates/syncupdates.service";
import {UpdatesModule} from "./updates/update.module";
import {SharedModule} from "./shared/shared.module";
import {EmailConfirmationComponent} from "./emailconfirmation/email-confirmation.component";
import {EmailConfirmationService} from "./emailconfirmation/email-confirmation.service";
import {MetaDataCleanerInterceptor} from "./inerceptor/meta-data-cleaner.interceptor";
import {HeaderInterceptor} from "./inerceptor/header.interceptor";
import {FmpModule} from "./fmp/fmp.module";
import {FullTextSearchModule} from "./fulltextsearch/full-text-search.module";
import {QueryModule} from "./query/query.module";
import {WhoisObjectModule} from "./whois-object/whois-object.module";
import {MyResourcesModule} from "./myresources/my-resources.module";
import {OrgDropDownComponent} from "./dropdown/org-drop-down.component";
import {OrgDropDownSharedService} from "./dropdown/org-drop-down-shared.service";
import {DomainObjectModule} from "./domainobject/domain-object.module";
import {LeftHandMenuComponent} from "./menu/left-hand-menu.component";
import {UserInfoModule} from "./userinfo/user-info.module";
import {UpdatesTextModule} from "./updatestext/update-text.module";
import {appRoutes} from "./routes";
import {ErrorPageComponent} from "./errorpages/error-page.component";
import {NotFoundPageComponent} from "./errorpages/not-found-page.component";
import {ErrorInterceptor} from "./inerceptor/error.interceptor";
import {AuthenticationGuard} from "./authentication-guard.service";
import {PropertiesService} from "./properties.service";

@NgModule({
    imports: [
        BrowserModule,
        NgSelectModule,
        FormsModule,
        UpgradeModule,
        HttpClientModule,
        SharedModule,
        UpdatesModule,
        UpdatesTextModule,
        FmpModule,
        FullTextSearchModule,
        QueryModule,
        WhoisObjectModule,
        LoadingBarHttpClientModule,
        MyResourcesModule,
        DomainObjectModule,
        UserInfoModule,
        RouterModule.forRoot(appRoutes, {useHash: true})
    ],
    declarations: [
        AppComponent,
        SyncupdatesComponent,
        EmailConfirmationComponent,
        OrgDropDownComponent,
        LeftHandMenuComponent,
        ErrorPageComponent,
        NotFoundPageComponent
    ],
    providers: [
        CookieService,
        AuthenticationGuard,
        SyncupdatesService,
        EmailConfirmationService,
        OrgDropDownSharedService,
        PropertiesService,
        {provide: APP_INITIALIZER, useFactory: (propertiesService: PropertiesService) => () => propertiesService.load(), deps: [PropertiesService], multi: true },
        {provide: HTTP_INTERCEPTORS, useClass: MetaDataCleanerInterceptor, multi: true },
        {provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
        {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    bootstrap: [
        AppComponent,
    ],
    entryComponents: [
        SyncupdatesComponent,
        EmailConfirmationComponent,
        OrgDropDownComponent,
        LeftHandMenuComponent
    ],
})
export class AppModule {
}
