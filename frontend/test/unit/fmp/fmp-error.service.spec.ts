import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FmpErrorService } from '../../../src/app/fmp/fmp-error.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { AlertsService } from '../../../src/app/shared/alert/alerts.service';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';

describe('FmpErrorService', () => {
    let alertServiceSpy: AlertsService;
    let fmpErrorService: FmpErrorService;

    const blockedMessage = 'Your RIPE NCC Access account has recently been used for an unusually high number of requests more text here';

    beforeEach(() => {
        alertServiceSpy = jasmine.createSpyObj('AlertsService', ['setGlobalError']);
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                FmpErrorService,
                { provide: AlertsService, useValue: alertServiceSpy },
                WhoisResourcesService,
                WhoisMetaService,
                PropertiesService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        fmpErrorService = TestBed.inject(FmpErrorService);
    });

    it('should check error from whoisinternal', () => {
        expect(fmpErrorService.isYourAccountBlockedError({ error: '', status: 403 } as never)).toBe(false);
        expect(fmpErrorService.isYourAccountBlockedError({ error: blockedMessage, status: 500 } as never)).toBe(false);
        expect(fmpErrorService.isYourAccountBlockedError({ error: blockedMessage, status: 403 } as never)).toBe(true);
    });

    it('should set the global message', () => {
        fmpErrorService.setGlobalAccountBlockedError();
        expect(alertServiceSpy.setGlobalError).toHaveBeenCalledWith(
            'Your RIPE NCC Access account has recently been used for an unusually high number of requests to access maintainer objects, and has therefore been blocked for security reasons. Please contact us if you believe you should not be blocked.',
            'https://www.ripe.net/contact-form?topic=ripe_dbm&show_form=true',
            'contact us',
        );
    });
});
