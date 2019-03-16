/*global beforeEach,describe,expect,inject,it*/
'use strict';

describe('QueryParameters', function () {

    beforeEach(module('dbWebApp'));

    var qp;

    beforeEach(inject(function (_QueryParameters_) {
        qp = _QueryParameters_;
    }));

    it('should parse long options', function () {

        qp.queryText = "--no-such-flag --select-types person;mntner --inverse mnt-by etchells-mnt ";

        var validationIssues = qp.validate();
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

    it('should parse short options', function () {

        qp.queryText = " -iBr mnt-by etchells-mnt ";

        var validationIssues = qp.validate();
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

    it('should parse multiple options', function () {

        qp.queryText = " -r -B -i mnt-by etchells-mnt ";

        var validationIssues = qp.validate();
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

    it('should parse multiple mixed up options', function () {

        qp.queryText = " -B  etchells-mnt --no-referenced -i mnt-by --inverse person -T inetnum;inet6num --select-types aut-num";

        var validationIssues = qp.validate();
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

    it('should detect and report warnings properly', function () {

        qp.queryText = " -B  --no-referenced -if mnt-by --inverse person --reverse-domain --no-filtering --select-types aut-num";

        var validationIssues = qp.validate();
        expect(validationIssues.errors.length).toEqual(2);
        expect(validationIssues.errors[0]).toContain("ERROR:111: invalid option supplied<br>Use help query to see the valid options.");
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

    it('should reject multiple hierarchy flags', function () {

        qp.queryText = " -iT fish --one-less --reverse-domain --no-filtering -l";

        var validationIssues = qp.validate();
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

    it('should parse hierarchy flags', function () {

        qp.queryText = " -Blrd worlddomination";

        var validationIssues = qp.validate();
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("worlddomination");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(true);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(true);
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("l");

    });

    it('should parse separated flags', function () {

        qp.queryText = " -B --one-more -r -d worlddomination";

        var validationIssues = qp.validate();
        expect(validationIssues.errors.length).toEqual(0);
        expect(validationIssues.warnings.length).toEqual(0);

        expect(qp.queryText).toEqual("worlddomination");
        expect(qp.showFullObjectDetails).toEqual(true);
        expect(qp.reverseDomain).toEqual(true);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(true);
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("m");

    });

    it('should parse inverse lookup abuse-c', function () {

        qp.queryText = " -i abuse-c -T organisation -B ACRO862-RIPE";

        var validationIssues = qp.validate();
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


    it('should report error for quering with template flag not existing object', function () {

        qp.queryText = " -B  --no-referenced -if mnt-by --inverse person -t --reverse-domain --no-filtering --select-types aut-num";

        var validationIssues = qp.validate();
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

    it('should not report error for quering with --template flag not existing object', function () {

        qp.queryText = " -B  --no-referenced -if mnt-by --inverse person --template something";

        var validationIssues = qp.validate();

        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toContain('Unknown object type "something".');

        expect(qp.queryText).toEqual("");
        expect(qp.showFullObjectDetails).toEqual(false);
        expect(qp.reverseDomain).toEqual(false);
        expect(qp.doNotRetrieveRelatedObjects).toEqual(false);
        expect(qp.types).toEqual({});
        expect(qp.inverse).toEqual({});
        expect(qp.source).toEqual("");
        expect(qp.hierarchy).toEqual("");
    });

    it('should report warning for quering with --template flag multiple times', function () {

        qp.queryText = "-t inetnum --template person something";

        var validationIssues = qp.validate();

        expect(validationIssues.warnings.length).toEqual(1);
        expect(validationIssues.warnings[0]).toContain("The flag \"-t\" cannot be used multiple times.");
        
        qp.queryText = "-t --template";

        var validationIssues = qp.validate();

        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toContain("Unknown object type \"--template\".");
        expect(qp.queryText).toEqual("");
    });

    it('should report error for quering template without object type', function () {

        qp.queryText = "-t";

        var validationIssues = qp.validate();

        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toContain("Invalid option supplied.");
        expect(qp.queryText).toEqual("");

        qp.queryText = "--template";

        validationIssues = qp.validate();

        expect(validationIssues.errors.length).toEqual(1);
        expect(validationIssues.errors[0]).toContain("Invalid option supplied.");
        expect(qp.queryText).toEqual("");
    });
});

