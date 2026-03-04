import { TestBed } from '@angular/core/testing';
import { OverrideCredentialsService } from '../../../src/app/shared/override-credentials-service';

describe('OverrideCredentialsService', () => {
    let overrideCredentialsService: OverrideCredentialsService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [OverrideCredentialsService],
        });
        overrideCredentialsService = TestBed.inject(OverrideCredentialsService);
    });

    it('should initial state', () => {
        expect(overrideCredentialsService.hasCredentials()).toEqual(false);
    });

    it('should read credentials', () => {
        overrideCredentialsService.setCredentials('TEST-MNT', 'secret');
        expect(overrideCredentialsService.hasCredentials()).toEqual(true);
        expect(overrideCredentialsService.getCredentials()).toEqual([{ mntner: 'TEST-MNT', successfulOverride: 'secret' }]);
        overrideCredentialsService.removeCredentials();
        expect(overrideCredentialsService.hasCredentials()).toEqual(false);
    });
});
