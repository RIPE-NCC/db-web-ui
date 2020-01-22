import { BrowserModule } from "@angular/platform-browser";
import {APP_INITIALIZER, NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {CookieService} from "ngx-cookie-service";
import {NgSelectModule} from "@ng-select/ng-select";
import {NgOptionHighlightModule} from "@ng-select/ng-option-highlight";
import {LoadingBarHttpClientModule} from "@ngx-loading-bar/http-client";

import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {NotFoundPageComponent} from "./errorpages/not-found-page.component";
import {ErrorPageComponent} from "./errorpages/error-page.component";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {SharedModule} from "./shared/shared.module";
import {UpdatesModule} from "./updates/update.module";
import {UpdatesTextModule} from "./updatestext/update-text.module";
import {FmpModule} from "./fmp/fmp.module";
import {FullTextSearchModule} from "./fulltextsearch/full-text-search.module";
import {QueryModule} from "./query/query.module";
import {LeftHandMenuComponent} from "./menu/left-hand-menu.component";
import {WhoisObjectModule} from "./whois-object/whois-object.module";
import {OrgDropDownComponent} from "./dropdown/org-drop-down.component";
import {MyResourcesModule} from "./myresources/my-resources.module";
import {DomainObjectModule} from "./domainobject/domain-object.module";
import {UserInfoModule} from "./userinfo/user-info.module";
import {SyncupdatesService} from "./syncupdates/syncupdates.service";
import {EmailConfirmationService} from "./emailconfirmation/email-confirmation.service";
import {OrgDropDownSharedService} from "./dropdown/org-drop-down-shared.service";
import {MetaDataCleanerInterceptor} from "./interceptor/meta-data-cleaner.interceptor";
import {HeaderInterceptor} from "./interceptor/header.interceptor";
import {SyncupdatesComponent} from "./syncupdates/syncupdates.component";
import {EmailConfirmationComponent} from "./emailconfirmation/email-confirmation.component";
import {ErrorInterceptor} from "./interceptor/error.interceptor";
import {PropertiesService} from "./properties.service";
import {AuthenticationGuard} from "./authentication-guard.service";
import {BannerComponent} from "./banner/banner.component";
import {SurveyBannerComponent} from "./banner/survey-banner.component";

@NgModule({
  declarations: [
    AppComponent,
    SyncupdatesComponent,
    EmailConfirmationComponent,
    BannerComponent,
    SurveyBannerComponent,
    OrgDropDownComponent,
    LeftHandMenuComponent,
    ErrorPageComponent,
    NotFoundPageComponent
  ],
  imports: [
    BrowserModule,
    NgSelectModule,
    NgOptionHighlightModule,
    FormsModule,
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
    AppRoutingModule
  ],
  providers: [
    CookieService,
    AuthenticationGuard,
    SyncupdatesService,
    EmailConfirmationService,
    OrgDropDownSharedService,
    PropertiesService,
    {provide: APP_INITIALIZER, useFactory: (propertiesService: PropertiesService) => () => propertiesService.load(), deps: [PropertiesService], multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: MetaDataCleanerInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
