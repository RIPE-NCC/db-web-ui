'use strict';

angular.module('dbWebApp')
    .service('MntnerService', ['$log','CredentialsService', function ($log, CredentialsService) {

        this.enrichWithSsoStatus = function (ssoMntners, originalObjectMntners, objectMntners) {
            $log.info("enrichWithSsoStatus.originalObjectMntners:" + JSON.stringify(originalObjectMntners));
            $log.info("enrichWithSsoStatus.objectMntners:" + JSON.stringify(objectMntners));

            var mntners = originalObjectMntners;
            if( originalObjectMntners.length == 0 ) {
                // it is a create
                mntners = objectMntners;
            }
            var result = _.map(mntners, function (mntner) {
                if (_isMntnerOnlist(ssoMntners, mntner)) {
                    mntner.mine = true;
                } else {
                    mntner.mine = false;
                }
                return mntner;
            });

            $log.info("enrichWithSsoStatus.result:" + JSON.stringify(result));

            return result;
        };

        function _isMntnerOnlist(ssoMntners, mntner) {
            var status = _.any(ssoMntners, function (m) {
                return m.key === mntner.key;
            });
            return status;
        }

        this.needsPasswordAuthentication = function (ssoMntners, originalObjectMntners, objectMntners) {
            $log.info("needsPasswordAuthentication.originalObjectMntners:" + JSON.stringify(originalObjectMntners));
            $log.info("needsPasswordAuthentication.objectMntners:" + JSON.stringify(objectMntners));

            var mntners = this.enrichWithSsoStatus(ssoMntners, originalObjectMntners, objectMntners);

            if (_oneOfOriginalMntnersIsMine(mntners)) {
                $log.info("One of selected mntners is mine");
                return false;
            }

            if (_oneOfOriginalMntnersHasCredential(objectMntners)) {
                $log.info("One of selected mntners has credentials");
                return false;
            }

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
            $log.info("getMntnersForPasswordAuthentication.originalObjectMntners:" + JSON.stringify(originalObjectMntners));
            $log.info("getMntnersForPasswordAuthentication.objectMntners:" + JSON.stringify(objectMntners));

            var mntners = this.enrichWithSsoStatus(ssoMntners, originalObjectMntners, objectMntners);

            $log.info("getMntnersForPasswordAuthentication.intermed:" + JSON.stringify(mntners));

           return _.filter(mntners, function(mntner) {
               $log.info("getMntnersForPasswordAuthentication.mntner:" + JSON.stringify(mntner));
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

            $log.info("getMntnersForPasswordAuthentication.result:" + JSON.stringify(result));

            return result;
        };

        function hasMd5(mntner) {
            if(_.isUndefined(mntner.auth)) {
                $log.info("hasMd5.isUndefined:" + JSON.stringify(mntner));
                return false;
            }
            return _.any(mntner.auth, function (i) {
                $log.info("hasMd5.mntners:" + JSON.stringify(i));

                return _.startsWith(i, 'MD5');
            });
        }

    }]);
