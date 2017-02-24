'use strict';

fdescribe('OrgDropDownDataService', function () {

    beforeEach(module('dbWebApp'));

    var $httpBackend;
    var service;

    beforeEach(inject(function (_OrgDropDownDataService_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        service = _OrgDropDownDataService_;

        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.flush();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Populate organisations from only Whois', function () {
        $httpBackend.whenGET('/db-web-ui/api/ba-apps/organisations').respond(function () {
            return [200, [{id: 'ORG-Sb3-RIPE', name: 'SURFnet bv nl.surfnet'}], {}];
        });
        $httpBackend.whenGET('/db-web-ui/api/ba-apps/lirs?service-level=NORMAL,PENDING_CLOSURE').respond(function () {
            return [200, {}, {}];
        });

        service.getOrgs().then(function (data) {
            expect(data).toEqual([{id: 'ORG-Sb3-RIPE', name: 'SURFnet bv nl.surfnet'}]);
        });

        $httpBackend.flush();
    });

    it('Populate organisations from only LIRs', function () {
        $httpBackend.whenGET('/db-web-ui/api/ba-apps/organisations').respond(function () {
            return [200, [], {}];
        });
        $httpBackend.whenGET('/db-web-ui/api/ba-apps/lirs?service-level=NORMAL,PENDING_CLOSURE').respond(function () {
            return [200, {
                response: {
                    status: 200,
                    results: [{
                        membershipId: 3629,
                        regId: "nl.surfnet",
                        organisationName: "SURFnet bv",
                        orgId: "ORG-Sb3-RIPE"
                    }]
                }
            }, {}];
        });

        service.getOrgs().then(function (data) {
            expect(data).toEqual([{id: 'ORG-Sb3-RIPE', name: 'SURFnet bv nl.surfnet'}]);
        });

        $httpBackend.flush();
    });

    it('Populate organisations from both sources', function () {
        $httpBackend.whenGET('/db-web-ui/api/ba-apps/organisations').respond(function () {
            return [200, {id: 'ORG-BLA1-RIPE', name: 'Some provider'}, {}];
        });
        $httpBackend.whenGET('/db-web-ui/api/ba-apps/lirs?service-level=NORMAL,PENDING_CLOSURE').respond(function () {
            return [200, {
                response: {
                    status: 200,
                    results: [{
                        membershipId: 3629,
                        regId: "nl.surfnet",
                        organisationName: "SURFnet bv",
                        serviceLevel: "NORMAL",
                        orgId: "ORG-Sb3-RIPE",
                        billingPhase: 0
                    }, {
                        membershipId: 7347,
                        regId: "zz.example",
                        organisationName: "Internet Provider BV",
                        serviceLevel: "NORMAL",
                        orgId: "ORG-EIP1-RIPE",
                        billingPhase: 0
                    }]
                }
            }, {}];
        });

        service.getOrgs().then(function (data) {
            expect(data).toEqual([
                {id: 'ORG-Sb3-RIPE', name: 'SURFnet bv nl.surfnet'},
                {id: 'ORG-EIP1-RIPE', name: 'Internet Provider BV zz.example'},
                {id: 'ORG-BLA1-RIPE', name: 'Some provider'}
            ]);
        });

        $httpBackend.flush();
    });
});
