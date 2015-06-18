'use strict';

angular.module('webUpdates')
    .controller('CreateController', ['$scope', '$stateParams', '$state', '$resource', 'WhoisResources', 'MessageStore', 'md5',
        function ($scope, $stateParams, $state, $resource, WhoisResources, MessageStore, md5) {


$scope.selectedMaintainers = [];

//             $resource('api/user/mntners').query(function(data) {
                $scope.maintainersOptions = [{'mine':true,'type':'mntner','auth':['SSO'],'key':'rehan-mnt2'}, {'mine':true,'type':'mntner','auth':['SSO'],'key':'rehan-mnt1'}, {'mine':true,'type':'mntner','auth':['SSO'],'key':'rehan-mnt0'}];

            
            
            Selectize.define('dropdown_header', function(options) {
				var self = this;
			
				options = $.extend({
					title         : 'Dont have the maintainer? Create one',
					headerClass   : 'selectize-custom-dropdown-header',
			
					html: function(data) {
						return (
							'<a href="http://ripe.net" class="' + data.headerClass + '">' + data.title + '</a>'
						);
					}
				}, options);
			
				self.setup = (function() {
					var original = self.setup;
					return function() {
						original.apply(self, arguments);
						self.$dropdown_header = $(options.html(options));
						self.$dropdown.prepend(self.$dropdown_header);
					};
				})();
			
			});
            
			$scope.myConfig = {
				labelField: 'key',
				valueField: 'key', 
				options: $scope.maintainersOptions
			};
			
// 			            });

            var onCreate = function() {
                /*
                 * Start of initialisation phase
                 */

                // extract parameters from the url
                $scope.source = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.name = $stateParams.name;

                $scope.isHelpHidden = true;

                // Initalize the errors and warnings
                $scope.errors = [];
                $scope.warnings = [];
                $scope.infos = [];

/*
                $resource('api/user/mntners').query(function(data) {
                    $scope.maintainersOptions = data;
                });
*/

                // Populate attributes in the UI
                if (!$scope.name) {
                    $scope.operation = "Create";

                    // Populate empty attributes based on meta-info
                    $scope.attributes = wrapAndEnrichAttributes(WhoisResources.getMandatoryAttributesOnObjectType($scope.objectType));
                    $scope.attributes.setSingleAttributeOnName('source', $scope.source);
                    $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                    $scope.attributes.setSingleAttributeOnName('key-cert', 'AUTO-1');

                } else {
                    $scope.operation = "Modify";

                    // Start empty, and populate with rest-result
                    $scope.attributes = wrapAndEnrichAttributes([]);
                    fetchObjectViaRest();
                }

                // Populate "select attribute for add"-fields popup
                $scope.addableAttributes = WhoisResources.getAddableAttributes($scope.objectType);
                $scope.selectedAttributeType = $scope.addableAttributes[0];
                $scope.addAfterAttribute = undefined;

                // auth (password) modal popup
                $scope.authAttribute;
                $scope.password;
                $scope.passwordAgain;
                $scope.authPasswordMessage;
                $scope.validBase64Characters = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';


                function fetchObjectViaRest () {
                    $resource('api/whois/:source/:objectType/:name', {
                        source: $scope.source,
                        objectType: $scope.objectType,
                        name: $scope.name
                    }).get(function (resp) {
                        wrapAndEnrichResources(resp);
                    }, function (resp) {
                        var whoisResources = wrapAndEnrichResources(resp.data);
                        setErrors(whoisResources);
                    });
                };

                /*
                 * End of initialisation phase
                 */
            };
            onCreate();


            /*
             * Methods called from the html-teplate
             */

            $scope.suggestAutocomplete = function( val, types) {
                // TODO: adjust to new service when ready
                console.log("typed:"+ val + ", refs:"+types);
                if( !types || types.length == 0 ) {
                    return [];
                } else {
                    // hacky, but server is still limited
                    var attributeType = types[0];
                    if(types[0] === 'ROLE' || types[0] === 'PERSON' ){
                        attributeType = 'nic-hdl';
                    }
                    return $resource('https://rest-dev.db.ripe.net/autocomplete',
                        { q:val, ot:  types, at:  attributeType }).query()
                        .$promise.then(
                        function(resp) {
                            console.log(" result resp:"+JSON.stringify(resp));
                            return resp;
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
                //var attrs = $scope.attributes.getAllAttributesWithValueOnName('mnt-by');
                //if (!attrs || attrs.length == 0) {
                //    return false;
                //}
                return true;
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

                //$scope.selectedMaintainers

                //$scope.attributes

                var allMnts = []
                _.each($scope.selectedMaintainers, function(value) {
                        allMnts.push({name:'mnt-by', value: value});
                    }
                );

                wrapAndEnrichAttributes($scope.attributes.mergeSortAttributes('mnt-by', allMnts));

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
                if ($scope.password == $scope.passwordAgain) {
                    $scope.authPasswordMessage = "Password Match!";
                    return true;
                } else {
                    $scope.authPasswordMessage = "Password Does Not Match!";
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
            };

            function wrapAndEnrichResources (resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    wrapAndEnrichAttributes(whoisResources.getAttributes());
                }
                return whoisResources;
            };


        }]);