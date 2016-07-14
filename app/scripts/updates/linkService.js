'use strict';

angular.module('updates')
    .service('LinkService', [function () {

        var linkService = {};

        linkService.getDisplayUrl = function ( source, type, name ) {
            return '/db-web-ui/#/webupdates/display/'+ source + '/' + type + '/' + name;
        };

        linkService.getLink = function ( source, type, name ) {
            return '<a target="_blank" href="' + linkService.getDisplayUrl(source, type, name) + '">' + name + '</a>';
        };


        linkService.getModifyUrl = function ( source, type, name ) {
            return '/db-web-ui/#/webupdates/display/'+ source + '/' + type + '/' + name;
        };

        linkService.getModifyLink = function ( source, type, name ) {
            return '<a target="_blank" href="' + linkService.getModifyUrl(source, type, name) + '">' + name + '</a>';
        };

        linkService.filterAndCreateTextWithLinksForMntners = function ( source, mntners ) {
            var chopped = _.words(mntners, /[^, ]+/g);
            if(_.isUndefined(chopped)) {
                return mntners;
            }

            if(chopped.length === 1 ) {
                return linkService.getLink( source, 'mntner', mntners );
            }

            /*
             * If there are multiple mntners to authenticate against, we remove the ripe mntners
             * because regular users are confused by the presence of RIPE mntners
             */
            var withoutRipeMntners = _.filter(chopped, function(name) {
                return ! _.startsWith(name, source.toUpperCase() + '-NCC');
            });

            var asLinks = _.map(withoutRipeMntners, function(name) {
                                return linkService.getLink( source, 'mntner', name );
                            });

            if (asLinks.length > 1){
                var linksWithoutLast = _.initial(asLinks).join(', ');
                return linksWithoutLast + ' or ' + asLinks[asLinks.length - 1];
            } else {
                //should be just one
                return asLinks[0];
            }
        };

        return linkService;

    }]);
