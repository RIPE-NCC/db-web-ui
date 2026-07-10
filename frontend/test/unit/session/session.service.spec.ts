import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { PropertiesService } from '../../../src/app/properties.service';
import { SessionService } from '../../../src/app/sessioninfo/session.service';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';

describe('SessionService', () => {
    let sessionService: SessionService;
    let httpMock: HttpTestingController;
    let userInfoService: any;
    beforeEach(() => {
        userInfoService = jasmine.createSpyObj('UserInfoService', ['pingUserInfo', 'removeUserInfo']);
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: PropertiesService, useValue: { SESSION_TTL: 20, USER_LOGGED_INTERVAL: 20 } },
                SessionService,
                { provide: UserInfoService, useValue: userInfoService },
                provideHttpClient(withXhr(), withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        sessionService = TestBed.inject(SessionService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    beforeEach(() => {
        userInfoService.pingUserInfo.and.returnValue(EMPTY);
    });

    it('should be created', () => {
        expect(sessionService).toBeTruthy();
    });

    it('should call pingUserInfo when checking the session', fakeAsync(() => {
        sessionService.startCheckingSession();
        tick(100);
        expect(userInfoService.pingUserInfo).toHaveBeenCalled();
        discardPeriodicTasks(); //remove ticks
    }));

    it('should rise alert when authentication fails', fakeAsync(() => {
        sessionService.checkingSession = true;
        sessionService.authenticationFailure();
        tick(100);
        expect(sessionService.checkingSession).toBe(false);
        discardPeriodicTasks(); //remove ticks
    }));
});
