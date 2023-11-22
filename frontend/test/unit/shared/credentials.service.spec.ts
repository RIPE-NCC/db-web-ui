import { TestBed } from '@angular/core/testing';
import { CredentialsService } from '../../../src/app/shared/credentials.service';
import { UpdatesWebModule } from '../../../src/app/updatesweb/updateweb.module';

describe('CredentialsService', () => {
    let credentialsService: CredentialsService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UpdatesWebModule],
            providers: [CredentialsService],
        });
        credentialsService = TestBed.inject(CredentialsService);
    });

    it('should initial state', () => {
        expect(credentialsService.hasCredentials()).toEqual(false);
    });

    it('should read credentials', () => {
        credentialsService.setCredentials('TEST-MNT', 'secret');
        expect(credentialsService.hasCredentials()).toEqual(true);
        expect(credentialsService.getCredentials()).toEqual([{ mntner: 'TEST-MNT', successfulPassword: 'secret' }]);
        credentialsService.removeCredentials();
        expect(credentialsService.hasCredentials()).toEqual(false);
    });
});
