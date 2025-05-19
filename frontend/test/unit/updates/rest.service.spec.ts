import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PropertiesService } from '../../../src/app/properties.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { RestService } from '../../../src/app/updatesweb/rest.service';

describe('RestService', () => {
    let httpMock: HttpTestingController;
    let restService: RestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule],
            providers: [
                RestService,
                PropertiesService,
                { provide: 'WhoisResources', useValue: { wrapError: (error: string) => error, wrapSuccess: (success: string) => success } },
                { provide: Router, useValue: { navigateByUrl: () => {}, events: of() } },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        restService = TestBed.inject(RestService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should send a http delete when deleting an object', () => {
        const source = 'ripe';
        const objectType = 'MNT';
        const name = 'TEST-MNT';
        const reason = 'testing';

        restService.deleteObject(source, objectType, name, reason, false, ['pass +word']).subscribe((resp) => {
            expect(resp).toBe('deleted');
        });
        const req = httpMock.expectOne({ method: 'DELETE', url: 'api/whois/RIPE/MNT/TEST-MNT?dry-run=false&reason=testing&password=pass%20%2Bword' });
        expect(req.request.method).toBe('DELETE');
        req.flush('deleted');
    });

    it('should send a http delete when deleting an object with references', () => {
        const source = 'ripe';
        const objectType = 'MNT';
        const name = 'TEST-MNT';
        const reason = 'testing';

        restService.deleteObject(source, objectType, name, reason, true, ['pass +word']).subscribe((resp) => {
            expect(resp).toBe('deleted');
        });
        const req = httpMock.expectOne({ method: 'DELETE', url: 'api/references/RIPE/MNT/TEST-MNT?dry-run=false&reason=testing&password=pass%20%2Bword' });
        expect(req.request.method).toBe('DELETE');
        req.flush('deleted');
    });

    it('should send a http get when requesting references', () => {
        const source = 'RIPE';
        const objectType = 'MNT';
        const name = 'TEST-MNT';

        restService.getReferences(source, objectType, name, '2').subscribe((resp) => {
            expect(resp).toBe(3);
        });

        const req = httpMock.expectOne({ method: 'GET', url: 'api/references/RIPE/MNT/TEST-MNT?limit=2' });
        expect(req.request.method).toBe('GET');
        req.flush(3);
    });

    it('should encode password when authenticate mntner', () => {
        restService.authenticate('RIPE', 'mntner', 'SVONJA-MNT', 'test 123+&456').subscribe((resp) => {
            expect(resp).toBe('TEST');
        });
        // test 123+456 should be encoded to test%20123%2B456
        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/mntner/SVONJA-MNT?password=test%20123%2B%26456&unfiltered=true' });
        expect(req.request.method).toBe('GET');
        req.flush('TEST');
    });

    it('should properly encode on fetchObject', () => {
        const source = 'ripe';
        const objectType = 'ROUTE6';
        const name = 'a000:b000::/43AS123';

        restService.fetchObject(source, objectType, name, 'pass +word').subscribe(() => {});

        const req = httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/ROUTE6/a000%3Ab000%3A%3A%2F43AS123?password=pass%20%2Bword&unfiltered=true' });
        expect(req.request.method).toBe('GET');
    });

    it('should properly encode on modifyObject', () => {
        const source = 'ripe';
        const objectType = 'ROUTE6';
        const name = 'a000:b000::/43AS123';

        restService.modifyObject(source, objectType, name, {}, 'pass +word').subscribe(() => {});

        const req = httpMock.expectOne({ method: 'PUT', url: 'api/whois/RIPE/ROUTE6/a000:b000::/43AS123?password=pass%20%2Bword' });
        expect(req.request.method).toBe('PUT');
    });

    it('should properly encode on createObject', () => {
        const source = 'ripe';
        const objectType = 'ROUTE6';

        restService.createObject(source, objectType, {}, ['pass +word', 'pwd+&']).subscribe(() => {});

        const req = httpMock.expectOne({ method: 'POST', url: 'api/whois/ripe/ROUTE6?password=pass%20%2Bword&password=pwd%2B%26' });
        expect(req.request.method).toBe('POST');
    });
});
