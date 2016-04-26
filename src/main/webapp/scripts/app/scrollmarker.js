'use strict';

angular.module('dbWebApp').directive('scrollmarker', ['$document', function ($document) {
        return {
            restrict: 'A',
            controller: 'CreateModifyController',
            link: function (scope, element) {
                var debounced = _.debounce(function () {
                    var raw = element[0];
                    if (raw.getBoundingClientRect().top < document.documentElement.clientHeight + document.body.scrollTop) {
                        scope.showMoreAttributes();
                    }
                    element.addClass('hide');
                }, 100);
                var handleScroll = function () {
                    if (!scope.attributesAllRendered) {
                        element.removeClass('hide');
                        debounced();
                    }
                };
                angular.element($document).on('scroll', handleScroll);
            }
        };
    }]
);
