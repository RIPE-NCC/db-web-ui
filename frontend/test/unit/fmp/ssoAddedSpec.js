'use strict';

describe('SsoAddedCtrl', function() {
    var $stateParams, $componentController, $ctrl;

    beforeEach(module('fmp'));

    beforeEach(inject(function (_$componentController_,_$stateParams_) {
        $stateParams =_$stateParams_;
        $componentController = _$componentController_;

    }));

    it('should extract email from url params', function() {
        $stateParams.user = 'userX';

        $stateParams.mntnerKey = 'test@work.net';

        $ctrl = $componentController('ssoAdded', {
            $stateParams: $stateParams
        });

        expect($ctrl.user).toBe('userX');
    });
});
