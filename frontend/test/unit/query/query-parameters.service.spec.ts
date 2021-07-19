import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {TestBed} from "@angular/core/testing";
import {IQueryParameters, QueryParametersService} from "../../../src/app/query/query-parameters.service";
import {WhoisMetaService} from "../../../src/app/shared/whois-meta.service";

describe("QueryParameters", () => {

    let queryParametersService: QueryParametersService;
    let httpMock: HttpTestingController;
    let qp: IQueryParameters;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                QueryParametersService,
                WhoisMetaService,
                {provide: "$log", useValue: {info: () => {}}}
            ],
        });
        qp = {
            queryText: "",
            types: {},
            inverse: {},
            hierarchy: "",
            reverseDomain: false,
            doNotRetrieveRelatedObjects: false,
            showFullObjectDetails: false,
            source: ""
        };
        httpMock = TestBed.inject(HttpTestingController);
        queryParametersService = TestBed.inject(QueryParametersService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should be created", () => {
        expect(queryParametersService).toBeTruthy();
    });

    it("should parse long options", () => {

        qp.queryText = "--no-such-flag --select-types person;mntner --inverse mnt-by etchells-mnt ";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toContain("Invalid option: --no-such-flag");

        expect(qp.queryText).toEqual("etchells-mnt");
        expect(qp.showFullObjectDetails).toEqual(false);
        expect(qp.reverseDomain).toEqual(false);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(false);
        expect(qp.types).toEqual({PERSON: true, MNTNER: true});
        expect(qp.inverse).toEqual({MNT_BY: true});
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("");

    });

    it("should parse short options", () => {

        qp.queryText = " -iBr mnt-by etchells-mnt ";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("etchells-mnt");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(false);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(true);
        expect(qp.types).toEqual({});
        expect(qp.inverse).toEqual({MNT_BY: true});
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("");

    });

    it("should parse multiple options", () => {

        qp.queryText = " -r -B -i mnt-by etchells-mnt ";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("etchells-mnt");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(false);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(true);
        expect(qp.types).toEqual({});
        expect(qp.inverse).toEqual({MNT_BY: true});
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("");
    });

    it("should parse multiple mixed up options", () => {

        qp.queryText = " -B  etchells-mnt --no-referenced -i mnt-by --inverse person -T inetnum;inet6num --select-types aut-num";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("etchells-mnt");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(false);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(true);
        expect(qp.types).toEqual({AUT_NUM: true, INETNUM: true, INET6NUM: true});
        expect(qp.inverse).toEqual({MNT_BY: true, PERSON: true});
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("");

    });

    it("should detect and report warnings properly", () => {
        qp.queryText = " -B  --no-referenced -if mnt-by --inverse person --reverse-domain --no-filtering --select-types aut-num";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(2);
        expect(validationIssues.errors[0]).toContain("ERROR:111: invalid option supplied. Use help query to see the valid options.");
        expect(validationIssues.errors[1]).toEqual("No search term provided");

        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(true);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(true);
        expect(qp.types).toEqual({AUT_NUM: true});
        expect(qp.inverse).toEqual({MNT_BY: true, PERSON: true});
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("");

    });

    it("should reject multiple hierarchy flags", () => {

        qp.queryText = " -iT fish --one-less --reverse-domain --no-filtering -l";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(3);
        expect(validationIssues.errors[0]).toEqual("Parse error. Inverse and type flags cannot be used together");
        expect(validationIssues.errors[1]).toEqual("Object type flag specified without value");
        expect(validationIssues.errors[2]).toEqual("No search term provided");

        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(true);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(false);
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("l");

    });

    it("should parse hierarchy flags", () => {

        qp.queryText = " -Blrd worlddomination";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("worlddomination");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(true);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(true);
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("l");

    });

    it("should parse separated flags", () => {

        qp.queryText = " -B --one-more -r -d worlddomination";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("worlddomination");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(true);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(true);
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("m");

    });

    it("should parse inverse lookup abuse-c", () => {

        qp.queryText = " -i abuse-c -T organisation -B ACRO862-RIPE";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("ACRO862-RIPE");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(false);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(false);
        expect(qp.source).toEqual("");
        expect(qp.types).toEqual({ORGANISATION: true});
        expect(qp.inverse).toEqual({ABUSE_C: true});

    });

    it("should handle type spcified with Tflag", () => {

        qp.queryText = "-Tmntner,organisation shryane-mnt";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);
        expect(qp.queryText).toEqual("shryane-mnt");
        expect(qp.types).toEqual({MNTNER: true, ORGANISATION: true});

        qp.queryText = "-T mntner,organisation shryane-mnt";

        queryParametersService.validate(qp);
        expect(qp.types).toEqual({MNTNER: true, ORGANISATION: true});
    });

    it("should report error for quering with template flag not existing object", () => {

        qp.queryText = " -B  --no-referenced -if mnt-by --inverse person -t --reverse-domain --no-filtering --select-types aut-num";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toContain("Unknown object type \"--reverse-domain\".");
        expect(validationIssues.warnings.length).toEqual(0);
        expect(qp.queryText).toEqual("");
        expect(qp.showFullObjectDetails).toEqual(false);
        expect(qp.reverseDomain).toEqual(false);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(false);
        expect(qp.types).toEqual({});
        expect(qp.inverse).toEqual({});
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("");
    });

    it("should not report error for quering with --template flag not existing object", () => {

        qp.queryText = " -B  --no-referenced -if mnt-by --inverse person --template something";

        let validationIssues = queryParametersService.validate(qp);

        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toContain(`Unknown object type "something".`);

        expect(qp.queryText).toEqual("");
        expect(qp.showFullObjectDetails).toEqual(false);
        expect(qp.reverseDomain).toEqual(false);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(false);
        expect(qp.types).toEqual({});
        expect(qp.inverse).toEqual({});
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("");
    });

    it("should report warning for quering with --template flag multiple times", () => {

        qp.queryText = "-t inetnum --template person something";

        let validationIssues = queryParametersService.validate(qp);

        expect(validationIssues.warnings.length).toEqual(1);
        expect(validationIssues.warnings[0]).toContain("The flag \"-t\" cannot be used multiple times.");

        qp.queryText = "-t --template";

        let validationIssuesError = queryParametersService.validate(qp);

        expect(validationIssuesError.errors.length).toEqual(1);
        expect(validationIssuesError.errors[0]).toContain("Unknown object type \"--template\".");
        expect(qp.queryText).toEqual("");
    });

    it("should report error for quering template without object type", () => {

        qp.queryText = "-t";

        let validationIssues = queryParametersService.validate(qp);

        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toContain("Invalid option supplied.");
        expect(qp.queryText).toEqual("");

        qp.queryText = "--template";

        validationIssues = queryParametersService.validate(qp);

        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toContain("Invalid option supplied.");
        expect(qp.queryText).toEqual("");
    });

    it("should parse --resource flag", () => {

        qp.queryText = " -B --one-more --resource -r -d worlddomination";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("worlddomination");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(true);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(true);
        expect(qp.source).toEqual("GRS");
        expect(qp.hierarchy).toEqual("m");
    });

    it("should parse --sources flag", () => {

        qp.queryText = "1.2.3.4 --sources RIPE,ARIN-GRS";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("1.2.3.4");
        expect(qp.source).toEqual("RIPE,ARIN-GRS");
    });

    it("should parse --sources flag unconditionally of the position in the query", () => {

        qp.queryText = "--sources ARIN-GRS 1.2.3.4";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("1.2.3.4");
        expect(qp.source).toEqual("ARIN-GRS");
    });

    it("should report missing search term when just sources are queried", () => {

        qp.queryText = "--sources RIPE,APNIC";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toEqual("No search term provided");
        expect(validationIssues.warnings.length).toEqual(0);
    });

    it("should not allow sources and resource flag together in same query", () => {

        qp.queryText = "--resource --sources ARIN-GRS,RIPE 1.2.3.4";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toEqual("The flags \"--resource\" and \"-s, --sources\" cannot be used together.");
        expect(validationIssues.warnings.length).toEqual(0);

        qp.queryText = "--resource -s ARIN-GRS,RIPE 1.2.3.4";

        validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors[0]).toEqual("The flags \"--resource\" and \"-s, --sources\" cannot be used together.");

        qp.queryText = "--sources ARIN-GRS,RIPE --resource 1.2.3.4";

        validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors[0]).toEqual("The flags \"--resource\" and \"-s, --sources\" cannot be used together.");
    });

    it("should report missing sources in query queried", () => {

        qp.queryText = "1.2.3.4 --sources";

        let validationIssues = queryParametersService.validate(qp);
        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toEqual("Source specified without value");
        expect(validationIssues.warnings.length).toEqual(0);
    });
});
