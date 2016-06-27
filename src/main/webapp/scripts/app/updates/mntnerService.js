/*global angular*/

(function () {
    'use strict';

    angular.module('updates').service('MntnerService', ['$log', 'CredentialsService', 'WhoisResources',

        function ($log, CredentialsService, WhoisResources) {

            var mntnerService = {};

            var nccEndMntner = 'RIPE-NCC-END-MNT';
            var nccHmMntner = 'RIPE-NCC-HM-MNT';

            var nccMntners = [nccHmMntner, nccEndMntner, 'RIPE-NCC-HM-PI-MNT', 'RIPE-GII-MNT', 'RIPE-NCC-MNT', 'RIPE-NCC-RPSL-MNT',
                'RIPE-DBM-MNT', 'RIPE-NCC-LOCKED-MNT', 'RIPE-DBM-UNREFERENCED-CLEANUP-MNT', 'RIPE-ERX-MNT', 'RIPE-NCC-LEGACY-MNT'];

            mntnerService.isSsoAuthorised = function(object, maintainers) {
                var mntBys = object.getAllAttributesOnName('mnt-by');
                var mntLowers = object.getAllAttributesOnName('mnt-lower');
                var ssoAccts = _.filter(maintainers, function(mntner) {
                    return _.find(mntner.auth, function(auth) {
                        return auth === 'SSO';
                    });
                });
                var match = _.find(mntBys.concat(mntLowers), function(item) {
                    return _.find(ssoAccts, function(ssoAcct) {
                        return ssoAcct.key === item.value;
                    });
                });
                return !!match;
            };

            mntnerService.isRemovable = function (mntnerKey) {
                // Should be possible to remove RIPE-NCC-RPSL-MNT, but allowed to add it
                if (mntnerKey.toUpperCase() === 'RIPE-NCC-RPSL-MNT') {
                    return true;
                }
                return !_.includes(nccMntners, mntnerKey.toUpperCase());
            };

            mntnerService.isNccMntner = function (mntnerKey) {
                return _.includes(nccMntners, mntnerKey.toUpperCase());
            };

            mntnerService.isNccEndUserMntner = function (mntnerKey) {
                return nccEndMntner === mntnerKey.toUpperCase();
            };

            mntnerService.isNcHmMntner = function (mntnerKey) {
                return nccHmMntner === mntnerKey.toUpperCase();
            };

            mntnerService.isMntnerOnlist = function (list, mntner) {
                var status = _.any(list, function (item) {
                    return item.key.toUpperCase() === mntner.key.toUpperCase();
                });
                return status;
            };

            mntnerService.hasMd5 = function (mntner) {
                if (_.isUndefined(mntner.auth)) {
                    return false;
                }

                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'MD5');
                });
            };

            mntnerService.isMine = function (mntner) {
                if (!mntner.mine) {
                    return false;
                } else {
                    return mntner.mine;
                }
            };

            mntnerService.hasSSo = function (mntner) {
                if (_.isUndefined(mntner.auth)) {
                    return false;
                }
                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'SSO');
                });
            };

            mntnerService.hasPgp = function (mntner) {
                if (_.isUndefined(mntner.auth)) {
                    return false;
                }
                return _.any(mntner.auth, function (i) {
                    return _.startsWith(i, 'PGP');
                });
            };

            mntnerService.isNew = function (mntner) {
                if (_.isUndefined(mntner.isNew)) {
                    return false;
                }
                return mntner.isNew;
            };

            mntnerService.enrichWithSsoStatus = function (ssoMntners, mntners) {
                return _.map(mntners, function (mntner) {
                    mntner.mine = !!mntnerService.isMntnerOnlist(ssoMntners, mntner);
                    return mntner;
                });
            };

            mntnerService.enrichWithNewStatus = function (originalMntners, actualMntners) {
                return _.map(actualMntners, function (mntner) {
                    mntner.isNew = !mntnerService.isMntnerOnlist(originalMntners, mntner);
                    return mntner;
                });
            };

            mntnerService.enrichWithMine = function (ssoMntners, mntners) {
                return _.map(mntners, function (mntner) {
                    // search in selected list
                    mntner.mine = !!mntnerService.isMntnerOnlist(ssoMntners, mntner);
                    return mntner;
                });
            };

            mntnerService.needsPasswordAuthentication = function (ssoMntners, originalObjectMntners, objectMntners) {
                var input = originalObjectMntners;
                if (originalObjectMntners.length === 0) {
                    // it is a create
                    input = objectMntners;
                }
                var mntners = mntnerService.enrichWithSsoStatus(ssoMntners, input);

                if (mntners.length === 0) {
                    $log.debug('needsPasswordAuthentication: no: No mntners left to authenticate against');
                    return false;
                }

                //do not need password if RIPE-NCC-RPSL-MNT is present
                if (_.some(mntners, {key: 'RIPE-NCC-RPSL-MNT'})) {
                    $log.debug('needsPasswordAuthentication: no: RIPE-NCC-RPSL-MNT is present and do not require authentication');
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
                if (originalObjectMntners.length === 0) {
                    // it is a create
                    input = objectMntners;
                }
                var mntners = mntnerService.enrichWithSsoStatus(ssoMntners, input);

                return _.filter(_.uniq(mntners, 'key'), function (mntner) {
                    if (mntner.mine === true) {
                        return false;
                    } else if (mntnerService.isNccMntner(mntner.key)) {
                        // prevent authenticating against RIPE-NCC mntner
                        return false;
                    } else if (CredentialsService.hasCredentials() && CredentialsService.getCredentials().mntner === mntner.key) {
                        return false;
                    } else if (mntnerService.hasMd5(mntner)) {
                        return true;
                    } else {
                        return false;
                    }
                });
            };

            mntnerService.getMntnersNotEligibleForPasswordAuthentication = function (ssoMntners, originalObjectMntners, objectMntners) {
                // Note: this function is NOT the exact opposite of getMntnersForPasswordAuthentication()
                var input = originalObjectMntners;
                if (originalObjectMntners.length === 0) {
                    // it is a create
                    input = objectMntners;
                }
                var mntners = mntnerService.enrichWithSsoStatus(ssoMntners, input);

                return _.filter(_.uniq(mntners, 'key'), function (mntner) {

                    if (mntner.mine === true) {
                        return false;
                    } else if (mntnerService.isNccMntner(mntner.key)) {
                        // prevent customers contacting us about RIPE-NCC mntners
                        return false;
                    } else if (mntnerService.hasMd5(mntner)) {
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

            mntnerService.stripNccMntners = function (mntners, allowEmptyResult) {
                //remove NCC mntners and dupes
                var stripped = _.reject(mntners, function (mntner) {
                    return (mntnerService.isNccMntner(mntner.key));
                });
                //if we are left with no mntners, return mntners array untouched
                if (_.isEmpty(stripped) && !allowEmptyResult) {
                    return mntners;
                }
                else {
                    return stripped;
                }
            };

            //temporary function to check if only mntner is RPSL
            mntnerService.isLoneRpslMntner = function (mntners) {
                if (mntners.length !== 1) {
                    return false;
                }
                return mntners[0].key.toUpperCase() === 'RIPE-NCC-RPSL-MNT';
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
                        return mntner.key.toUpperCase() === trustedMtnerName.toUpperCase();
                    });
                }
                return false;
            }

            return mntnerService;

        }]);

})();
