/*global afterEach,beforeEach,describe,expect,inject,it*/
'use strict';

describe('LirDataService', function () {

    beforeEach(module('dbWebApp'));

    var $httpBackend;
    var service;

    beforeEach(inject(function (_LirDataService_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        service = _LirDataService_;

        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.flush();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Populate organisations from only LIRs', function () {
        $httpBackend.whenGET('api/ba-apps/lirs').respond(function () {
            return [200, {
                response: {
                    status: 200,
                    results: [{
                        membershipId: 3629,
                        regId: 'nl.surfnet',
                        organisationname: 'SURFnet bv',
                        orgId: 'ORG-Sb3-RIPE'
                    }]
                }
            }, {}];
        });

        service.getOrgs().then(function (data) {
            expect(data).toEqual([{displayName: 'SURFnet bv nl.surfnet', memberId: '3629', orgId: 'ORG-Sb3-RIPE', orgName: 'SURFnet bv', regId: 'nl.surfnet'}]);

        });
        $httpBackend.flush();
    });

    it('Populate organisations from both sources', function () {
        $httpBackend.whenGET('api/ba-apps/lirs').respond(function () {
            return [200, {
                response: {
                    status: 200,
                    results: [{
                        membershipId: 3629,
                        regId: 'nl.surfnet',
                        organisationname: 'SURFnet bv',
                        serviceLevel: 'NORMAL',
                        orgId: 'ORG-Sb3-RIPE',
                        billingPhase: 0
                    }, {
                        membershipId: 7347,
                        regId: 'zz.example',
                        organisationname: 'Internet Provider BV',
                        serviceLevel: 'NORMAL',
                        orgId: 'ORG-EIP1-RIPE',
                        billingPhase: 0
                    }]
                }
            }, {}];
        });

        service.getOrgs().then(function (data) {
            expect(data).toEqual([
                {displayName: 'Internet Provider BV zz.example', memberId: '7347', orgId: 'ORG-EIP1-RIPE', orgName: 'Internet Provider BV', regId: 'zz.example'},
                {displayName: 'SURFnet bv nl.surfnet', memberId: '3629', orgId: 'ORG-Sb3-RIPE', orgName: 'SURFnet bv', regId: 'nl.surfnet'}
            ]);
        });

        $httpBackend.flush();
    });
});
