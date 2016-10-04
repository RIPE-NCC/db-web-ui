/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).directive('maintainers', [function () {
        return {
            restrict: 'E',
            scope: {mntners: '=', objectType: '=', attributes: '='},
            templateUrl: 'scripts/wizard/maintainers.html',
            controller: 'MaintainerController'
        };
    }]).controller('MaintainerController', ['$scope', 'jsUtilService', 'AttributeMetadataService', 'MntnerService', 'RestService', 'WebUpdatesCommons', function ($scope, jsUtils, AttributeMetadataService, MntnerService, RestService, WebUpdatesCommons) {

        $scope.mntnerAutocomplete = mntnerAutocomplete;

        $scope.onMntnerAdded = function (item) {
            // enrich with new-flag
            $scope.mntners.object = MntnerService.enrichWithNewStatus($scope.mntners.objectOriginal, $scope.mntners.object);

            mergeMaintainers($scope.attributes, {name: 'mnt-by', value: item.key});

            if (MntnerService.needsPasswordAuthentication($scope.mntners.sso, $scope.mntners.objectOriginal, $scope.mntners.object)) {
                performAuthentication();
            }
            AttributeMetadataService.enrich($scope.objectType, $scope.attributes);
        };

        $scope.onMntnerRemoved = function (item) {

            // don't remove if it's the last one -- just empty it
            var objectMntBys = _.filter($scope.attributes, function (attr) {
                return attr.name === 'mnt-by';
            });
            if (objectMntBys.length > 1) {
                _.remove($scope.attributes, function (i) {
                    return i.name === 'mnt-by' && i.value === item.key;
                });
            } else {
                objectMntBys[0].value = '';
            }
            AttributeMetadataService.enrich($scope.objectType, $scope.attributes);
        };

        RestService.fetchMntnersForSSOAccount().then(handleSsoResponse, handleSsoResponseError);

        function mntnerAutocomplete(query) {
            // need to typed characters
            RestService.autocomplete('mnt-by', query, true, ['auth']).then(
                function (data) {
                    // mark new
                    $scope.mntners.alternatives = MntnerService.stripNccMntners(MntnerService.enrichWithNewStatus($scope.mntners.objectOriginal,
                        filterAutocompleteMntners(enrichWithMine(data))), true);
                }
            );
        }

        function performAuthentication() {
            var authParams = {
                maintainers: $scope.mntners,
                operation: $scope.operation,
                object: {
                    source: $scope.source,
                    type: $scope.objectType,
                    name: $scope.name
                },
                isLirObject: false,
                successClbk: onSuccessfulAuthentication,
                failureClbk: navigateAway
            };
            WebUpdatesCommons.performAuthentication(authParams);
        }

        function onSuccessfulAuthentication() {
            console.log('_onSuccessfulAuthentication');
        }

        function navigateAway() {
            console.log('_navigateAway');
        }

        function handleSsoResponseError() {
            $scope.restCallInProgress = false;
            //console.log('Error fetching mntners for SSO:' + JSON.stringify(error));
            $scope.message = {
                type: 'error',
                text: 'Error fetching maintainers associated with this SSO account'
            };
        }

        function mergeMaintainers(attrs, maintainers) {
            var i;
            var lastIdxOfType = _.findLastIndex(attrs, function (item) {
                return item.name === 'mnt-by';
            });
            if (lastIdxOfType < 0) {
                lastIdxOfType = attrs.length;
            } else if (!attrs[lastIdxOfType].value) {
                attrs.splice(lastIdxOfType, 1);
            }
            if (jsUtils.typeOf(maintainers) === 'object') {
                attrs.splice(lastIdxOfType, 0, maintainers);
            } else {
                for (i = 0; i < maintainers.length; i++) {
                    attrs.splice(lastIdxOfType + i, 0, maintainers[i]);
                }
            }
        }

        function enrichWithMine(mntners) {
            return _.map(mntners, function (mntner) {
                // search in selected list
                mntner.mine = !!MntnerService.isMntnerOnlist($scope.mntners.sso, mntner);
                return mntner;
            });
        }

        function filterAutocompleteMntners(mntners) {
            return _.filter(mntners, function (mntner) {
                // prevent that RIPE-NCC mntners can be added to an object upon create of modify
                // prevent same mntner to be added multiple times
                return !MntnerService.isNccMntner(mntner.key) && !MntnerService.isMntnerOnlist($scope.mntners.object, mntner);
            });
        }

        function handleSsoResponse(results) {
            $scope.restCallInProgress = false;
            $scope.mntners.sso = results;
            if ($scope.mntners.sso.length > 0) {

                $scope.mntners.objectOriginal = [];
                // populate ui-select box with sso-mntners
                $scope.mntners.object = _.cloneDeep($scope.mntners.sso);

                // copy mntners to attributes (for later submit)
                // Etch: hmm, fishy. why not do it later then?
                var mntnerAttrs = _.map($scope.mntners.sso, function (i) {
                    return {
                        name: 'mnt-by',
                        value: i.key
                    };
                });
                mergeMaintainers($scope.attributes, mntnerAttrs);

                //var myMntners = _extractEnrichMntnersFromObject($scope.attributes, $scope.maintainers.sso);
                AttributeMetadataService.enrich($scope.objectType, $scope.attributes);
            }
        }

        function extractEnrichMntnersFromObject(attributes, maintainersSso) {
            // get mntners from response
            var mntnersInObject = _.filter(attributes, function (attr) {
                return attr.name === 'mnt-by';
            });

            // determine if mntner is mine
            var selected = _.map(mntnersInObject, function (mntnerAttr) {
                return {
                    type: 'mntner',
                    key: mntnerAttr.value,
                    mine: _.contains(_.map(maintainersSso, 'key'), mntnerAttr.value)
                };
            });

            return selected;
        }

    }]);

})();
