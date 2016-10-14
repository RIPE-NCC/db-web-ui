'use strict';

angular.module('webUpdates').controller('ModalCreateRoleController', [ '$scope', '$state', '$log', '$modalInstance', 'RestService', 'CredentialsService', 'WhoisResources', 'MessageStore', 'source', 'objectType', 'name',
    function ($scope, $state, $log, $modalInstance, RestService, CredentialsService, WhoisResources, MessageStore, source, objectType, name) {

        $scope.MAX_REFS_TO_SHOW = 5;

        $scope.objectType = objectType;
        $scope.name = name;
        $scope.reason = 'I don\'t need this object';
        $scope.incomingReferences = undefined;
        $scope.canBeDeleted = undefined;

        $scope.doDelete = doDelete;
        $scope.doCancel = doCancel;
        $scope.displayUrl = displayUrl;
        $scope.isEqualTo = isEqualTo;
        $scope.isDeletable = isDeletable;
        $scope.hasNonSelfIncomingRefs = hasNonSelfIncomingRefs;
        $scope.restCallInProgress = false;

        _initialisePage();

        function _initialisePage() {
            getReferences(source, $scope.objectType, $scope.name);
        }

        function doDelete() {
            if( !$scope.canBeDeleted) {
                return;
            }

            var deleteWithRefs = hasNonSelfIncomingRefs($scope.objectType, $scope.name, $scope.incomingReferences);

            var password;
            if( CredentialsService.hasCredentials() ) {
                password = CredentialsService.getCredentials().successfulPassword;
            }

            RestService.deleteObject(source, $scope.objectType, $scope.name, $scope.reason, deleteWithRefs, password).then(
                function (resp ) {
                    var whoisResources = WhoisResources.wrapWhoisResources(resp);
                    $modalInstance.close(whoisResources);
                },
                function (error) {
                    $modalInstance.dismiss(error.data);
                }
            );
        }


        function hasNonSelfIncomingRefs(objectType, objectName, incomingRefs) {
            return _.some(incomingRefs, function(ref) {
                return !isEqualTo(objectType, objectName, ref);
            });
        }

        function doCancel() {
            $modalInstance.close();
            _transitionToModifyObject(source, $scope.objectType, $scope.name);
        }

        function isEqualTo(selfType, selfName, ref) {
            return ref.objectType.toUpperCase() === selfType.toUpperCase() && ref.primaryKey.toUpperCase() === selfName.toUpperCase();
        }

        function displayUrl(ref) {
            return $state.href('display', {
                source: source,
                objectType: ref.objectType,
                name: ref.primaryKey
            });
        }

        function getReferences(source, objectType, name) {
            $scope.restCallInProgress = true;
            RestService.getReferences(source, objectType, name, $scope.MAX_REFS_TO_SHOW) .then(
                function (resp) {
                    $scope.restCallInProgress = false;
                    $scope.canBeDeleted = isDeletable(resp);
                    $scope.incomingReferences = resp.incoming;
                },
                function (error) {
                    $scope.restCallInProgress = false;
                    $modalInstance.dismiss(error.data);
                }
            );
        }

        function isDeletable(parent) {
            if(_.isUndefined(parent) || _.isUndefined(parent.objectType)) {
                return false;
            }
            // parent is the object we asked references for
            var objectDeletable = _.every(parent.incoming, function( first ) {
                // direct incoming references
                if(isEqualTo(parent.objectType,parent.primaryKey, first) ) {
                    // self ref
                    $log.debug(first.primaryKey + ' is first level self-ref');
                    return true;
                } else {
                    return _.every(first.incoming, function(second) {
                        // secondary incoming references
                        if(isEqualTo(first.objectType, first.primaryKey, second) ) {
                            // self ref
                            $log.debug(second.primaryKey + ' is second level self-ref');
                            return true;
                        } else if(isEqualTo(parent.objectType, parent.primaryKey, second) ) {
                            // cross reference with parent
                            $log.debug(second.primaryKey + ' is second level cross-ref');
                            return true;
                        } else {
                            $log.debug(second.primaryKey + ' is an external ref');
                            return false;
                        }
                    });
                }
            });
            $log.debug('objectDeletable:' + objectDeletable);

            return objectDeletable;
        }

        function _transitionToModifyObject(source, objectType, pkey) {
            $state.transitionTo('modify', {
                source: source,
                objectType: objectType,
                name: pkey
            });
        }
    }]);
