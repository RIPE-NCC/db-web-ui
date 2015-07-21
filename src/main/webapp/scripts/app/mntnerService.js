'use strict';

angular.module('dbWebApp')
    .service('MntnerService', ['$log','CredentialsService', function ($log, CredentialsService) {

        this.enrichWithSsoStatus = function (ssoMntners, mntners) {
            console.log("enrichWithSsoStatus.mntners:" + JSON.stringify(mntners));
            var result =  _.map(mntners, function (mntner) {
                if (_isMntnerOnlist(ssoMntners, mntner)) {
                    mntner.mine = true;
                } else {
                    mntner.mine = false;
                }
                return mntner;
            });
            console.log("enrichWithSsoStatus.result:" + JSON.stringify(result));

            return result;
        };

        function _isMntnerOnlist(ssoMntners, mntner) {
            var status = _.any(ssoMntners, function (m) {
                return m.key === mntner.key;
            });
            return status;
        }

        this.needsPasswordAuthentication = function (ssoMntners, originalObjectMntners, objectMntners) {
            var input = originalObjectMntners;
            if( originalObjectMntners.length == 0 ) {
                // it is a create
                input = objectMntners;
            }
            var mntners = this.enrichWithSsoStatus(ssoMntners, input);
            console.log("needsPasswordAuthentication.mntners:" + JSON.stringify(mntners));

            if (_oneOfOriginalMntnersIsMine(mntners)) {
                console.log("needsPasswordAuthentication: One of selected mntners is mine");
                return false;
            }

            if (_oneOfOriginalMntnersHasCredential(mntners)) {
                console.log("needsPasswordAuthentication: One of selected mntners has credentials");
                return false;
            }
            console.log("needsPasswordAuthentication.no:");

            return true;
        };

        function _oneOfOriginalMntnersIsMine(originalObjectMntners) {
            return _.any(originalObjectMntners, function (mntner) {
                return mntner.mine === true;
            });
        }

        function _oneOfOriginalMntnersHasCredential(originalObjectMntners) {
            if (CredentialsService.hasCredentials()) {
                var trustedMtnerName = CredentialsService.getCredentials().mntner;
                return _.any(originalObjectMntners, function (mntner) {
                    return mntner.key === trustedMtnerName;
                });
            }
            return false;
        }

        this.getMntnersForPasswordAuthentication = function (ssoMntners, originalObjectMntners, objectMntners) {
            var input = originalObjectMntners;
            if( originalObjectMntners.length == 0 ) {
                // it is a create
                input = objectMntners;
            }
            var objectMntners = this.enrichWithSsoStatus(ssoMntners, input);

            return _.filter(input   , function(mntner) {
                if( mntner.mine === true) {
                    return false;
                } else if( CredentialsService.hasCredentials() && CredentialsService.getCredentials().mntner === mntner.key ) {
                    return false;
                } else if( hasMd5(mntner)) {
                    return true;
                } else {
                    return false;
                }
            });
        };

        function hasMd5(mntner) {
            if(_.isUndefined(mntner.auth)) {
                return false;
            }
            return _.any(mntner.auth, function (i) {
                return _.startsWith(i, 'MD5');
            });
        }

    }]);
