'use strict';

describe('ConfirmMaintainerCtrl', function() {
    var $httpBackend, $stateParams, $scope, $state, EmailLink, $controller, AlertService;
    var startController;

    beforeEach(module('fmp'));

    beforeEach(inject(function (_$rootScope_, _$controller_, _$state_, _$stateParams_, _EmailLink_, _$httpBackend_, _AlertService_) {
        $scope = _$rootScope_.$new();
        $controller = _$controller_;
        $stateParams = _$stateParams_;
        $state = _$state_;
        $httpBackend = _$httpBackend_;
        EmailLink = _EmailLink_;
        AlertService =_AlertService_;

        startController = function(stateParams) {
            $controller('ConfirmMaintainerCtrl', {
                $scope:$scope,
                $stateParams: stateParams,
                $state: $state,
                EmailLink: EmailLink
            });
            $httpBackend.whenGET(/.*.html/).respond(200);
        }

    }));

    it('should set maintainer and email on valid hash', function() {

        $stateParams.hash = 'validhash';

        startController($stateParams);

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

        expect($scope.key).toBe('maintainer');
        expect($scope.email).toBe('a@b.c');
        expect($scope.user).toBe('user');

        expect(AlertService.getErrors().length).toBe(0);
        expect(AlertService.getWarnings().length).toBe(0);
        expect(AlertService.getInfos().length).toBe(0);
    });

    it('should redirect to legacy on invalid hash', function() {
        $stateParams.hash = 'invalidhash';

        startController($stateParams);

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/invalidhash.json').respond(404);
        $httpBackend.flush();

        expect(AlertService.getErrors()[0].plainText).toBe('Error fetching email-link');
        expect(AlertService.getWarnings().length).toBe(0);
        expect(AlertService.getInfos().length).toBe(0);
    });

    it('should redirect to legacy on expired hash', function() {
        $stateParams.hash = 'expiredhash';

        startController($stateParams);

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/expiredhash.json').respond(
            {
                mntner: 'maintainer',
                email: 'a@b.c',
                username: 'user'
            }
        );

        $httpBackend.flush();
        expect(AlertService.getErrors().length).toBe(0);
        expect(AlertService.getWarnings()[0].plainText).toBe('Your link has expired');
        expect(AlertService.getInfos().length).toBe(0);
    });

    it('should parse correctly a date in the future', function() {
        $stateParams.hash = 'parsefuturedatestringhash';

        startController($stateParams);

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/parsefuturedatestringhash.json').respond(
            {
                mntner:'maintainer',
                email:'a@b.c',
                expiredDate: '2114-08-20T02:35:51+02:00'
            }
        );

        $httpBackend.flush();

        expect($scope.key).toBe('maintainer');
        expect($scope.email).toBe('a@b.c');

        expect(AlertService.getErrors().length).toBe(0);
        expect(AlertService.getWarnings().length).toBe(0);
        expect(AlertService.getInfos().length).toBe(0);
    });

    it('should inform user mntner already associated with current user', function() {
        $stateParams.hash = 'validhash';

        startController($stateParams);

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

        expect($scope.key).toBe('maintainer');
        expect($scope.email).toBe('a@b.c');
        expect($scope.user).toBe('user');

        expect(AlertService.getErrors().length).toBe(0);
        expect(AlertService.getWarnings()[0].plainText).toBe('Your RIPE NCC Access account is already associated with this mntner. You can modify this mntner');
        expect(AlertService.getInfos().length).toBe(0);
    });

    it('should return message if associate is cancelled', function() {
        $stateParams.hash = 'validhash';

        startController($stateParams);

        $scope.cancelAssociate();

        expect(AlertService.getWarnings()[0].plainText).toBe('<p>No changes were made to the <span class="mntner">MNTNER</span> object .</p><p>If you wish to add a different RIPE NCC Access account to your <strong>MNTNER</strong> object:<ol><li>Sign out of RIPE NCC Access.</li><li>Sign back in to RIPE NCC Access with the account you wish to use.</li><li>Click on the link in the instruction email again.</li></ol>');
    });

    it('should return message that linking account with mntner has succeeded', function() {
        $stateParams.hash = 'validhash';

        startController($stateParams);

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

        $scope.associate();
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
        $stateParams.hash = 'validhash';

        startController($stateParams);

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

        $scope.associate();
        $httpBackend.whenPUT('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(400);
        $httpBackend.flush();

        expect(AlertService.getErrors()[0].plainText).toBe(
            '<p>An error occurred while adding the RIPE NCC Access account to the <span class="mntner">MNTNER</span> object.</p>' +
            '<p>No changes were made to the <span class="mntner">MNTNER</span> object maintainer.</p>' +
            '<p>If this error continues, please contact us at <a href="mailto:ripe-dbm@ripe.net">ripe-dbm@ripe.net</a> for assistance.</p>'
        );
    });
});
