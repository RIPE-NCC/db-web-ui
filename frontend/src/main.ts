import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

// Material & other imports that were previously in AppModule
import { FormsModule } from '@angular/forms';
import { MatLineModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Components (standalone ones)
import { AppComponent } from './app/app.component';
// import { BannerComponent } from './app/components/banner/banner.component';
// import { SyncupdatesComponent } from './app/components/syncupdates/syncupdates.component';
// import { EmailConfirmationComponent } from './app/components/email-confirmation/email-confirmation.component';
// import { UnsubscribeComponent } from './app/components/unsubscribe/unsubscribe.component';
// import { UnsubscribeConfirmComponent } from './app/components/unsubscribe-confirm/unsubscribe-confirm.component';
// import { IeBannerComponent } from './app/components/ie-banner/ie-banner.component';
// import { MenuComponent } from './app/components/menu/menu.component';
// import { ErrorPageComponent } from './app/pages/error-page/error-page.component';
// import { NotFoundPageComponent } from './app/pages/not-found-page/not-found-page.component';
// import { LegalComponent } from './app/pages/legal/legal.component';
// import { FeedbackSupportDialogComponent } from './app/dialogs/feedback-support-dialog/feedback-support-dialog.component';
// import { LabelPipe } from './app/pipes/label.pipe';

// Routing
import { appRoutes } from './app/routes';

// Services
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationGuard } from './app/authentication-guard.service';
import { EmailConfirmationService } from './app/emailconfirmation/email-confirmation.service';
import { MenuService } from './app/menu/menu.service';
import { PropertiesService } from './app/properties.service';
import { SessionInfoService } from './app/sessioninfo/session-info.service';
import { SyncupdatesService } from './app/syncupdates/syncupdates.service';
import { UnsubscribeService } from './app/unsubscribe/unsubscribe.service';

// HTTP Interceptors
import { ErrorInterceptor } from './app/interceptor/error.interceptor';
import { HeaderInterceptor } from './app/interceptor/header.interceptor';
import { MetaDataCleanerInterceptor } from './app/interceptor/meta-data-cleaner.interceptor';
import { SessionInterceptor } from './app/sessioninfo/session.interceptor';

import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

bootstrapApplication(AppComponent, {
    providers: [
        // Routing
        provideRouter(appRoutes),

        // HTTP with interceptors
        provideHttpClient(withInterceptors([MetaDataCleanerInterceptor, HeaderInterceptor, ErrorInterceptor, SessionInterceptor])),

        // Animations
        provideAnimations(),
        provideAnimationsAsync(),

        // Bring in modules that aren't standalone yet
        importProvidersFrom(BrowserModule, FormsModule, MatDialogModule, MatListModule, MatLineModule, LoadingBarHttpClientModule, BrowserAnimationsModule),

        // Core services
        CookieService,
        AuthenticationGuard,
        SyncupdatesService,
        EmailConfirmationService,
        UnsubscribeService,
        PropertiesService,
        MenuService,
        SessionInfoService,

        provideNativeDateAdapter(),

        provideAppInitializer(() => {
            const propertiesService = inject(PropertiesService);
            return propertiesService.load();
        }),
    ],
}).catch((err) => console.error(err));
