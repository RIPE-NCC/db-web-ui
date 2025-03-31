import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { PropertiesService } from '../../../src/app/properties.service';
import { SessionInfoService } from '../../../src/app/sessioninfo/session-info.service';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';

describe('SessionInfoService', () => {
    let sessionInfoService: SessionInfoService;
    let httpMock: HttpTestingController;
    let userInfoService: any;
    beforeEach(() => {
        userInfoService = jasmine.createSpyObj('UserInfoService', ['pingUserInfo', 'removeUserInfo']);
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: PropertiesService, useValue: { SESSION_TTL: 20, USER_LOGGED_INTERVAL: 20 } },
                SessionInfoService,
                { provide: UserInfoService, useValue: userInfoService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        sessionInfoService = TestBed.inject(SessionInfoService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    beforeEach(() => {
        userInfoService.pingUserInfo.and.returnValue(EMPTY);
    });

    it('should be created', () => {
        expect(sessionInfoService).toBeTruthy();
    });

    it('should call pingUserInfo when checking the session', fakeAsync(() => {
        sessionInfoService.startCheckingSession();
        tick(100);
        expect(userInfoService.pingUserInfo).toHaveBeenCalled();
        discardPeriodicTasks(); //remove ticks
    }));

    it('should rise alert when authentication fails', fakeAsync(() => {
        sessionInfoService.checkingSession = true;
        sessionInfoService.authenticationFailure();
        tick(100);
        expect(sessionInfoService.checkingSession).toBe(false);
        discardPeriodicTasks(); //remove ticks
    }));
});
