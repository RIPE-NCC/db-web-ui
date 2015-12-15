'use strict';

angular.module('textUpdates')
    .controller('TextCreateController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$cookies', 'WhoisResources', 'RestService', 'AlertService',
        function ($scope, $stateParams, $state, $resource, $log, $cookies, WhoisResources, RestService, AlertService) {

            $scope.TOTAL_ATTR_LENGTH = 15;

            $scope.submit = submit;

            _initialisePage();

            function _initialisePage() {
                AlertService.clearErrors();

                $scope.restCalInProgress = false;

                $cookies.put('ui-mode','textupdates');

                // extract parameters from the url
                $scope.object = {}
                $scope.object.source = $stateParams.source;
                $scope.object.type = $stateParams.objectType;
                $scope.object.name = decodeURIComponent($stateParams.name);

                $log.debug('TextUpdatesController: Url params:' +
                    ' object.source:'+ $scope.object.source +
                    ', object.type:' + $scope.object.type +
                    ', object.name:' + $scope.object.name  );

               _prepulateText();

            };

            function submit() {
                $scope.restCalInProgress = true;
            }

            function _prepulateText() {
                var mandatoryAttributesOnObjectType = WhoisResources.getMandatoryAttributesOnObjectType($scope.object.type);
                if (_.isEmpty(mandatoryAttributesOnObjectType)) {
                    $state.transitionTo('notFound');
                    return;
                }

                var attributes = WhoisResources.wrapAndEnrichAttributes($scope.object.type, mandatoryAttributesOnObjectType);

                _enrich(attributes);

                $scope.object.rpsl = _toRpsl(attributes);

            }

            function _enrich(attributes) {
                attributes.setSingleAttributeOnName('source', $scope.object.source);
                attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                attributes.setSingleAttributeOnName('organisation', 'AUTO-1');
                // other org-types only settable with override
                attributes.setSingleAttributeOnName('org-type', 'OTHER');
            }

            function _toRpsl( attributes ) {
                var data = '';
                _.each(attributes, function(item) {
                    $log.error('name:'+item.name + " value:" + item.value);
                    data = data.concat(_.padRight(item.name+':', $scope.TOTAL_ATTR_LENGTH, ' '));
                    if(!_.isUndefined(item.value)) {
                        data = data.concat(item.value);

                    }
                    data = data.concat('\n');
                });
                return data;
            }

        }]);
