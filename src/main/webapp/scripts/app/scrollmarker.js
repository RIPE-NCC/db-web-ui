'use strict';

angular.module('dbWebApp').directive('scrollmarker', ['$document', function ($document) {
        return {
            restrict: 'A',
            controller: 'CreateModifyController',
            link: function (scope, element) {
                var stillgoing = true;
                var debounced = _.debounce(function () {
                    var raw = element[0];
                    if (raw.getBoundingClientRect().top < document.documentElement.clientHeight + document.body.scrollTop) {
                        stillgoing = scope.showMoreAttributes();
                    } else  if (stillgoing) {
                        // set to false if earlier 'if' path not taken
                        stillgoing = false;
                    }
                    element.addClass('hide');
                }, 100);
                var handleScroll = function () {
                    if (stillgoing) {
                        element.removeClass('hide');
                        debounced();
                    }
                };
                angular.element($document).on('scroll', handleScroll);
            }
        };
    }]
);
