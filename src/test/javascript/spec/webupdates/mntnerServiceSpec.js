'use strict';

describe('dbWebApp: MntnerService', function () {
    var subject, credentialServiceMock;

    beforeEach(module('dbWebApp'));

    beforeEach(function () {
        credentialServiceMock = {
            hasCredentials: function() {
                return true;
            },
            getCredentials: function() {
                return {mntner: 'B-MNT', successfulPassword:'secret'};
            }
        };

        module(function ($provide) {
            $provide.value('CredentialsService', credentialServiceMock);
        });

        inject(function(MntnerService) {
            subject = MntnerService;
        });

    });

    afterEach(function () {
    });

    it ('should be loaded', function() {
        expect(subject).toBeDefined();
    });

    it('enrich mntners with SSO status', function() {

        var ssoMntners = [
                { type:'mntner', key:'A-MNT', mine:true, auth:['SSO']},
                { type:'mntner', key:'B-MNT', mine:true, auth:['MD5-PW']}
            ];
        var objectMntners = [
            { type:'mntner', key:'A-MNT', },
            { type:'mntner', key:'C-MNT'}
        ];

        var enriched = subject.enrichWithSsoStatus(ssoMntners, objectMntners);

        expect(enriched.length).toBe(2);

        expect(enriched[0].type).toBe('mntner');
        expect(enriched[0].key).toBe('A-MNT');
        expect(enriched[0].mine).toBe(true);

        expect(enriched[1].type).toBe('mntner');
        expect(enriched[1].key).toBe('C-MNT');
        expect(enriched[1].mine).toBe(false);
    });


    it('enrich mntners with new status', function() {

        var originalMntners = [
            { type:'mntner', key:'A-MNT', mine:true, auth:['SSO']},
            { type:'mntner', key:'B-MNT', mine:true, auth:['MD5-PW']}
        ];
        var currentMntners = [
            { type:'mntner', key:'A-MNT', },
            { type:'mntner', key:'C-MNT'}
        ];

        var enriched = subject.enrichWithNewStatus(originalMntners, currentMntners);

        expect(enriched.length).toBe(2);

        expect(enriched[0].type).toBe('mntner');
        expect(enriched[0].key).toBe('A-MNT');
        expect(enriched[0].isNew).toBe(false);

        expect(enriched[1].type).toBe('mntner');
        expect(enriched[1].key).toBe('C-MNT');
        expect(enriched[1].isNew).toBe(true);
    });

    it('no authentication needed for SSO mntner',function() {
        var ssoMntners = [
            { type:'mntner', key:'A-MNT', mine:true, auth:['SSO']},
            { type:'mntner', key:'B-MNT', mine:true, auth:['MD5-PW']}

        ];
        var objectMntners = [
            { type:'mntner', key:'A-MNT', },
            { type:'mntner', key:'D-MNT'}
        ];
        expect(subject.needsPasswordAuthentication( ssoMntners, [], objectMntners)).toBe(false);
        expect(subject.needsPasswordAuthentication( ssoMntners, objectMntners, [])).toBe(false);

    });

    it('no authentication needed for SSO mntner with different case',function() {
        var ssoMntners = [
            { type:'mntner', key:'A-MNT', mine:true, auth:['SSO']}
        ];
        var objectMntners = [
            { type:'mntner', key:'a-mnt', }
        ];
        expect(subject.needsPasswordAuthentication( ssoMntners, [], objectMntners)).toBe(false);
        expect(subject.needsPasswordAuthentication( ssoMntners, objectMntners, [])).toBe(false);

    });

    it('no authentication needed for trusted mntner',function() {
        var ssoMntners = [
                { type:'mntner', key:'A-MNT', mine:true, auth:['SSO']},
        ];
        var objectMntners = [
                { type:'mntner', key:'B-MNT', },
                { type:'mntner', key:'D-MNT'}
        ];

        expect(subject.needsPasswordAuthentication( ssoMntners, [], objectMntners)).toBe(false);
        expect(subject.needsPasswordAuthentication( ssoMntners, objectMntners, [])).toBe(false);
    });

    it('RIPE-NCC-RPSL-MNT is ignored while determining if authorisation is needed',function() {
        var ssoMntners = [ ];
        var objectMntners = [
            { type:'mntner', key:'RIPE-NCC-RPSL-MNT'},
            { type:'mntner', key:'B-MNT'},

        ];

        expect(subject.needsPasswordAuthentication( ssoMntners, [], objectMntners)).toBe(false);
        expect(subject.needsPasswordAuthentication( ssoMntners, objectMntners, [])).toBe(false);
    });

    it('no authentication needed for single RIPE-NCC-RPSL-MNT',function() {
        var ssoMntners = [];
        var objectMntners = [
            { type:'mntner', key:'RIPE-NCC-RPSL-MNT'}
        ];

        expect(subject.needsPasswordAuthentication( ssoMntners, [], objectMntners)).toBe(false);
        expect(subject.needsPasswordAuthentication( ssoMntners, objectMntners, [])).toBe(false);
    });

    it('authentication needed when no sso or password',function() {
        var ssoMntners = [
                { type:'mntner', key:'A-MNT', mine:true, auth:['SSO']},

        ];
        var objectMntners = [
                { type:'mntner', key:'D-MNT'}
        ];

        expect(subject.needsPasswordAuthentication( ssoMntners, [], objectMntners)).toBe(true);
        expect(subject.needsPasswordAuthentication( ssoMntners, objectMntners, [])).toBe(true);
    });

    it('get mntners that support password auth', function() {
        var ssoMntners = [
            { type:'mntner', key:'A-MNT', mine:true, auth:['SSO','MD5-PW']},
            { type:'mntner', key:'Z-MNT', mine:true, auth:['SSO','PGP']}
        ];
        var objectMntners = [
            { type:'mntner', key:'A-MNT', auth:['SSO','MD5-PW']},
            { type:'mntner', key:'B-MNT', auth:['SSO','PGP']},
            { type:'mntner', key:'C-MNT', auth:['MD5-PW', 'PGP']},
            { type:'mntner', key:'D-MNT', auth:['MD5-PW']},
            { type:'mntner', key:'E-MNT', auth:['SSO','PGP']}
        ];

        var mntnersWithPasswordCreate = subject.getMntnersForPasswordAuthentication(ssoMntners,[], objectMntners);
        expect(mntnersWithPasswordCreate.length).toBe(2);
        expect(mntnersWithPasswordCreate[0].key).toBe('C-MNT');
        expect(mntnersWithPasswordCreate[1].key).toBe('D-MNT');

        var mntnersWithPasswordModify = subject.getMntnersForPasswordAuthentication(ssoMntners, objectMntners,[]);
        expect(mntnersWithPasswordModify.length).toBe(2);
        expect(mntnersWithPasswordModify[0].key).toBe('C-MNT');
        expect(mntnersWithPasswordModify[1].key).toBe('D-MNT');
    });

    it('should not not return RIPE-NCC-RPSL-MNT as candidate for authentication', function() {
        var ssoMntners = [];
        var objectMntners = [
            { type:'mntner', key:'RIPE-NCC-RPSL-MNT', auth:['MD5-PW']},
            { type:'mntner', key:'A-MNT',             auth:['MD5-PW']}
        ];

        var mntnersWithPasswordCreate = subject.getMntnersForPasswordAuthentication(ssoMntners,[], objectMntners);
        expect(mntnersWithPasswordCreate.length).toBe(1);
        expect(mntnersWithPasswordCreate[0].key).toBe('A-MNT');

        var mntnersWithPasswordModify = subject.getMntnersForPasswordAuthentication(ssoMntners, objectMntners,[]);
        expect(mntnersWithPasswordModify.length).toBe(1);
        expect(mntnersWithPasswordModify[0].key).toBe('A-MNT');

    });


    it('get mntners that do not support password auth', function() {
            var ssoMntners = [
                { type:'mntner', key:'A-MNT', mine:true, auth:['SSO','MD5-PW']},
                { type:'mntner', key:'Y-MNT', mine:true, auth:['SSO','PGP']}
            ];
            var objectMntners = [
                { type:'mntner', key:'A-MNT', auth:['SSO','MD5-PW']},
                { type:'mntner', key:'B-MNT', auth:['SSO','PGP']},
                { type:'mntner', key:'C-MNT', auth:['MD5-PW', 'PGP']},
                { type:'mntner', key:'D-MNT', auth:['MD5-PW']},
                { type:'mntner', key:'E-MNT', auth:['SSO','PGP']}

            ];

            var mntnersWithoutPasswordCreate = subject.getMntnersNotEligibleForPasswordAuthentication(ssoMntners,[], objectMntners);
            expect(mntnersWithoutPasswordCreate.length).toBe(2);
            expect(mntnersWithoutPasswordCreate[0].key).toBe('B-MNT');
            expect(mntnersWithoutPasswordCreate[1].key).toBe('E-MNT');

            var mntnersWithoutPasswordModify = subject.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, objectMntners,[]);
            expect(mntnersWithoutPasswordModify.length).toBe(2);
            expect(mntnersWithoutPasswordModify[0].key).toBe('B-MNT');
            expect(mntnersWithoutPasswordModify[1].key).toBe('E-MNT');
        });

        it('should not not return RIPE-NCC-RPSL-MNT as candidate not eligible for authentication', function() {
            var ssoMntners = [];
            var objectMntners = [
                { type:'mntner', key:'RIPE-NCC-RPSL-MNT', auth:['SSO','MD5-PW']},
                { type:'mntner', key:'A-MNT',             auth:['SSO']}
            ];

            var mntnersWithoutPasswordCreate = subject.getMntnersNotEligibleForPasswordAuthentication(ssoMntners,[], objectMntners);
            expect(mntnersWithoutPasswordCreate.length).toBe(1);
            expect(mntnersWithoutPasswordCreate[0].key).toBe('A-MNT');

            var mntnersWithoutPasswordModify = subject.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, objectMntners,[]);
            expect(mntnersWithoutPasswordModify.length).toBe(1);
            expect(mntnersWithoutPasswordModify[0].key).toBe('A-MNT');

        });

        it('should ensure NCC mntners are stripped and duplicates removed', function() {
            var ssoMntners = [
                { type:'mntner', key:'C-MNT', mine:true, auth:['SSO','MD5-PW']}
            ];
            var objectMntners = [
                { type:'mntner', key:'RIPE-NCC-RPSL-MNT', auth:['MD5-PW']},
                { type:'mntner', key:'A-MNT',             auth:['SSO']},
                { type:'mntner', key:'A-MNT',             auth:['SSO']},
                { type:'mntner', key:'RIPE-NCC-END-MNT',  auth:['MD5-PW']},
                { type:'mntner', key:'F-MNT',             auth:['MD5-PW']},
                { type:'mntner', key:'F-MNT',             auth:['MD5-PW']},
                { type:'mntner', key:'C-MNT',             auth:['SSO','MD5-PW']}
            ];

            var mntnersWithoutPasswordCreate = subject.getMntnersNotEligibleForPasswordAuthentication(ssoMntners,[], objectMntners);
            expect(mntnersWithoutPasswordCreate.length).toBe(1);
            expect(mntnersWithoutPasswordCreate[0].key).toBe('A-MNT');

            var mntnersWithoutPasswordModify = subject.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, objectMntners,[]);
            expect(mntnersWithoutPasswordModify.length).toBe(1);
            expect(mntnersWithoutPasswordModify[0].key).toBe('A-MNT');

            var mntnersWithPasswordCreate = subject.getMntnersForPasswordAuthentication(ssoMntners, [], objectMntners);
            expect(mntnersWithPasswordCreate.length).toBe(1);
            expect(mntnersWithPasswordCreate[0].key).toBe('F-MNT');

            var mntnersWithPasswordModify = subject.getMntnersForPasswordAuthentication(ssoMntners, objectMntners, []);
            expect(mntnersWithPasswordModify.length).toBe(1);
            expect(mntnersWithPasswordModify[0].key).toBe('F-MNT');
        });

        it('should return true with single mntner that is RPSL and false otherwise', function() {
            var mntners = [
                { type:'mntner', key:'RIPE-NCC-RPSL-MNT', auth:['MD5-PW']},
                { type:'mntner', key:'A-MNT',             auth:['SSO']},
                { type:'mntner', key:'RIPE-NCC-END-MNT',  auth:['MD5-PW']},
                { type:'mntner', key:'F-MNT',             auth:['MD5-PW']},
                { type:'mntner', key:'C-MNT',             auth:['SSO','MD5-PW']}
            ];
            expect(subject.isLoneRpslMntner(mntners)).toBeFalsy();

            mntners = [
                { type:'mntner', key:'RIPE-NCC-RPSL-MNT', auth:['MD5-PW']}
            ];
            expect(subject.isLoneRpslMntner(mntners)).toBeTruthy();
        });
});
