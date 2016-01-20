'use strict';

angular.module('dbWebApp')
    .service('MntnerService', ['$log','CredentialsService', 'WhoisResources',
        function ($log, CredentialsService, WhoisResources) {

        var mntnerService = {};

        mntnerService.isRpslMntner = function(mntner) {
            return mntner.key === 'RIPE-NCC-RPSL-MNT';
        };

        mntnerService.isMntnerOnlist = function(list, mntner) {
            var status = _.any(list, function (item) {
                return item.key.toUpperCase() === mntner.key.toUpperCase();
            });
            return status;
        };

        mntnerService.hasMd5 = function(mntner) {
            if (_.isUndefined(mntner.auth)) {
                return false;
            }

            return _.any(mntner.auth, function (i) {
                return _.startsWith(i, 'MD5');
            });
        };

        mntnerService.isMine = function(mntner) {
            if (!mntner.mine) {
                return false;
            } else {
                return mntner.mine;
            }
        };

        mntnerService.hasSSo = function(mntner) {
            if (_.isUndefined(mntner.auth)) {
                return false;
            }
            return _.any(mntner.auth, function (i) {
                return _.startsWith(i, 'SSO');
            });
        };

        mntnerService.hasPgp = function(mntner) {
            if (_.isUndefined(mntner.auth)) {
                return false;
            }
            return _.any(mntner.auth, function (i) {
                return _.startsWith(i, 'PGP');
            });
        };

        mntnerService.isNew = function(mntner) {
            if (_.isUndefined(mntner.isNew)) {
                return false;
            }
            return mntner.isNew;
        };

        mntnerService.enrichWithSsoStatus = function (ssoMntners, mntners) {
            return  _.map(mntners, function (mntner) {
                if (mntnerService.isMntnerOnlist(ssoMntners, mntner)) {
                    mntner.mine = true;
                } else {
                    mntner.mine = false;
                }
                return mntner;
            });
        };

            mntnerService.enrichWithNewStatus = function (originalMntners, actualMntners) {
                return  _.map(actualMntners, function (mntner) {
                    if (mntnerService.isMntnerOnlist(originalMntners, mntner)) {
                        mntner.isNew = false;
                    } else {
                        mntner.isNew = true;
                    }
                    return mntner;
                });
            };

            mntnerService.enrichWithMine = function (ssoMntners, mntners) {
            return _.map(mntners, function (mntner) {
                // search in selected list
                if (mntnerService.isMntnerOnlist(ssoMntners, mntner)) {
                    mntner.mine = true;
                } else {
                    mntner.mine = false;
                }
                return mntner;
            });
        };

        mntnerService.needsPasswordAuthentication = function (ssoMntners, originalObjectMntners, objectMntners) {
            var input = originalObjectMntners;
            if( originalObjectMntners.length === 0 ) {
                // it is a create
                input = objectMntners;
            }
            var mntners = mntnerService.enrichWithSsoStatus(ssoMntners, input);

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

        mntnerService.getMntnersForPasswordAuthentication = function (ssoMntners, originalObjectMntners, objectMntners) {
            var input = originalObjectMntners;
            if( originalObjectMntners.length === 0 ) {
                // it is a create
                input = objectMntners;
            }
            var mntners = mntnerService.enrichWithSsoStatus(ssoMntners, input);

            return  _.filter(mntners, function(mntner) {
                if( mntner.mine === true) {
                    return false;
                } else if( mntnerService.isRpslMntner(mntner)) {
                    // prevent authenticating against RPSL mntner (and later associating everybodies SSO with it)
                    return false;
                } else if( CredentialsService.hasCredentials() && CredentialsService.getCredentials().mntner === mntner.key ) {
                    return false;
                } else if( mntnerService.hasMd5(mntner)) {
                    return true;
                } else {
                    return false;
                }
            });
        };

        mntnerService.getMntnersNotEligibleForPasswordAuthentication = function (ssoMntners, originalObjectMntners, objectMntners) {
            // Note: this function is NOT the exact opposite of getMntnersForPasswordAuthentication()
            var input = originalObjectMntners;
            if( originalObjectMntners.length === 0 ) {
                // it is a create
                input = objectMntners;
            }
            var mntners = mntnerService.enrichWithSsoStatus(ssoMntners, input);

            return  _.filter(mntners, function(mntner) {

                if( mntner.mine === true) {
                    return false;
                } else if( mntnerService.isRpslMntner(mntner)) {
                    // prevent customers contacting us about the RPSL mntner
                    return false;
                } else if( mntnerService.hasMd5(mntner)) {
                    return false;
                } else {
                    return true;
                }
            });
        };

        mntnerService.mntbyDescription = function (objectType) {
            return WhoisResources.getAttributeDescription(objectType, 'mnt-by');
        };

        mntnerService.mntbySyntax = function (objectType) {
            return WhoisResources.getAttributeSyntax(objectType, 'mnt-by');
        };

        function _stripRpslMntner(mntners) {
            return _.filter(mntners, function(mntner) {
                return ! mntnerService.isRpslMntner(mntner);
            });
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
                    return mntner.key.toUpperCase() === trustedMtnerName.toUpperCase();
                });
            }
            return false;
        }

        return mntnerService;

    }]);
