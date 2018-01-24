/*global beforeEach,describe,expect,inject,it*/
'use strict';

describe('QueryParameters', function () {

    beforeEach(module('dbWebApp'));

    it('should parse long options', function () {

        var qp = new QueryParameters();
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

        var qp = new QueryParameters();
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

        var qp = new QueryParameters();
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

        var qp = new QueryParameters();
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

        var qp = new QueryParameters();
        qp.queryText = " -B  --no-referenced -if mnt-by --inverse person -t --reverse-domain --no-filtering --select-types aut-num";

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

        var qp = new QueryParameters();
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

        var qp = new QueryParameters();
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

        var qp = new QueryParameters();
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

});

