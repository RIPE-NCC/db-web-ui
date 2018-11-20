/*globals beforeEach, describe, expect, inject, it, module */
'use strict';

describe('ConfirmMaintainerComponent', function() {
    var $httpBackend, $state, $componentController;
    var ctrl;

    beforeEach(module('fmp'));

    beforeEach(
        inject(function (_$componentController_, _$state_, _$httpBackend_) {
            $componentController = _$componentController_;
            $state = _$state_;
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET(/.*.html/).respond(200);
            ctrl = $componentController('confirmMaintainer');
        })
    );

    it('should set maintainer and email on valid hash', function() {

        ctrl.$stateParams.hash = 'validhash';
        ctrl.$onInit();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(200,
            {
                mntner: 'maintainer',
                email: 'a@b.c',
                username: 'user',
                expiredDate: 20280808,
                currentUserAlreadyAssociated: false
            }
        );
        $httpBackend.flush();

        expect(ctrl.key).toBe('maintainer');
        expect(ctrl.email).toBe('a@b.c');
        expect(ctrl.user).toBe('user');

        expect(ctrl.AlertService.getErrors().length).toBe(0);
        expect(ctrl.AlertService.getWarnings().length).toBe(0);
        expect(ctrl.AlertService.getInfos().length).toBe(1);
        expect(ctrl.AlertService.getInfos()[0].plainText).toBe('You are logged in with the RIPE NCC Access account user');
    });

    it('should throw an error if hash is not found', function() {
        ctrl.$stateParams.hash = undefined;
        ctrl.$onInit();
        expect(ctrl.AlertService.getErrors().length).toBe(1);
        expect(ctrl.AlertService.getErrors()[0].plainText).toBe('No hash passed along');
    });

    it('should redirect to legacy on invalid hash', function() {
        ctrl.$stateParams.hash = 'invalidhash';
        ctrl.$onInit();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/invalidhash.json').respond(404);
        $httpBackend.flush();

        expect(ctrl.AlertService.getErrors()[0].plainText).toContain('Error fetching email-link');
        expect(ctrl.AlertService.getWarnings().length).toBe(0);
        expect(ctrl.AlertService.getInfos().length).toBe(0);
    });

    it('should redirect to legacy on expired hash', function() {
        ctrl.$stateParams.hash = 'expiredhash';
        ctrl.$onInit();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/expiredhash.json').respond(
            {
                mntner: 'maintainer',
                email: 'a@b.c',
                username: 'user'
            }
        );

        $httpBackend.flush();
        expect(ctrl.AlertService.getErrors().length).toBe(0);
        expect(ctrl.AlertService.getWarnings()[0].plainText).toBe('Your link has expired');
        expect(ctrl.AlertService.getInfos().length).toBe(0);
    });

    it('should parse correctly a date in the future', function() {
        ctrl.$stateParams.hash = 'parsefuturedatestringhash';
        ctrl.$onInit();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/parsefuturedatestringhash.json').respond(
            {
                mntner:'maintainer',
                email:'a@b.c',
                expiredDate: '2114-08-20T02:35:51+02:00',
                username:'user'
            }
        );

        $httpBackend.flush();

        expect(ctrl.key).toBe('maintainer');
        expect(ctrl.email).toBe('a@b.c');
        expect(ctrl.user).toBe('user');

        expect(ctrl.AlertService.getErrors().length).toBe(0);
        expect(ctrl.AlertService.getWarnings().length).toBe(0);
        expect(ctrl.AlertService.getInfos().length).toBe(1);
        expect(ctrl.AlertService.getInfos()[0].plainText).toBe('You are logged in with the RIPE NCC Access account user');
    });

    it('should inform user mntner already associated with current user', function() {
        ctrl.$stateParams.hash = 'validhash';
        ctrl.$onInit();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(200,
            {
                mntner: 'maintainer',
                email: 'a@b.c',
                username: 'user',
                expiredDate: 20280808,
                currentUserAlreadyManagesMntner: true
            }
        );
        $httpBackend.flush();

        expect(ctrl.key).toBe('maintainer');
        expect(ctrl.email).toBe('a@b.c');
        expect(ctrl.user).toBe('user');

        expect(ctrl.AlertService.getErrors().length).toBe(0);
        expect(ctrl.AlertService.getWarnings()[0].plainText).toBe('Your RIPE NCC Access account is already associated with this mntner. You can modify this mntner <a href="#/webupdates/modify/RIPE/mntner/maintainer">here</a>.');
        expect(ctrl.AlertService.getInfos().length).toBe(0);
    });

    it('should return message if associate is cancelled', function() {
        ctrl.$stateParams.hash = 'validhash';
        ctrl.$onInit();

        ctrl.cancelAssociate();
        expect(ctrl.AlertService.getWarnings()[0].plainText).toBe('<p>No changes were made to the <span class="mntner">MNTNER</span> object .</p><p>If you wish to add a different RIPE NCC Access account to your <strong>MNTNER</strong> object:<ol><li>Sign out of RIPE NCC Access.</li><li>Sign back in to RIPE NCC Access with the account you wish to use.</li><li>Click on the link in the instruction email again.</li></ol>');
    });

    it('should return message that linking account with mntner has succeeded', function() {
        ctrl.$stateParams.hash = 'validhash';
        ctrl.$onInit();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(200,
            {
                mntner: 'maintainer',
                email: 'a@b.c',
                username: 'user',
                expiredDate: 20280808,
                currentUserAlreadyManagesMntner: true
            }
        );
        $httpBackend.flush();

        ctrl.associate();
        $httpBackend.whenPUT('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(
            {
                mntner: 'maintainer',
                email: 'a@b.c',
                username: 'user',
                expiredDate: 20280808
            }
        );
        $httpBackend.flush();

        expect($state.current.name).toBe('fmp.ssoAdded');
    });

    it('should return a message that linking account with mntner has failed', function() {
        ctrl.$stateParams.hash = 'validhash';
        ctrl.$onInit();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(200,
            {
                mntner: 'maintainer',
                email: 'a@b.c',
                username: 'user',
                expiredDate: 20280808,
                currentUserAlreadyManagesMntner: true
            }
        );
        $httpBackend.flush();

        ctrl.associate();
        $httpBackend.whenPUT('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(400);
        $httpBackend.flush();

        expect(ctrl.AlertService.getErrors()[0].plainText).toBe(
            '<p>An error occurred while adding the RIPE NCC Access account to the <span class="mntner">MNTNER</span> object.</p>' +
            '<p>No changes were made to the <span class="mntner">MNTNER</span> object maintainer.</p>' +
            '<p>If this error continues, please contact us at <a href="mailto:ripe-dbm@ripe.net">ripe-dbm@ripe.net</a> for assistance.</p>'
        );
    });

    it('should return a message that linking account with mntner has failed already contains SSO', function() {
        ctrl.$stateParams.hash = 'validhash';
        ctrl.$onInit();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(200,
            {
                mntner: 'maintainer',
                email: 'a@b.c',
                username: 'user',
                expiredDate: 20280808,
                currentUserAlreadyManagesMntner: true
            }
        );
        $httpBackend.flush();

        ctrl.associate();
        $httpBackend.whenPUT('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(400, 'already contains SSO');
        $httpBackend.flush();

        expect(ctrl.AlertService.getErrors()[0].plainText).toBe(
            'already contains SSO'
        );
    });
});
