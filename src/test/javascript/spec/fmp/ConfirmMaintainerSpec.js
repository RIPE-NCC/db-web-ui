'use strict';

describe('ConfirmMaintainerCtrl', function() {
    var $httpBackend, $stateParams, $scope, EmailLink, $controller, $location;

    beforeEach(module('fmp'));

    beforeEach(inject(function (_$rootScope_, _$controller_, _$location_, _$stateParams_, _EmailLink_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();
        EmailLink = _EmailLink_;
        $location = _$location_;
        $stateParams = _$stateParams_;
        $controller = _$controller_;

    }));

    it('should set maintainer and email on valid hash', function() {

        $stateParams.hash = 'validhash';

        $controller('ConfirmMaintainerCtrl', {
            $scope:$scope,
            $location: $location,
            $stateParams: $stateParams,
            EmailLink: EmailLink
        });
        $httpBackend.whenGET(/.*.html/).respond(200);
        //                   GET /db-web-ui/api/whois-internal/api/fmp-pub/emaillink/validhash.json
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
        expect($scope.state).toBe('init');
    });

    it('should redirect to legacy on invalid hash', function() {
        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/invalidhash.json').respond(404);
        $stateParams.hash = 'invalidhash';
        spyOn($location, 'path');
        $controller('ConfirmMaintainerCtrl', {$scope:$scope,
            $location: $location,
            $stateParams: $stateParams,
            EmailLink: EmailLink});

        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.expectGET(/invalidhash/).respond(200);
        $httpBackend.flush();

        expect($location.path).toHaveBeenCalledWith('/legacy');
        expect($scope.key).not.toBeDefined();
    });

    it('should presaent a message when not logged in', function() {
        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(403);
        $stateParams.hash = 'validhash';
        spyOn($location, 'path');
        $controller('ConfirmMaintainerCtrl', {$scope:$scope,
            $location: $location,
            $stateParams: $stateParams,
            EmailLink: EmailLink});

        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.expectGET(/validhash/);
        $httpBackend.flush();

        expect($scope.state).toBe('notloggedin');

    });

    it('should redirect to legacy on expired hash', function() {
        $stateParams.hash = 'expiredhash';
        spyOn($location, 'path');
        $controller('ConfirmMaintainerCtrl', {$scope:$scope,
            $location: $location,
            $stateParams: $stateParams,
            EmailLink: EmailLink});

        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/expiredhash.json').respond(
            {
                mntner: 'maintainer',
                email: 'a@b.c',
                username: 'user'
            }
        );

        $httpBackend.flush();
        expect($location.path).toHaveBeenCalledWith('/legacy');
        expect($scope.key).not.toBeDefined();
    });

    it('should parse correctly a date in the future', function() {
        $stateParams.hash = 'parsefuturedatestringhash';

        $controller('ConfirmMaintainerCtrl', {$scope:$scope,
            $location: $location,
            $stateParams: $stateParams,
            EmailLink: EmailLink});

        $httpBackend.whenGET(/.*.html/).respond(200);
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
        expect($scope.state).toBe('init');

    });

    it('should inform user mntner already associated with current user', function() {
        $stateParams.hash = 'validhash';

        $controller('ConfirmMaintainerCtrl', {
            $scope:$scope,
            $location: $location,
            $stateParams: $stateParams,
            EmailLink: EmailLink});
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(
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
        expect($scope.user).toBe('user')
        expect($scope.state).toBe('currentUserAlreadyManagesMntner');
    });

    it('should return message if associate is cancelled', function() {
        $controller('ConfirmMaintainerCtrl', {$scope:$scope,
            $location: $location,
            $stateParams: $stateParams,
            EmailLink: EmailLink});

        $scope.cancelAssociate();

        expect($scope.state).toBe('cancel');
    });

    it('should return message that linking account with mntner has succeeded', function() {
        $scope.state = 'init';
        $scope.localHash = 'validhash';
        $controller('ConfirmMaintainerCtrl', {$scope:$scope,
            $location: $location,
            $stateParams: $stateParams,
            EmailLink: EmailLink});
        $httpBackend.whenGET(/.*.html/).respond(200);

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

        expect($scope.state).toBe('success');
    });

    it('should return a message that linking account with mntner has failed', function() {

        $scope.state = 'init';
        $scope.localHash = 'validhash';
        $controller('ConfirmMaintainerCtrl', {$scope:$scope,
            $location: $location,
            $stateParams: $stateParams,
            EmailLink: EmailLink});
        $httpBackend.whenGET(/.*.html/).respond(200);

        $scope.associate();
        $httpBackend.whenPUT('api/whois-internal/api/fmp-pub/emaillink/validhash.json').respond(400);
        $httpBackend.flush();

        expect($scope.state).toBe('fail');
    });
});
