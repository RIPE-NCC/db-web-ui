import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { MainContainerComponent } from 'src/app/main-container/main-container.component';
import { BannerComponent } from '../../../src/app/banner/banner.component';
import { PropertiesService } from '../../../src/app/properties.service';
import { LabelPipe } from '../../../src/app/shared/label.pipe';
import { ReleaseNotificationService } from '../../../src/app/shared/release-notification.service';

describe('MainContainerComponent', () => {
    let component: MainContainerComponent;
    let fixture: ComponentFixture<MainContainerComponent>;
    let routerMock: any;
    let releaseNotificationService: ReleaseNotificationService;

    beforeEach(waitForAsync(() => {
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        releaseNotificationService = jasmine.createSpyObj('ReleaseNotificationService', ['startPolling']);
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [CommonModule, RouterModule, BannerComponent, LabelPipe],
            providers: [
                {
                    provide: PropertiesService,
                    useValue: {
                        RIPE_APP_WEBCOMPONENTS_ENV: 'pre',
                        BREAKPOINTS_MOBILE_VIEW: 1025,
                        isTestEnv: () => false,
                        isTrainingEnv: () => false,
                        isRcEnv: () => false,
                        isProdEnv: () => true,
                    },
                },
                {
                    provide: Router,
                    useValue: {
                        navigate: () => {},
                        navigateByUrl: () => {},
                        url: '/not-query',
                        events: of(),
                    },
                },
                {
                    provide: ReleaseNotificationService,
                    useValue: releaseNotificationService,
                },
                provideHttpClient(withXhr(), withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainContainerComponent);
        component = fixture.componentInstance;
    });

    it('should start checking if new release is available', () => {
        fixture.detectChanges();
        expect(releaseNotificationService.startPolling).toHaveBeenCalled();
    });
});
