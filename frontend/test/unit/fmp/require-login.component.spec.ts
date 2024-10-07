import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, convertToParamMap } from '@angular/router';
import { RequireLoginComponent } from '../../../src/app/fmp/require-login.component';
import { PropertiesService } from '../../../src/app/properties.service';

describe('RequireLoginComponent', () => {
    let component: RequireLoginComponent;
    let fixture: ComponentFixture<RequireLoginComponent>;
    let mockLocation: any;
    let queryParamMock: ParamMap;

    beforeEach(() => {
        mockLocation = jasmine.createSpyObj('Location', ['search', 'absUrl']);
        queryParamMock = convertToParamMap({});
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [RequireLoginComponent],
            providers: [
                { provide: PropertiesService, useValue: { LOGIN_URL: 'https://access.prepdev.ripe.net/' } },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: queryParamMock } } },
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
            spyOn(queryParamMock, 'has').and.returnValue(false);
            mockLocation.search.and.returnValue({});
            mockLocation.absUrl.and.returnValue('http://server/fmp/requireLogin');
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.origin + '/db-web-ui/fmp/');
            expect(component.loginUrl).toBe(`https://access.prepdev.ripe.net/?originalUrl=${expectedUrl}`);
        });

        it('should not extract return url for forgot maintainer page', () => {
            spyOn(queryParamMock, 'has').and.returnValue(false);
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.origin + '/db-web-ui/fmp/');
            expect(component.loginUrl).toBe(`https://access.prepdev.ripe.net/?originalUrl=${expectedUrl}`);
        });

        it('should extract return url for forgot maintainer page', () => {
            spyOn(queryParamMock, 'has').and.returnValue(true);
            spyOn(queryParamMock, 'get').and.callFake((p) => {
                switch (p) {
                    case 'mntnerKey':
                        return 'mnt-key';
                    case 'voluntary':
                        return 'true';
                }
            });
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.origin + '/db-web-ui/fmp/change-auth?mntnerKey=mnt-key&voluntary=true');
            expect(component.loginUrl).toBe(`https://access.prepdev.ripe.net/?originalUrl=${expectedUrl}`);
        });

        it('should extract return url for forgot maintainer page with voluntary undefined', () => {
            spyOn(queryParamMock, 'has').and.returnValue(true);
            spyOn(queryParamMock, 'get').and.callFake((p) => {
                switch (p) {
                    case 'mntnerKey':
                        return 'mnt-key';
                    case 'voluntary':
                        return undefined;
                }
            });

            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.origin + '/db-web-ui/fmp/change-auth?mntnerKey=mnt-key&voluntary=false');
            expect(component.loginUrl).toBe(`https://access.prepdev.ripe.net/?originalUrl=${expectedUrl}`);
        });

        it('should extract return url for forgot maintainer page with voluntary false', () => {
            spyOn(queryParamMock, 'has').and.returnValue(true);
            spyOn(queryParamMock, 'get').and.callFake((p) => {
                switch (p) {
                    case 'mntnerKey':
                        return 'mnt-key';
                    case 'voluntary':
                        return '';
                }
            });
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.origin + '/db-web-ui/fmp/change-auth?mntnerKey=mnt-key&voluntary=false');
            expect(component.loginUrl).toBe(`https://access.prepdev.ripe.net/?originalUrl=${expectedUrl}`);
        });
    });
});
