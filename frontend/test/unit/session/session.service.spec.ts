import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PropertiesService } from '../../../src/app/properties.service';
import { SessionService } from '../../../src/app/sessioninfo/session.service';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';

describe('SessionService', () => {
    let sessionService: SessionService;
    let httpMock: HttpTestingController;
    let userInfoService: any;
    beforeEach(() => {
        userInfoService = jasmine.createSpyObj('UserInfoService', ['removeUserInfo']);
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

    it('should be created', () => {
        expect(sessionService).toBeTruthy();
    });
});
