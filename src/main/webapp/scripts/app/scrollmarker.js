'use strict';

angular.module('dbWebApp').directive('scrollmarker', ['$document', function ($document) {
        return {
            restrict: 'A',
            scope: false,
            controller: 'CreateModifyController',
            link: function (scope, element) {
                var debounced = _.debounce(function () {
                    var raw = element[0];
                    if (raw.getBoundingClientRect().top < document.documentElement.clientHeight + document.body.scrollTop) {
                        scope.$emit('scrollmarker-event');
                    }
                    element.addClass('hide');
                }, 100);
                var handleScroll = function () {
                    element.removeClass('hide');
                    debounced();
                };
                angular.element($document).on('scroll', handleScroll);
            }
        };
    }]
);
