import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RpkiValidatorService } from '../../../src/app/updatesweb/rpki-validator.service';
import { UpdatesWebModule } from '../../../src/app/updatesweb/updateweb.module';

describe('RpkiValidatorService', () => {
    let httpMock: HttpTestingController;
    let rpkiValidatorService: RpkiValidatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, UpdatesWebModule],
            providers: [RpkiValidatorService],
        });
        httpMock = TestBed.inject(HttpTestingController);
        rpkiValidatorService = TestBed.inject(RpkiValidatorService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should get rpki validator response', () => {
        const origin = 'AS1759';
        const prefix = '192.194.0.0/16';

        rpkiValidatorService.hasRoa(origin, prefix).subscribe((resp) => {
            expect(resp).toBe(roaValid);
        });
        const req = httpMock.expectOne({ method: 'GET', url: 'api/rpki/roa?origin=AS1759&route=192.194.0.0/16' });
        expect(req.request.method).toBe('GET');
        req.flush(roaValid);
    });
});

const roaValid = {
    validated_route: {
        route: {
            origin_asn: 'AS1759',
            prefix: '192.194.0.0/16',
        },
        validity: {
            state: 'valid',
            description: 'At least one VRP Matches the Route Prefix',
            VRPs: {
                matched: [
                    {
                        asn: 'AS1759',
                        prefix: '192.194.0.0/16',
                        max_length: '24',
                    },
                ],
                unmatched_as: [],
                unmatched_length: [],
            },
        },
    },
    generatedTime: '2022-05-10T10:21:34Z',
};
