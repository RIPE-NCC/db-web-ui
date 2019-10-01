import {TestBed} from "@angular/core/testing";
import {CryptService} from "../../../../app/ng/updates/web/crypt.service";

describe("CryptService", () => {

    let cryptService: CryptService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CryptService
            ],
        });
        cryptService = TestBed.get(CryptService);
    });

    it("crypt", function() {
        expect(cryptService.cryptSalt("password", "rjK1MckJ")).toEqual("$1$rjK1MckJ$pEARceVLJAOHqoMO/OKRY0");
        expect(cryptService.cryptSalt("password", ".C2JWI4j")).toEqual("$1$.C2JWI4j$QJcccAJXrqTZceIGvUt.E/");
        expect(cryptService.cryptSalt("abcdefghijklmnopqrstuvwxyz", "uHhYHKnV")).toEqual("$1$uHhYHKnV$6Wi1CEv/OU6/VaU2vYv760");
    });
});
