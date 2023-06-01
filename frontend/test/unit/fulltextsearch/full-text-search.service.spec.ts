import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FullTextSearchModule } from '../../../src/app/fulltextsearch/full-text-search.module';
import { FullTextSearchService } from '../../../src/app/fulltextsearch/full-text-search.service';

describe('FullTextSearchService', () => {
    let fullTextSearchService: FullTextSearchService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FullTextSearchModule, HttpClientTestingModule],
            providers: [FullTextSearchService, { provide: '$log', useValue: { error: () => {} } }],
        });
        httpMock = TestBed.inject(HttpTestingController);
        fullTextSearchService = TestBed.inject(FullTextSearchService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be able to encode query text', (done) => {
        const query = 'tsttechc-ripe';
        const start = 0;
        const advanced = false;
        const advancedMode = '';
        const searchObjects: string[] = [];
        const searchAttributes: string[] = [];

        fullTextSearchService.doSearch(query, start, advanced, advancedMode, searchObjects, searchAttributes).subscribe((respons: any) => {
            expect(respons).toBe('response');
            done();
        });
        const req = httpMock.expectOne({
            method: 'GET',
            url: 'api/rest/fulltextsearch/select?facet=true&format=xml&hl=true&q=(tsttechc%5C-ripe)&start=0&wt=json',
        });
        expect(req.request.method).toBe('GET');
        req.flush('response');
    });

    it('should be able to encode various', (done) => {
        const query = 'tsttechc-ripe';
        const start = 0;
        const advanced = true;
        const advancedMode = 'all';
        const searchObjects = ['inetnum', 'mntner'];
        const searchAttributes = ['remarks'];

        fullTextSearchService.doSearch(query, start, advanced, advancedMode, searchObjects, searchAttributes).subscribe((respons: any) => {
            expect(respons).toBe('response');
            done();
        });
        const req = httpMock.expectOne({
            method: 'GET',
            url: 'api/rest/fulltextsearch/select?facet=true&format=xml&hl=true&q=(remarks:(tsttechc%5C-ripe))%20AND%20(object-type:inetnum%20OR%20object-type:mntner)&start=0&wt=json',
        });
        expect(req.request.method).toBe('GET');
        req.flush('response');
    });

    it('should be able to encode advanced all options', (done) => {
        const query = 'tsttechc-ripe etch-mnt';
        const start = 0;
        const advanced = true;
        const advancedMode = 'all';
        const searchObjects = ['inetnum', 'mntner'];
        const searchAttributes: string[] = [];
        fullTextSearchService.doSearch(query, start, advanced, advancedMode, searchObjects, searchAttributes).subscribe((respons: any) => {
            expect(respons).toBe('response');
            done();
        });
        const req = httpMock.expectOne({
            method: 'GET',
            url: 'api/rest/fulltextsearch/select?facet=true&format=xml&hl=true&q=(tsttechc%5C-ripe%20AND%20etch%5C-mnt)%20AND%20(object-type:inetnum%20OR%20object-type:mntner)&start=0&wt=json',
        });
        expect(req.request.method).toBe('GET');
        req.flush('response');
    });

    it('should be able to encode advanced any options', (done) => {
        const query = 'tsttechc-ripe etch-mnt';
        const start = 0;
        const advanced = true;
        const advancedMode = 'any';
        const searchObjects = ['inetnum', 'mntner'];
        const searchAttributes: string[] = [];
        fullTextSearchService.doSearch(query, start, advanced, advancedMode, searchObjects, searchAttributes).subscribe((respons: any) => {
            expect(respons).toBe('response');
            done();
        });
        const req = httpMock.expectOne({
            method: 'GET',
            url: 'api/rest/fulltextsearch/select?facet=true&format=xml&hl=true&q=(tsttechc%5C-ripe%20OR%20etch%5C-mnt)%20AND%20(object-type:inetnum%20OR%20object-type:mntner)&start=0&wt=json',
        });
        expect(req.request.method).toBe('GET');
        req.flush('response');
    });

    it('should be able to encode advanced exact options', (done) => {
        const query = 'tsttechc-ripe etch-mnt';
        const start = 0;
        const advanced = true;
        const advancedMode = 'exact';
        const searchObjects = ['inetnum', 'mntner'];
        const searchAttributes = ['remarks', 'country'];
        fullTextSearchService.doSearch(query, start, advanced, advancedMode, searchObjects, searchAttributes).subscribe((respons: any) => {
            expect(respons).toBe('response');
            done();
        });
        const req = httpMock.expectOne({
            method: 'GET',
            url: 'api/rest/fulltextsearch/select?facet=true&format=xml&hl=true&q=(remarks:(%22tsttechc%5C-ripe%20etch%5C-mnt%22)%20OR%20country:(%22tsttechc%5C-ripe%20etch%5C-mnt%22))%20AND%20(object-type:inetnum%20OR%20object-type:mntner)&start=0&wt=json',
        });
        expect(req.request.method).toBe('GET');
        req.flush('response');
    });
});
