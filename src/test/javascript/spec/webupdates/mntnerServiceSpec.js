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

        var enrichedCreate = subject.enrichWithSsoStatus(ssoMntners, [], objectMntners);

        expect(enrichedCreate.length).toBe(2);

        expect(enrichedCreate[0].type).toBe('mntner');
        expect(enrichedCreate[0].key).toBe('A-MNT');
        expect(enrichedCreate[0].mine).toBe(true);

        expect(enrichedCreate[1].type).toBe('mntner');
        expect(enrichedCreate[1].key).toBe('C-MNT');
        expect(enrichedCreate[1].mine).toBe(false);

        var enrichedModify = subject.enrichWithSsoStatus(ssoMntners, [], objectMntners);

        expect(enrichedModify.length).toBe(2);

        expect(enrichedModify[0].type).toBe('mntner');
        expect(enrichedModify[0].key).toBe('A-MNT');
        expect(enrichedModify[0].mine).toBe(true);

        expect(enrichedModify[1].type).toBe('mntner');
        expect(enrichedModify[1].key).toBe('C-MNT');
        expect(enrichedModify[1].mine).toBe(false);
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

    it('get mntners that suport password auth', function() {
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
});
