'use strict';

angular.module('webUpdates')
    .controller('CreateController', ['$scope', '$stateParams', '$state', '$resource', 'WhoisResources', 'MessageStore', 'md5',
        function ($scope, $stateParams, $state, $resource, WhoisResources, MessageStore, md5) {

        $scope.maintainers = {
            selected:[],
            alternatives:[],
            mine:[]
        };
        $scope.attributes = [];

        $scope.onMntnerSelect = function( item, all ) {
            // add the mntner on the right spot
            wrapAndEnrichAttributes($scope.attributes.mergeSortAttributes('mnt-by',[{name:'mnt-by', value:item.key}]));
        };

        $scope.onMntnerRemove = function( item, all ) {
            if( $scope.maintainers.selected.length == 0) {
                // make sure we do not remove the last mntner which act as anchor
                 _.map($scope.attributes, function (i) {
                    if(i.name === 'mnt-by' ) {
                        i.value = null;
                        return i;
                    } else {
                        return i;
                    }
                });
            } else {
                // remove it from the attributes right away
                _.remove($scope.attributes, function (i) {
                    return i.name === 'mnt-by' && i.value === item.key;
                });
            }
        };

        $scope.tagTransform = function (newTag) {
            return  {
                key: newTag,
                type: 'mntner',
                mine: false,
                auth:[]
            };
        };

        $scope.isMine = function( mntner ) {
            if( !mntner.mine ) {
                return false;
            } else {
                return mntner.mine;
            }
        };

        $scope.hasSSo = function( mntner ) {
            return _.any(mntner.auth, function(i) {
                return  _.startsWith(i,"SSO");
            });
        };

        $scope.hasPgp = function( mntner ) {
            return  _.any(mntner.auth, function(i) {
                return _.startsWith(i, "PGP");
            });
        };
        $scope.hasMd5 = function( mntner ) {
            return  _.any(mntner.auth, function(i) {
                return  _.startsWith(i,"MD5");
            });
        };

        var enrichAlternativesWithMine = function(mntners) {
            // search
            return _.map(mntners, function(mntner) {
                if(_.any($scope.maintainers.mine, function(m) {
                        return m.key === mntner.key;
                    })) {

                    mntner.mine = true;
                }
                return mntner;
            });
        };

        $scope.refreshMntners = function( query) {
            if( query.length > 2 ) {
                $resource('api/whois/autocomplete',
                    {query: query, field: 'mnt-by', attribute: 'auth'}).query(
                    function (data) {
                        $scope.maintainers.alternatives = enrichAlternativesWithMine(data);
                    }
                );
            }
        };

        var onLoad = function() {

                /*
                 * Start of initialisation phase
                 */

                function fetchObjectViaRest() {
                    $resource('api/whois/:source/:objectType/:name', {
                        source: $scope.source,
                        objectType: $scope.objectType,
                        name: $scope.name
                    }).get(function (resp) {
                        wrapAndEnrichResources(resp);

                        // get mntbers from response
                        var mntners = _.filter($scope.attributes, function(i) {
                            return i.name === 'mnt-by';
                        });
                        //  copy mntbers to mantainers.selected
                        $scope.maintainers.selected = _.map(mntners, function(i) {
                            return {type:'mntner', key: i.value, mine:true};
                        });

                    }, function (resp) {
                        var whoisResources = wrapAndEnrichResources(resp.data);
                        setErrors(whoisResources);
                    });
                }

                // extract parameters from the url
                $scope.source = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.name = $stateParams.name;

                $scope.isHelpHidden = true;

                // Initalize the errors and warnings
                $scope.errors = [];
                $scope.warnings = [];
                $scope.infos = [];

                // Populate attributes in the UI
                if (!$scope.name) {
                    $scope.operation = 'Create';

                    // Populate empty attributes based on meta-info
                    $scope.attributes = wrapAndEnrichAttributes(WhoisResources.getMandatoryAttributesOnObjectType($scope.objectType));
                    $scope.attributes.setSingleAttributeOnName('source', $scope.source);
                    $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                    $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                    $scope.attributes.setSingleAttributeOnName('key-cert', 'AUTO-1');


                    $resource('api/user/mntners').query(function(data) {
                        $scope.maintainers.selected = data;
                        // rework data in attrinutes
                        var mntnerAttrs = _.map(data, function(i) {
                            return {name: 'mnt-by', value:i.key};
                        });
                        $scope.maintainers.mine = data;
                        wrapAndEnrichAttributes($scope.attributes.mergeSortAttributes('mnt-by',
                            mntnerAttrs));
                    });

                } else {
                    $scope.operation = 'Modify';

                    // Start empty, and populate with rest-result
                    $scope.attributes = wrapAndEnrichAttributes([]);
                    fetchObjectViaRest();

                }

                // Populate "select attribute for add"-fields popup
                $scope.addableAttributes = WhoisResources.getAddableAttributes($scope.objectType);
                $scope.selectedAttributeType = $scope.addableAttributes[0];
                $scope.addAfterAttribute = undefined;

                // auth (password) modal popup
                $scope.authAttribute = undefined;
                $scope.password = undefined;
                $scope.passwordAgain = undefined;
                $scope.authPasswordMessage = undefined;
                $scope.validBase64Characters = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

                /*
                 * End of initialisation phase
                 */
            };
            onLoad();

            /*
             * Methods called from the html-teplate
             */

            $scope.suggestAutocomplete = function( val, name, refs) {
                if( !refs || refs.length === 0 ) {
                    // No suggestions since not a reference
                    return [];
                } else {
                    return $resource('api/whois/autocomplete',
                        { query:val, field: name, extended:true}).query()
                        .$promise.then(
                        function(resp) {
                            return _.map(resp, function( item) {
                                return item.key;
                            });
                        }, function() {
                            return [];
                        });
                }
            };

            $scope.hasErrors = function () {
                return $scope.errors.length > 0;
            };

            $scope.hasWarnings = function () {
                return $scope.warnings.length > 0;
            };

            $scope.hasInfos = function () {
                return $scope.infos.length > 0;
            };

            $scope.attributeHasError = function (attribute) {
                return attribute.$$error !== null;
            };

            $scope.hasMntners = function () {
                return $scope.maintainers.selected.length > 0;
            };

            $scope.submit = function () {

                var onSubmitSuccess = function (resp) {
                    var whoisResources = WhoisResources.wrapWhoisResources(resp);
                    // stick created object in temporary store, so display can fetch it from here
                    MessageStore.add(whoisResources.getObjectUid(), whoisResources);
                    // make transition to next display screen
                    $state.transitionTo('display', {
                        source: $scope.source,
                        objectType: $scope.objectType,
                        name: whoisResources.getObjectUid(),
                        method:$scope.operation
                    });
                };

                var onSubmitError = function (resp) {
                    if (!resp.data) {
                        // TIMEOUT: to be handled globally by response interceptor
                    } else {
                        var whoisResources = wrapAndEnrichResources(resp.data);
                        validateForm();
                        setErrors(whoisResources);
                    }
                };

                var validateForm = function () {
                    var status = $scope.attributes.validate();
                    return status;
                };

                var stripNulls = function () {
                    $scope.attributes = wrapAndEnrichAttributes($scope.attributes.removeNullAttributes());
                };

                var clearErrors = function () {
                    $scope.errors = [];
                    $scope.warnings = [];
                    $scope.attributes.clearErrors();
                };

                if (validateForm() ) {
                    stripNulls();
                    clearErrors();
                        if (!$scope.name) {
                        // perform POST to create
                        $resource('api/whois/:source/:objectType',
                            {source: $scope.source, objectType: $scope.objectType})
                            .save(WhoisResources.embedAttributes($scope.attributes),
                                onSubmitSuccess,
                                onSubmitError);
                    } else {
                        // perform PUT to modify
                        $resource('api/whois/:source/:objectType/:name',
                            {source: $scope.source, objectType: $scope.objectType, name: $scope.name},
                            {'update': {method: 'PUT'}})
                            .update(WhoisResources.embedAttributes($scope.attributes),
                                onSubmitSuccess,
                                onSubmitError);
                    }
                }
            };

            $scope.canAttributeBeDuplicated = function (attr) {
                return $scope.attributes.canAttributeBeDuplicated(attr);
            };

            $scope.duplicateAttribute = function (attr) {
                wrapAndEnrichAttributes($scope.attributes.duplicateAttribute(attr));
            };

            $scope.canAttributeBeRemoved = function (attr) {
                return $scope.attributes.canAttributeBeRemoved(attr);
            };

            $scope.removeAttribute = function (attr) {
                wrapAndEnrichAttributes($scope.attributes.removeAttribute(attr));
            };

            $scope.displayAddAttributeDialog = function (attr) {
                $scope.addAfterAttribute = attr;
                $('#insertAttributeModal').modal('show');
            };

            $scope.addAttributeAfterAttribute = function () {
                wrapAndEnrichAttributes($scope.attributes.addAttributeAfter($scope.selectedAttributeType, $scope.addAfterAttribute));
            };

            // auth (password) modal popup

            $scope.displayAuthDialog = function (attr) {
                $scope.authAttribute = attr;
                $scope.password = '';
                $scope.passwordAgain = '';
                $scope.authPasswordMessage = '';
                $('#authModal').modal('show');
            };

            $scope.verifyAuthDialog = function () {
                if ($scope.password === $scope.passwordAgain) {
                    $scope.authPasswordMessage = 'Password Match!';
                    return true;
                } else {
                    $scope.authPasswordMessage = 'Password Does Not Match!';
                    return false;
                }
            };

            $scope.populateAuthAttribute = function () {
                $scope.authAttribute.value = 'MD5-PW $1$' + $scope.generateSalt(8) + '$' + md5.createHash($scope.password);
            };

            $scope.generateSalt = function (length) {
                var result = '';
                for (var index = 0; index < length; index++) {
                    var offset = Math.floor((Math.random() * $scope.validBase64Characters.length));
                    result = result.concat($scope.validBase64Characters.charAt(offset));
                }
                return result;
            };

            /*
             * Private methods
             */

            var populateFieldSpecificErrors = function (resp) {
                _.map($scope.attributes, function (attr) {
                    // keep existing error messages
                    if (!attr.$$error) {
                        var errors = resp.getErrorsOnAttribute(attr.name, attr.value);
                        if (errors && errors.length > 0) {
                            attr.$$error = errors[0].plainText;
                        }
                    }
                    return attr;
                });
            };

            var setErrors = function (whoisResources) {
                populateFieldSpecificErrors(whoisResources);
                $scope.errors = whoisResources.getGlobalErrors();
                $scope.warnings = whoisResources.getGlobalWarnings();
                $scope.infos = whoisResources.getGlobalInfos();
            };

            /*
             * Methods used to make sure that attributes have meta information and have utility functions
             */
            function wrapAndEnrichAttributes (attrs) {
                $scope.attributes = WhoisResources.wrapAttributes(
                    WhoisResources.enrichAttributesWithMetaInfo($scope.objectType, attrs)
                );

                return $scope.attributes;
            }

            function wrapAndEnrichResources (resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    wrapAndEnrichAttributes(whoisResources.getAttributes());
                }
                return whoisResources;
            }


        }]);
