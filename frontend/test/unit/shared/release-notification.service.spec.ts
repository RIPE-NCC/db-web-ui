import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PropertiesService } from 'src/app/properties.service';
import { AlertsService } from 'src/app/shared/alert/alerts.service';
import { ReleaseNotificationService } from 'src/app/shared/release-notification.service';

describe('ReleaseNotificationService', () => {
    let releaseNotificationService: ReleaseNotificationService;
    let httpMock: HttpTestingController;
    const alertServiceSpy = {
        addGlobalWarning: vi.fn().mockName('AlertsService.addGlobalWarning'),
    };

    const pollInterval = 5000;
    beforeEach(() => {
        alertServiceSpy.addGlobalWarning.mockClear();
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                ReleaseNotificationService,
                {
                    provide: PropertiesService,
                    useValue: { DB_WEB_UI_BUILD_TIME: '0', RELEASE_NOTIFICATION_POLLING: pollInterval },
                },
                { provide: AlertsService, useValue: alertServiceSpy },
                provideHttpClient(withXhr(), withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        releaseNotificationService = TestBed.inject(ReleaseNotificationService);
    });

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        httpMock.verify();
    });

    it('should start polling', () => {
        releaseNotificationService.startPolling();
        vi.advanceTimersByTime(pollInterval);
        httpMock.expectOne({ method: 'GET', url: 'app.constants.json' });
    });

    it('should show banner', () => {
        releaseNotificationService.startPolling();
        vi.advanceTimersByTime(pollInterval);
        const req = httpMock.expectOne({ method: 'GET', url: 'app.constants.json' });
        req.flush({ DB_WEB_UI_BUILD_TIME: '1' });

        expect(alertServiceSpy.addGlobalWarning).toHaveBeenCalledWith('There is a new release available. Click reload to start using it.', '/', 'RELOAD');
    });

    it('should not show banner if the build is the same', () => {
        releaseNotificationService.startPolling();
        vi.advanceTimersByTime(pollInterval);
        const req = httpMock.expectOne({ method: 'GET', url: 'app.constants.json' });
        req.flush({ DB_WEB_UI_BUILD_TIME: '0' });

        expect(alertServiceSpy.addGlobalWarning).not.toHaveBeenCalled();
    });

    it('should trigger banner only 1 time', () => {
        releaseNotificationService.startPolling();
        vi.advanceTimersByTime(pollInterval);
        httpMock.expectOne({ method: 'GET', url: 'app.constants.json' }).flush({ DB_WEB_UI_BUILD_TIME: '1' });

        expect(alertServiceSpy.addGlobalWarning).toHaveBeenCalledWith('There is a new release available. Click reload to start using it.', '/', 'RELOAD');

        alertServiceSpy.addGlobalWarning.mockClear();

        vi.advanceTimersByTime(pollInterval);
        httpMock.expectOne({ method: 'GET', url: 'app.constants.json' }).flush({ DB_WEB_UI_BUILD_TIME: '2' });

        expect(alertServiceSpy.addGlobalWarning).not.toHaveBeenCalled();
    });
});
