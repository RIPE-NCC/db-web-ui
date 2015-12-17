'use strict';

angular.module('webUpdates')
    .service('WebUpdatesCommons', ['$state', '$log', 'WhoisResources', 'CredentialsService', 'AlertService', 'MntnerService', 'ModalService',
        function ($state, $log, WhoisResources, CredentialsService, AlertService, MntnerService, ModalService) {

            this.addLinkToReferenceAttributes = function (attributes, objectSource) {
                var parser = document.createElement('a');
                return _.map(attributes, function(attribute) {
                    if (!_.isUndefined(attribute.link)) {
                        attribute.link.uiHref = _displayUrl(parser, attribute, objectSource);
                    }
                    return attribute;
                } );
            };

            function _displayUrl(parser, attribute, objectSource) {
                parser.href = attribute.link.href;
                var parts = parser.pathname.split('/');

                return $state.href('display', {
                    source: objectSource,
                    objectType: attribute['referenced-type'],
                    name: _.last(parts)
                });
            };

        }]);
