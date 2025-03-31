import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { PropertiesService } from '../../../src/app/properties.service';
import { AlertsService } from '../../../src/app/shared/alert/alerts.service';
import { ReleaseNotificationService } from '../../../src/app/shared/release-notification.service';

describe('ReleaseNotificationService', () => {
    let releaseNotificationService: ReleaseNotificationService;
    let httpMock: HttpTestingController;
    const alertServiceSpy = jasmine.createSpyObj('AlertsService', ['addGlobalWarning']);

    const pollInterval = 5_000;
    beforeEach(() => {
        alertServiceSpy.addGlobalWarning.calls.reset();
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                ReleaseNotificationService,
                {
                    provide: PropertiesService,
                    useValue: { DB_WEB_UI_BUILD_TIME: '0', RELEASE_NOTIFICATION_POLLING: pollInterval },
                },
                { provide: AlertsService, useValue: alertServiceSpy },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        releaseNotificationService = TestBed.inject(ReleaseNotificationService);
    });

    afterEach(() => {
        httpMock.verify();
    });
    it('should start polling', fakeAsync(() => {
        releaseNotificationService.startPolling();
        tick(pollInterval);
        httpMock.expectOne({ method: 'GET', url: 'app.constants.json' });

        discardPeriodicTasks();
    }));

    it('should show banner', fakeAsync(() => {
        releaseNotificationService.startPolling();
        tick(pollInterval);
        const req = httpMock.expectOne({ method: 'GET', url: 'app.constants.json' });
        req.flush({ DB_WEB_UI_BUILD_TIME: '1' });

        expect(alertServiceSpy.addGlobalWarning).toHaveBeenCalledWith(
            'There is a new release available. Click reload to start using it.',
            document.location.href,
            'RELOAD',
        );

        discardPeriodicTasks();
    }));

    it('should not show banner if the build is the same', fakeAsync(() => {
        releaseNotificationService.startPolling();
        tick(pollInterval);
        const req = httpMock.expectOne({ method: 'GET', url: 'app.constants.json' });
        req.flush({ DB_WEB_UI_BUILD_TIME: '0' });

        expect(alertServiceSpy.addGlobalWarning).not.toHaveBeenCalled();

        discardPeriodicTasks();
    }));

    it('should trigger banner only 1 time', fakeAsync(() => {
        releaseNotificationService.startPolling();
        tick(pollInterval);
        httpMock.expectOne({ method: 'GET', url: 'app.constants.json' }).flush({ DB_WEB_UI_BUILD_TIME: '1' });

        expect(alertServiceSpy.addGlobalWarning).toHaveBeenCalledWith(
            'There is a new release available. Click reload to start using it.',
            document.location.href,
            'RELOAD',
        );

        alertServiceSpy.addGlobalWarning.calls.reset();

        tick(pollInterval);
        httpMock.expectOne({ method: 'GET', url: 'app.constants.json' }).flush({ DB_WEB_UI_BUILD_TIME: '2' });

        expect(alertServiceSpy.addGlobalWarning).not.toHaveBeenCalled();
        discardPeriodicTasks();
    }));
});
