import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLineModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { CookieService } from 'ngx-cookie-service';
import { ApiKeysModule } from './apikeys/api-keys.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationGuard } from './authentication-guard.service';
import { IeBannerComponent } from './banner/ie-banner.component';
import { DomainObjectModule } from './domainobject/domain-object.module';
import { EmailConfirmationComponent } from './emailconfirmation/email-confirmation.component';
import { EmailConfirmationService } from './emailconfirmation/email-confirmation.service';
import { ErrorPageComponent } from './errorpages/error-page.component';
import { NotFoundPageComponent } from './errorpages/not-found-page.component';
import { FeedbackSupportDialogComponent } from './feedbacksupport/feedback-support-dialog.component';
import { FmpModule } from './fmp/fmp.module';
import { LegalComponent } from './footer-legal/legal.component';
import { FullTextSearchModule } from './fulltextsearch/full-text-search.module';
import { ErrorInterceptor } from './interceptor/error.interceptor';
import { HeaderInterceptor } from './interceptor/header.interceptor';
import { MetaDataCleanerInterceptor } from './interceptor/meta-data-cleaner.interceptor';
import { CustomDateAdapterModule } from './material-custom/custom-date-adapter';
import { MenuComponent } from './menu/menu.component';
import { MenuService } from './menu/menu.service';
import { MyResourcesModule } from './myresources/my-resources.module';
import { PropertiesService } from './properties.service';
import { QueryModule } from './query/query.module';
import { SessionInfoModule } from './sessioninfo/session-info.module';
import { SessionInfoService } from './sessioninfo/session-info.service';
import { SessionInterceptor } from './sessioninfo/session.interceptor';
import { SharedModule } from './shared/shared.module';
import { SyncupdatesComponent } from './syncupdates/syncupdates.component';
import { SyncupdatesService } from './syncupdates/syncupdates.service';
import { UnsubscribeConfirmComponent } from './unsubscribe-confirm/unsubscribe-confirm.component';
import { UnsubscribeComponent } from './unsubscribe/unsubscribe.component';
import { UnsubscribeService } from './unsubscribe/unsubscribe.service';
import { UpdatesTextModule } from './updatestext/update-text.module';
import { UpdatesWebModule } from './updatesweb/updateweb.module';
import { UserInfoModule } from './userinfo/user-info.module';
import { WhoisObjectModule } from './whois-object/whois-object.module';

@NgModule({
    declarations: [
        AppComponent,
        SyncupdatesComponent,
        EmailConfirmationComponent,
        UnsubscribeComponent,
        UnsubscribeConfirmComponent,
        IeBannerComponent,
        MenuComponent,
        ErrorPageComponent,
        NotFoundPageComponent,
        LegalComponent,
        FeedbackSupportDialogComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        FormsModule,
        SharedModule,
        UpdatesWebModule,
        UpdatesTextModule,
        FmpModule,
        FullTextSearchModule,
        QueryModule,
        WhoisObjectModule,
        LoadingBarHttpClientModule,
        MyResourcesModule,
        DomainObjectModule,
        UserInfoModule,
        AppRoutingModule,
        NoopAnimationsModule,
        MatDialogModule,
        MatListModule,
        MatLineModule,
        SessionInfoModule,
        ApiKeysModule,
        CustomDateAdapterModule,
    ],
    providers: [
        CookieService,
        AuthenticationGuard,
        SyncupdatesService,
        EmailConfirmationService,
        UnsubscribeService,
        PropertiesService,
        MenuService,
        SessionInfoService,
        {
            provide: APP_INITIALIZER,
            useFactory: (propertiesService: PropertiesService) => () => propertiesService.load(),
            deps: [PropertiesService],
            multi: true,
        },
        { provide: HTTP_INTERCEPTORS, useClass: MetaDataCleanerInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: SessionInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
    ],
})
export class AppModule {}
