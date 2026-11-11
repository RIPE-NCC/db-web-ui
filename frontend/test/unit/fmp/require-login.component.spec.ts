import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, convertToParamMap } from '@angular/router';
import { RequireLoginComponent } from 'src/app/fmp/require-login.component';
import { PropertiesService } from 'src/app/properties.service';

describe('RequireLoginComponent', () => {
    let component: RequireLoginComponent;
    let fixture: ComponentFixture<RequireLoginComponent>;
    let mockLocation: any;
    let queryParamMock: ParamMap;

    beforeEach(() => {
        mockLocation = {
            search: vi.fn().mockName('Location.search'),
            absUrl: vi.fn().mockName('Location.absUrl'),
        };
        queryParamMock = convertToParamMap({});
        TestBed.configureTestingModule({
            imports: [RequireLoginComponent],
            providers: [
                PropertiesService,
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: queryParamMock } } },
                provideHttpClient(withXhr(), withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        fixture = TestBed.createComponent(RequireLoginComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Testing login url', () => {
        it('should extract return url', () => {
            vi.spyOn(queryParamMock, 'has').mockReturnValue(false);
            mockLocation.search.mockReturnValue({});
            mockLocation.absUrl.mockReturnValue('http://server/fmp/requireLogin');
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.origin + '/db-web-ui/fmp/');
            expect(component.loginUrl).toBe(`/db-web-ui/oauth2/authorization/keycloak?next=${expectedUrl}`);
        });

        it('should not extract return url for forgot maintainer page', () => {
            vi.spyOn(queryParamMock, 'has').mockReturnValue(false);
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.origin + '/db-web-ui/fmp/');
            expect(component.loginUrl).toBe(`/db-web-ui/oauth2/authorization/keycloak?next=${expectedUrl}`);
        });

        it('should extract return url for forgot maintainer page', () => {
            vi.spyOn(queryParamMock, 'has').mockReturnValue(true);
            vi.spyOn(queryParamMock, 'get').mockImplementation((p) => {
                switch (p) {
                    case 'mntnerKey':
                        return 'mnt-key';
                    case 'voluntary':
                        return 'true';
                }
            });
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.origin + '/db-web-ui/fmp/change-auth?mntnerKey=mnt-key&voluntary=true');
            expect(component.loginUrl).toBe(`/db-web-ui/oauth2/authorization/keycloak?next=${expectedUrl}`);
        });

        it('should extract return url for forgot maintainer page with voluntary undefined', () => {
            vi.spyOn(queryParamMock, 'has').mockReturnValue(true);
            vi.spyOn(queryParamMock, 'get').mockImplementation((p) => {
                switch (p) {
                    case 'mntnerKey':
                        return 'mnt-key';
                    case 'voluntary':
                        return undefined;
                }
            });

            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.origin + '/db-web-ui/fmp/change-auth?mntnerKey=mnt-key&voluntary=false');
            expect(component.loginUrl).toBe(`/db-web-ui/oauth2/authorization/keycloak?next=${expectedUrl}`);
        });

        it('should extract return url for forgot maintainer page with voluntary false', () => {
            vi.spyOn(queryParamMock, 'has').mockReturnValue(true);
            vi.spyOn(queryParamMock, 'get').mockImplementation((p) => {
                switch (p) {
                    case 'mntnerKey':
                        return 'mnt-key';
                    case 'voluntary':
                        return '';
                }
            });
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.origin + '/db-web-ui/fmp/change-auth?mntnerKey=mnt-key&voluntary=false');
            expect(component.loginUrl).toBe(`/db-web-ui/oauth2/authorization/keycloak?next=${expectedUrl}`);
        });
    });
});
