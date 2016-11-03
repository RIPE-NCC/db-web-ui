/*global _, angular*/

(function () {
    'use strict';

    angular.module('updates').service('MntnerService', ['$log', '$q', 'CredentialsService', 'WhoisResources', 'ModalService', 'RestService',

        function ($log, $q, CredentialsService, WhoisResources, ModalService, RestService) {

            var mntnerService = {};

            var nccEndMntner = 'RIPE-NCC-END-MNT';
            var nccHmMntner = 'RIPE-NCC-HM-MNT';
            var nccLegacyMntner = 'RIPE-NCC-LEGACY-MNT';
            var nccRpslMntner = 'RIPE-NCC-RPSL-MNT';

            var nccMntners = [nccHmMntner, nccEndMntner, nccLegacyMntner];

            mntnerService.getAuthForObjectIfNeeded = function (whoisObject, ssoAccts, operation, source, objectType, name) {

                var object = {
                    source: source,
                    type: objectType,
                    name: name
                };
                var promiseHandler = function (resolve, reject) {
                    if (!mntnerService.isSsoAuthorised(whoisObject, ssoAccts)) {
                        // pop up an auth box
                        var mntByAttrs = whoisObject.getAllAttributesOnName('mnt-by');
                        var mntLowerAttrs = whoisObject.getAllAttributesOnName('mnt-lower');

                        var parentMntners = _.map(mntByAttrs.concat(mntLowerAttrs), function (mntner) {
                            return {key: mntner.value};
                        });

                        RestService.detailsForMntners(parentMntners).then(
                            function (enrichedMntners) {
                                var mntnersWithPasswords = mntnerService.getMntnersForPasswordAuthentication(ssoAccts, enrichedMntners, []);
                                var mntnersWithoutPasswords = mntnerService.getMntnersNotEligibleForPasswordAuthentication(ssoAccts, enrichedMntners, []);
                                ModalService.openAuthenticationModal(operation, object, mntnersWithPasswords, mntnersWithoutPasswords, false, null).then(
                                    resolve, reject);
                            },
                            reject
                        );
                    } else {
                        resolve();
                    }
                };
                return $q(promiseHandler);
            };

            mntnerService.isSsoAuthorised = function (object, maintainers) {
                var mntBys = object.getAllAttributesOnName('mnt-by');
                var mntLowers = object.getAllAttributesOnName('mnt-lower');
                var ssoAccts = _.filter(maintainers, function (mntner) {
                    return _.find(mntner.auth, function (auth) {
                        return auth === 'SSO';
                    });
                });
                var match = _.find(mntBys.concat(mntLowers), function (item) {
                    return _.find(ssoAccts, function (ssoAcct) {
                        return ssoAcct.key.toUpperCase() === item.value.toUpperCase();
                    });
                });
                return !!match;
            };

            mntnerService.isRemovable = function (mntnerKey) {
                // Should be possible to remove RIPE-NCC-RPSL-MNT, but allowed to add it
                if (mntnerKey.toUpperCase() === nccRpslMntner) {
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

            mntnerService.isNccHmMntner = function (mntnerKey) {
                return nccHmMntner === mntnerKey.toUpperCase();
            };

            mntnerService.isNccRpslMntner = function (mntnerKey) {
                return nccRpslMntner === mntnerKey.toUpperCase();
            };

            mntnerService.isMntnerOnlist = function (list, mntner) {
                return _.some(list, function (item) {
                    return item.key.toUpperCase() === mntner.key.toUpperCase();
                });
            };

            mntnerService.hasNccMntner = function (mntnerList) {
                return _.some(mntnerList, function (mntner) {
                    return mntnerService.isNccMntner(mntner);
                });
            };

            mntnerService.hasMd5 = function (mntner) {
                if (_.isUndefined(mntner.auth)) {
                    return false;
                }

                return _.some(mntner.auth, function (i) {
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
                return _.some(mntner.auth, function (i) {
                    return _.startsWith(i, 'SSO');
                });
            };

            mntnerService.hasPgp = function (mntner) {
                if (_.isUndefined(mntner.auth)) {
                    return false;
                }
                return _.some(mntner.auth, function (i) {
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
                if (_.some(mntners, {key: nccRpslMntner})) {
                    $log.debug('needsPasswordAuthentication: no: RIPE-NCC-RPSL-MNT is present and does not require authentication');
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
                $log.debug('needsPasswordAuthentication: yes');

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
                    } else if (mntnerService.isNccMntner(mntner.key) || mntnerService.isNccRpslMntner(mntner.key)) {
                        // prevent authenticating against RIPE-NCC mntner
                        return false;
                    } else if (CredentialsService.hasCredentials() && CredentialsService.getCredentials().mntner === mntner.key) {
                        return false;
                    } else {
                        return mntnerService.hasMd5(mntner);
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
                    } else {
                        return !mntnerService.hasMd5(mntner);
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
                return mntners[0].key.toUpperCase() === nccRpslMntner;
            };

            function _oneOfOriginalMntnersIsMine(originalObjectMntners) {
                return _.some(originalObjectMntners, function (mntner) {
                    return mntner.mine === true;
                });
            }

            function _oneOfOriginalMntnersHasCredential(originalObjectMntners) {
                if (CredentialsService.hasCredentials()) {
                    var trustedMtnerName = CredentialsService.getCredentials().mntner;
                    return _.some(originalObjectMntners, function (mntner) {
                        return mntner.key.toUpperCase() === trustedMtnerName.toUpperCase();
                    });
                }
                return false;
            }

            return mntnerService;

        }]);

})();
