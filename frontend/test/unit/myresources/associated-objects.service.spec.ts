import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppModule } from '../../../src/app/app.module';
import { AssociatedObjectsService } from '../../../src/app/myresources/associatedobjects/associated-objects.service';
import { MyResourcesModule } from '../../../src/app/myresources/my-resources.module';

describe('AssociatedObjectsService', () => {
    let associatedObjectsService: AssociatedObjectsService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MyResourcesModule, AppModule],
            providers: [AssociatedObjectsService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        httpMock = TestBed.inject(HttpTestingController);
        associatedObjectsService = TestBed.inject(AssociatedObjectsService);
    });

    describe('for route', () => {
        it('should call API for associated route objects of inetnum', (done) => {
            associatedObjectsService.getAssociatedObjects('route', '185.162.88.0%20-%20185.162.91.255', 'inetnum', 0, '').subscribe((res: any) => {
                expect(res).toEqual({ resp: 'lol' });
                done();
            });
            const req = httpMock.expectOne({
                method: 'GET',
                url: 'api/whois-internal/api/resources/inetnum/185.162.88.0%20-%20185.162.91.255/associated-route-objects.json?filter=&page=0',
            });
            expect(req.request.method).toBe('GET');
            req.flush({ resp: 'lol' });
        });

        it('should call API for associated route objects of autnum', (done) => {
            associatedObjectsService.getAssociatedObjects('route', 'AS44569', 'aut-num', 0, '').subscribe((res: any) => {
                expect(res).toEqual({ resp: 'lol' });
                done();
            });
            const req = httpMock.expectOne({
                method: 'GET',
                url: 'api/whois-internal/api/resources/aut-num/AS44569/associated-route-objects.json?filter=&page=0',
            });
            expect(req.request.method).toBe('GET');
            req.flush({ resp: 'lol' });
        });
    });

    describe('for domain', () => {
        it('should call API for associated domain objects of inet6num', (done) => {
            associatedObjectsService.getAssociatedObjects('domain', '2001:67c:2334::/48', 'inet6num', 0, '').subscribe((res: any) => {
                expect(res).toEqual({ resp: 'lol' });
                done();
            });
            const req = httpMock.expectOne({
                method: 'GET',
                url: 'api/whois-internal/api/resources/inet6num/2001:67c:2334::/48/associated-domain-objects.json?filter=&page=0',
            });
            expect(req.request.method).toBe('GET');
            req.flush({ resp: 'lol' });
        });

        it('should fail calling API for associated domain objects of aut-num', () => {
            associatedObjectsService.getAssociatedObjects('domain', 'AS44569', 'aut-num', 0, '').subscribe({
                next: () => {
                    // NOT to be called
                    expect(true).toBeFalse();
                },
                error: (error) => {
                    expect(error.status).toBe(400);
                },
            });
            const req = httpMock.expectOne({
                method: 'GET',
                url: 'api/whois-internal/api/resources/aut-num/AS44569/associated-domain-objects.json?filter=&page=0',
            });
            expect(req.request.method).toBe('GET');
            req.flush('', { status: 400, statusText: 'Unexpected type aut-num' });
        });
    });
});
