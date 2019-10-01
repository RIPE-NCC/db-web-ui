import {TestBed} from "@angular/core/testing";
import {CredentialsService} from "../../../app/ng/shared/credentials.service";
import {UpdatesModule} from "../../../app/ng/updates/update.module";

describe("CredentialsService", () => {

    let credentialsService: CredentialsService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UpdatesModule],
            providers: [
                CredentialsService,
            ],
        });
        credentialsService = TestBed.get(CredentialsService);
    });

    it("should initial state", () => {
        expect(credentialsService.hasCredentials()).toEqual(false);
        expect(credentialsService.getCredentials()).toBeUndefined();
    });

    it("should read credentials", () => {
        credentialsService.setCredentials("TEST-MNT", "secret");
        expect(credentialsService.hasCredentials()).toEqual(true);
        expect(credentialsService.getCredentials()).toEqual({mntner: "TEST-MNT", successfulPassword: "secret"});
        credentialsService.removeCredentials();
        expect(credentialsService.hasCredentials()).toEqual(false);
        expect(credentialsService.getCredentials()).toBeUndefined();
    });

});
