'use strict';

angular.module('webUpdates').controller('ModalDeleteObjectController', [ '$scope', '$state', '$log', '$modalInstance', 'RestService', 'source', 'objectType', 'name',
    function ($scope, $state, $log, $modalInstance, RestService, source, objectType, name) {

        $scope.reason = 'I don\'t need this object';
        $scope.objectType = objectType;
        $scope.name = name;
        $scope.referencesInfo = undefined;
        $scope.isPartOfSimplePair = undefined;

        $scope.doDelete = doDelete;
        $scope.doCancel = doCancel;
        $scope.displayUrl = displayUrl;
        $scope.primaryKey = primaryKey;
        $scope.isEqualTo = isEqualTo;
        $scope.canBeDeleted = canBeDeleted;

        _initialisePage();

        function _initialisePage() {
            getReferences(source, $scope.objectType, $scope.name);
        }

        function doDelete() {
            if( !canBeDeleted($scope.referencesInfo)) {
                return;
            }

            var deleteWithRefs = isSimpleCrossReference($scope.objectType, $scope.name, $scope.referencesInfo.references);

            RestService.deleteObject(source, $scope.objectType, $scope.name, $scope.reason, deleteWithRefs).then(
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

        function doCancel() {
            $modalInstance.close();
        };

        function displayUrl(ref) {
            return $state.href('display', {
                source: source,
                objectType: ref.type,
                name: $scope.primaryKey(ref)
            });
        };

        function primaryKey(ref) {
            var pkey = ref.primaryKey[0].value;

            for (var i = 1; i < ref.primaryKey.length; i++) {
                pkey = pkey + ref.primaryKey[i].value;
            }

            return pkey.toUpperCase();
        };

        function hasReferences(referencesInfo) {
            if( !referencesInfo || !referencesInfo.references) {
                //$log.info("hasReferences: No reference data available yet")
                return false;
            }
            if (referencesInfo.references.length === 0) {
                //$log.info(selfName +'hasReferences: Has no references')
                return false;
            }
            return true;
        }

        function isReferencedOnlyBySelf(selfType, selfName, references) {
            // typical case: self referenced mntner
            var selfOnly =  _.every( references, function(ref) {
                return $scope.isEqualTo(selfType, selfName, ref);
            });
            //$log.info(selfName + ' isReferencedOnlyBySelf:' + selfOnly );
            return selfOnly;
        }

        function isRefMntBySelf( selfType, selfName, ref ) {
            var mntBySelf = false;
            if (selfType === 'mntner') {
                mntBySelf =  _.any( ref.attributes, function(attr) {
                    if( attr.name === 'mnt-by' && attr.value === selfName ) {
                        return true;
                    }
                });
            }
            //$log.info(selfName + ' isRefMntBySelf:' + mntBySelf );
            return mntBySelf;
        }

        function isRefAdmninedBySelf(selfType, selfName, ref ) {
            var adminedBySelf = false;
            if (selfType === 'role' || selfType === 'person'  ) {
                adminedBySelf = _.any( ref.attributes, function(attr) {
                    if( attr.name === 'admin-c' && attr.value === selfName ) {
                        return true;
                    }
                });
            }
            //$log.info(selfName + ' isRefAdmninedBySelf:' + adminedBySelf );
            return adminedBySelf;
        }

        function isSimpleCrossReference(selfType, selfName, references) {
            // typical case: mntner person pair
            if( !references || references.length === 0 ) {
                //$log.info('Not referenced' );
                return false;
            }

            if( references.length > 1 ) {
                //$log.info('Referenced by multiple objects' );
                return false;
            }

            // order does matter here: check for isPartOfPair before peforming other checks
            if( !_.isUndefined($scope.isPartOfSimplePair)) {
                //$log.info("Is part of a pair: " + $scope.isPartOfPair);
                return $scope.isPartOfSimplePair;
            }

            if( isReferencedOnlyBySelf(selfType, selfName, references) ) {
                return false;
            }

            if( isRefMntBySelf(selfType, selfName, references[0])) {
                return true;
            }

            if( isRefAdmninedBySelf(selfType, selfName, references[0])) {
                return true;
            }

            return false;
        }

        function isEqualTo(selfType, selfName, ref) {
            return ref.type.toUpperCase() === selfType.toUpperCase() && $scope.primaryKey(ref) === selfName.toUpperCase();
        }

        function canBeDeleted(referencesInfo) {
            if( hasReferences(referencesInfo) == false) {
                return true;
            }

            if( isReferencedOnlyBySelf($scope.objectType, $scope.name, $scope.referencesInfo.references)) {
                return true;
            }

            if( isSimpleCrossReference($scope.objectType, $scope.name, $scope.referencesInfo.references) ) {
                return true;
            }

            return false;
        };

        function getReferences(source, objectType, name) {
            RestService.getReferences(source, objectType, name) .then(
                function (resp) {
                    if( isSimpleCrossReference( $scope.objectType, $scope.name, resp.references)) {
                        // fetch its pair object as well
                        var otherType = resp.references[0].type;
                        var otherName = primaryKey(resp.references[0]);
                        getReferencesForPeer(source, otherType, otherName);
                    }
                    $scope.referencesInfo = resp;
                },
                function (error) {
                    $modalInstance.dismiss(error.data);
                }
            );
        }

        function getReferencesForPeer(source, otherType, otherName) {
            $log.info('*** Looks like a simple cross reference: check ' + otherType + '-peer ' + otherName);
            RestService.getReferences(source, otherType,otherName).then(
                function( resp ) {
                    if( isSimpleCrossReference(otherType, otherName, resp.references) ) {
                        $log.info('*** *** ' + name + ' and ' + otherName + ' are simply cross referenced');
                        $scope.isPartOfSimplePair = true;
                    } else {
                        $log.info('*** *** *** ' + name + ' and ' + otherName + ' are NOT a simply cross referenced');
                        $scope.isPartOfSimplePair = false;
                    }
                }
            );
        }

    }]);
