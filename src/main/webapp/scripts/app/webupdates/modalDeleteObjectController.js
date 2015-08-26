'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$state', '$log', '$modalInstance', 'RestService', 'CredentialsService', 'source', 'objectType', 'name',
    function ($scope, $state, $log, $modalInstance, RestService, CredentialsService, source, objectType, name) {

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
                    $modalInstance.close();

                    $state.transitionTo('deleted', {
                        source: source,
                        objectType: $scope.objectType,
                        name: $scope.name
                    });
                },
                function (error) {
                    $modalInstance.dismiss(error.data);
                }
            );
        };


        function hasNonSelfIncomingRefs(objectType, objectName, incomingRefs) {
            return _.some(incomingRefs, function(ref) {
                return !isEqualTo(objectType, objectName, ref);
            });
        }

        function doCancel() {
            $modalInstance.close();
        };

        function isEqualTo(selfType, selfName, ref) {
            return ref.objectType.toUpperCase() === selfType.toUpperCase() && ref.primaryKey.toUpperCase() === selfName.toUpperCase();
        }

        function displayUrl(ref) {
            return $state.href('display', {
                source: source,
                objectType: ref.objectType,
                name: ref.primaryKey
            });
        };

        function getReferences(source, objectType, name) {
            RestService.getReferences(source, objectType, name) .then(
                function (resp) {
                    $scope.canBeDeleted = isDeletable(resp);
                    $scope.incomingReferences = resp.incoming;
                },
                function (error) {
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
                    $log.info(first.primaryKey + ' is first level self-ref');
                    return true;
                } else {
                    return _.every(first.incoming, function(second) {
                        // secondary incoming references
                        if(isEqualTo(first.objectType, first.primaryKey, second) ) {
                            // self ref
                            $log.info(second.primaryKey + ' is second level self-ref');
                            return true;
                        } else if(isEqualTo(parent.objectType, parent.primaryKey, second) ) {
                            // cross reference with parent
                            $log.info(second.primaryKey + ' is second level cross-ref');
                            return true;
                        } else {
                            $log.info(second.primaryKey + ' is an external ref');
                            return false;
                        }
                    });
                }
            });
            $log.info('objectDeletable:' + objectDeletable);

            return objectDeletable;
        }

    }]);
