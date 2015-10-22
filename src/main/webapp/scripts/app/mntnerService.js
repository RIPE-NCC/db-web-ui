'use strict';

angular.module('dbWebApp')
    .service('MntnerService', ['$log','CredentialsService', function ($log, CredentialsService) {

        this.enrichWithSsoStatus = function (ssoMntners, mntners) {
            return  _.map(mntners, function (mntner) {
                if (_isMntnerOnlist(ssoMntners, mntner)) {
                    mntner.mine = true;
                } else {
                    mntner.mine = false;
                }
                return mntner;
            });
        };

        this.enrichWithNewStatus = function (originalMntners, actualMntners) {
            return  _.map(actualMntners, function (mntner) {
                if (_isMntnerOnlist(originalMntners, mntner)) {
                    mntner.isNew = false;
                } else {
                    mntner.isNew = true;
                }
                return mntner;
            });
        };

        this.needsPasswordAuthentication = function (ssoMntners, originalObjectMntners, objectMntners) {
            var input = originalObjectMntners;
            if( originalObjectMntners.length === 0 ) {
                // it is a create
                input = objectMntners;
            }
            var mntners = this.enrichWithSsoStatus(ssoMntners, input);

            // ignore rpsl mntner while deciding if password authent. is needed
            mntners = _stripRpslMntner(mntners);
            if( mntners.length === 0 ) {
                $log.debug('needsPasswordAuthentication: no: No mntners left to authenticate against');
                return false;
            }

            if (_oneOfOriginalMntnersIsMine(mntners)) {
                $log.debug('needsPasswordAuthentication: no: One of selected mntners is mine');
                return false;
            }

            if (_oneOfOriginalMntnersHasCredential(mntners)) {
                $log.debug('needsPasswordAuthentication: no: One of selected mntners has credentials');
                return false;
            }
            $log.debug('needsPasswordAuthentication.yes:');

            return true;
        };

        this.getMntnersForPasswordAuthentication = function (ssoMntners, originalObjectMntners, objectMntners) {
            var input = originalObjectMntners;
            if( originalObjectMntners.length === 0 ) {
                // it is a create
                input = objectMntners;
            }
            var mntners = this.enrichWithSsoStatus(ssoMntners, input);

            return  _.filter(mntners, function(mntner) {
                if( mntner.mine === true) {
                    return false;
                } else if( _isRpslMntner(mntner)) {
                    // prevent authenticating against RPSL mntner (and later associating everybodies SSO with it)
                    return false;
                } else if( CredentialsService.hasCredentials() && CredentialsService.getCredentials().mntner === mntner.key ) {
                    return false;
                } else if( _hasMd5(mntner)) {
                    return true;
                } else {
                    return false;
                }
            });
        };

        function _stripRpslMntner(mntners) {
            return _.filter(mntners, function(mntner) {
                return !_isRpslMntner(mntner);
            });
        }

        function _isRpslMntner(mntner) {
            return mntner.key === 'RIPE-NCC-RPSL-MNT';
        }

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

        function _isMntnerOnlist(list, mntner) {
            var status = _.any(list, function (item) {
                return item.key === mntner.key;
            });
            return status;
        }

        function _hasMd5(mntner) {
            if(_.isUndefined(mntner.auth)) {
                return false;
            }
            return _.any(mntner.auth, function (i) {
                return _.startsWith(i, 'MD5');
            });
        }

    }]);
