/*global angular, document*/

(function () {
    'use strict';

    angular.module('dbWebApp').directive('scrollmarker', ['$document', function ($document) {
            return {
                restrict: 'A',
                scope: false,
                link: function (scope, element) {
                    var debounced = _.debounce(function () {
                        scope.$emit('scrollmarker-event');
                        element.addClass('hide');
                    }, 100);
                    var handleScroll = function () {
                        var raw = element[0];
                        if (scope.attributes && scope.nrAttributesToRender < scope.attributes.length) {
                            if (raw.getBoundingClientRect().top < document.documentElement.clientHeight + document.body.scrollTop) {
                                element.removeClass('hide');
                            }
                            debounced();
                        }
                    };
                    angular.element($document).on('scroll', handleScroll);
                }
            };
        }]
    );
})();
