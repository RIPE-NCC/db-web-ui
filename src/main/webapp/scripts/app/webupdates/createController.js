'use strict';

angular.module('webUpdates')
    .controller('CreateController', ['$scope', '$stateParams', '$state', 'WhoisResources', 'MessageStore', 'md5', 'CredentialsService', 'UserInfoService', 'RestService',
        function ($scope, $stateParams, $state, WhoisResources, MessageStore, md5, CredentialsService, UserInfoService, RestService) {

            $scope.uiSelectTemplateReady = false;

            //exposed methods
            $scope.onMntnerSelect = onMntnerSelect;
            $scope.onMntnerRemove = onMntnerRemove;
            $scope.isMine = isMine;
            $scope.hasSSo = hasSSo;
            $scope.hasPgp = hasPgp;
            $scope.hasMd5 = hasMd5;
            $scope.refreshMntners = refreshMntners;

            $scope.suggestAutocomplete = suggestAutocomplete;
            $scope.hasErrors = hasErrors;
            $scope.hasWarnings = hasWarnings;
            $scope.hasInfos = hasInfos;
            $scope.hasMntners = hasMntners;
            $scope.submit = submit;

            $scope.canAttributeBeDuplicated = canAttributeBeDuplicated;
            $scope.duplicateAttribute = duplicateAttribute;
            $scope.canAttributeBeRemoved = canAttributeBeRemoved;
            $scope.removeAttribute = removeAttribute;
            $scope.displayAddAttributeDialog = displayAddAttributeDialog;
            $scope.addAttributeAfterAttribute = addAttributeAfterAttribute;

            _initialisePage();

            // auth (password) modal popup for attribute
            $scope.displayAuthDialog = displayAuthDialog;
            $scope.verifyAuthDialog = verifyAuthDialog;
            $scope.populateAuthAttribute = populateAuthAttribute;

            //password popup
            $scope.attemptAutentication = attemptAutentication;


            //private functions
            function _initialisePage() {
                // extract parameters from the url
                $scope.source = $stateParams.source;
                $scope.objectType = $stateParams.objectType;
                $scope.name = $stateParams.name;

                // fields
                $scope.maintainers = {
                    selected:[],
                    alternatives:[],
                    mine:[]
                };

                $scope.attributes = [];

                $scope.isHelpHidden = true;

                // Initalize the errors and warnings
                $scope.errors = [];
                $scope.warnings = [];
                $scope.infos = [];

                RestService.fetchUiSelectResources().then( function() {
                    $scope.uiSelectTemplateReady = true;
                });

                // Populate attributes in the UI

                if (!$scope.name) {
                    $scope.operation = 'Create';

                    _fetchMyMaintainers(_setMyMntnersToSelected);

                    // Populate empty attributes based on meta-info
                    $scope.attributes = _wrapAndEnrichAttributes(WhoisResources.getMandatoryAttributesOnObjectType($scope.objectType));
                    $scope.attributes.setSingleAttributeOnName('source', $scope.source);
                    $scope.attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                    $scope.attributes.setSingleAttributeOnName('key-cert', 'AUTO-1');

                } else {
                    $scope.operation = 'Modify';

                    // Start empty, and populate with rest-result
                    $scope.attributes = _wrapAndEnrichAttributes([]);
                    _fetchMyMaintainers(_fetchObjectViaRest);
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
            }

            function _fetchObjectViaRest() {
                console.log("_fetchObjectViaRest start");

                RestService.fetchObject($scope.source, $scope.objectType, $scope.name)
                .then( function(resp) {

                    wrapAndEnrichResources(resp);

                    $scope.maintainers.selected = enrichObjectMntners($scope.attributes);
                    console.log("selected mntners:" + JSON.stringify($scope.maintainers.selected));

                }, function (error) {
                    var whoisResources = wrapAndEnrichResources(error.data);
                    setErrors(whoisResources);
                });
                console.log("_fetchObjectViaRest done");

            }

            function enrichObjectMntners( attributes ) {
                // get mntners from response
                var mntners = _.filter(attributes, function(i) {
                    return i.name === 'mnt-by';
                });
                console.log("object mntners:" + JSON.stringify(mntners));

                //  copy mntners to mantainers.selected
                var selected = _.map(mntners, function(mntnerAttr) {
                    return {
                        type:'mntner',
                        key: mntnerAttr.value,
                        mine: _.contains(_.map($scope.maintainers.mine, 'key'), mntnerAttr.value)
                    };
                });
                console.log("selected mntners:" + JSON.stringify(selected));

                _.each(selected,function(item) {
                    fetchMntner(item.key);
                } );

                return selected;
            }

            function fetchMntner( mntnerName ) {
                RestService.mntnerDetails(mntnerName)
                    .then(function (data) {
                        $scope.maintainers.selected = _refineSelected($scope.maintainers.selected, mntnerName, data);
                        // popup to ask for password
                        if( _needsPasswordAuthentication(data)) {
                            console.log("needs password popup");
                        } else {
                            console.log("Does not need password popup");
                        }

                    }
                );
            }

            function _refineSelected( selected, mntnerName, refinedMntners ) {
                var mntnerEnriched = _.find(refinedMntners, function( item) {
                    return item.type.toLowerCase() === 'mntner' && item.key.toUpperCase() === mntnerName.toUpperCase();
                });
                console.log("My mntner:" + JSON.stringify(mntnerEnriched));
                return _.map(selected, function(item) {
                    if( item.type.toLowerCase() === 'mntner' && item.key.toUpperCase() === mntnerName.toUpperCase() ) {
                        item.mine = mntnerEnriched.mine;
                        item.auth = mntnerEnriched.auth;
                    }
                    return item;
                });
            }

            function _setMyMntnersToSelected(){

                if ($scope.maintainers.mine.length>0) {

                    $scope.maintainers.selected = $scope.maintainers.mine;
                    // rework data in attributes
                    var mntnerAttrs = _.map($scope.maintainers.mine, function(i) {
                        return {name: 'mnt-by', value:i.key};
                    });

                    _wrapAndEnrichAttributes($scope.attributes.mergeSortAttributes('mnt-by', mntnerAttrs));
                }
            }

            function _fetchMyMaintainers(callback){
                console.log("_fetchMyMaintainers start");

                RestService.getMntner().then(
                function(data) {
                    $scope.maintainers.mine = data;

                    callback();
                }, function(errorResp) {
                    console.log("Error fetching my maintainers:" + JSON.stringify(errorResp));
                });

                console.log("_fetchMyMaintainers done");

            }

            function _isMntnerOnlist( selectedMntners, mntner ) {
                var status = _.any(selectedMntners, function(m) {
                    return m.key === mntner.key;
                });
                return status;
            }

            function _enrichAlternativesWithMine(mntners) {
                return  _.map(mntners, function(mntner) {
                    // search in selected list
                    if(_isMntnerOnlist($scope.maintainers.mine, mntner)) {
                        mntner.mine = true;
                    }
                    return mntner;
                });
            }

            function _stripAlreadySelected(mntners) {
                return _.filter(mntners, function(mntner) {
                    return !_isMntnerOnlist($scope.maintainers.selected, mntner);
                });
            }

            /*
             * Methods called from the html-teplate
             */

            function onMntnerSelect( item, all ) {
                // add the mntner on the right spot

                console.log('on select: selected mntners: ' + JSON.stringify($scope.maintainers.selected));

                if (_needsPasswordAuthentication($scope.maintainers.selected)) {
                    _displayProvidePasswordModal($scope.getMntnersForPasswordAuth($scope.maintainers.selected));
                    $scope.maintainers.selected.pop();
                } else {
                    _addMntnerToSelected(item.key);
                }
            }

            function _addMntnerToSelected (mntnerName){
                _wrapAndEnrichAttributes($scope.attributes.mergeSortAttributes('mnt-by', [{
                    name: 'mnt-by',
                    value: mntnerName
                }]));
            }

            function onMntnerRemove( item, all ) {
                if( $scope.maintainers.selected.length === 0) {
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
            }

            function isMine( mntner ) {
                if( !mntner.mine ) {
                    return false;
                } else {
                    return mntner.mine;
                }
            }

            function hasSSo( mntner ) {
                return _.any(mntner.auth, function(i) {
                    return  _.startsWith(i, 'SSO');
                });
            }

            function hasPgp( mntner ) {
                return  _.any(mntner.auth, function(i) {
                    return _.startsWith(i, 'PGP');
                });
            }

            function hasMd5( mntner ) {
                return  _.any(mntner.auth, function(i) {
                    return  _.startsWith(i, 'MD5');
                });
            }

            function refreshMntners( query) {
                // need to typed characters
                if( query.length > 2 ) {
                    RestService.autocomplete( query, 'mnt-by', ['auth']).then(
                        function (data) {
                            // prevent mntners on selected list to appear
                            $scope.maintainers.alternatives = _stripAlreadySelected(_enrichAlternativesWithMine(data));
                        }
                    );
                }
            }

            function suggestAutocomplete( val, name, refs) {
                if( !refs || refs.length === 0 ) {
                    // No suggestions since not a reference
                    return [];
                } else {
                    RestService.autocomplete( val, name, []).then(
                        function(resp) {
                            return _.map(resp, function( item) {
                                return item.key;
                            });
                        }, function() {
                            return [];
                     });
                }
            }

            function hasErrors() {
                return $scope.errors.length > 0;
            }

            function hasWarnings() {
                return $scope.warnings.length > 0;
            }

            function hasInfos() {
                return $scope.infos.length > 0;
            }

            function hasMntners() {
                return $scope.maintainers.selected.length > 0;
            }

            function submit() {

                function _onSubmitSuccess(resp) {
                    var whoisResources = WhoisResources.wrapWhoisResources(resp);
                    // stick created object in temporary store, so display-screen can fetch it from here
                    MessageStore.add(whoisResources.getPrimaryKey(), whoisResources);
                    // make transition to next display screen
                    $state.transitionTo('display', {
                        source: $scope.source,
                        objectType: $scope.objectType,
                        name: whoisResources.getPrimaryKey(),
                        method:$scope.operation
                    });
                }

                function _onSubmitError(resp) {
                    if (!resp.data) {
                        // TIMEOUT: to be handled globally by response interceptor
                    } else {
                        var whoisResources = wrapAndEnrichResources(resp.data);
                        _validateForm();
                        setErrors(whoisResources);
                    }
                }

                if (_validateForm() ) {
                    _stripNulls();
                    _clearErrors();

                    if (_needsPasswordAuthentication($scope.maintainers.selected)) {
                        _displayProvidePasswordModal($scope.getMntnersForPasswordAuth($scope.maintainers.selected));
                        return;
                    }

                    if (!$scope.name) {

                            RestService.createObject($scope.source, $scope.objectType,
                                WhoisResources.embedAttributes($scope.attributes),
                                CredentialsService.getCredentials().successfulPassword)
                                .then(
                                _onSubmitSuccess,
                                _onSubmitError);

                    } else {
                        RestService.modifyObject($scope.source, $scope.objectType, $scope.name,
                            WhoisResources.embedAttributes($scope.attributes),
                                    CredentialsService.getCredentials().successfulPassword)
                            .then(
                                _onSubmitSuccess,
                                _onSubmitError);
                    }
                }
            }

            function canAttributeBeDuplicated(attr) {
                return $scope.attributes.canAttributeBeDuplicated(attr);
            }

            function duplicateAttribute(attr) {
                _wrapAndEnrichAttributes($scope.attributes.duplicateAttribute(attr));
            }

            function canAttributeBeRemoved(attr) {
                return $scope.attributes.canAttributeBeRemoved(attr);
            }

            function removeAttribute(attr) {
                _wrapAndEnrichAttributes($scope.attributes.removeAttribute(attr));
            }

            function displayAddAttributeDialog(attr) {
                $scope.addAfterAttribute = attr;
                $('#insertAttributeModal').modal('show');
            }

            function addAttributeAfterAttribute() {
                _wrapAndEnrichAttributes($scope.attributes.addAttributeAfter($scope.selectedAttributeType, $scope.addAfterAttribute));
            }

            /*
                private methods
             */

            function _validateForm() {
                var status = $scope.attributes.validate();
                return status;
            }

            function _stripNulls() {
                $scope.attributes = _wrapAndEnrichAttributes($scope.attributes.removeNullAttributes());
            }

            function _clearErrors() {
                $scope.errors = [];
                $scope.warnings = [];
                $scope.attributes.clearErrors();
            }

            // auth (password) modal popup
            function displayAuthDialog(attr) {
                $scope.authAttribute = attr;
                $scope.password = '';
                $scope.passwordAgain = '';
                $scope.authPasswordMessage = '';
                $('#authModal').modal('show');
            }

            function verifyAuthDialog() {
                if ($scope.password === $scope.passwordAgain) {
                    $scope.authPasswordMessage = 'Password Match!';
                    return true;
                } else {
                    $scope.authPasswordMessage = 'Password Does Not Match!';
                    return false;
                }
            }

            function populateAuthAttribute() {
                $scope.authAttribute.value = 'MD5-PW $1$' + $scope.generateSalt(8) + '$' + md5.createHash($scope.password);
            }

            function generateSalt(length) {
                var result = '';
                for (var index = 0; index < length; index++) {
                    var offset = Math.floor((Math.random() * $scope.validBase64Characters.length));
                    result = result.concat($scope.validBase64Characters.charAt(offset));
                }
                return result;
            }

            /*
             * Private methods
             */

            function _populateFieldSpecificErrors(resp) {
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
            }

            function setErrors(whoisResources) {
                _populateFieldSpecificErrors(whoisResources);
                $scope.errors = whoisResources.getGlobalErrors();
                $scope.warnings = whoisResources.getGlobalWarnings();
                $scope.infos = whoisResources.getGlobalInfos();
            }

            /*
             * Methods used to make sure that attributes have meta information and have utility functions
             */
            function _wrapAndEnrichAttributes (attrs) {
                $scope.attributes = WhoisResources.wrapAttributes(
                    WhoisResources.enrichAttributesWithMetaInfo($scope.objectType, attrs)
                );

                return $scope.attributes;
            }

            function wrapAndEnrichResources (resp) {
                var whoisResources = WhoisResources.wrapWhoisResources(resp);
                if (whoisResources) {
                    _wrapAndEnrichAttributes(whoisResources.getAttributes());
                }
                return whoisResources;
            }


            /*
                password authentication modal
             */

            $scope.getMntnersForPasswordAuth = function (selectedMaintainers){

                if (_.any(selectedMaintainers, function (mntner) {
                        return $scope.isMine(mntner) === true;
                    })) {
                    return [];
                }

                return _.filter(selectedMaintainers, function (mntner) {
                    return $scope.hasMd5(mntner) === true;
                });
            };

            function _needsPasswordAuthentication(selectedMaintainers) {
                console.log("_needsPasswordAuthentication 1:"+ JSON.stringify(selectedMaintainers));

                var md5Mntners = $scope.getMntnersForPasswordAuth(selectedMaintainers);

                console.log("_needsPasswordAuthentication 2:"+ JSON.stringify(md5Mntners));

                return md5Mntners.length > 0
                    && (!CredentialsService.hasCredentials()
                        || ! _.contains(_.map(md5Mntners, 'key'), CredentialsService.getCredentials().mntner.key));
            }

            function _displayProvidePasswordModal(mntnersForPasswordAuth) {

                $scope.providePasswordModal = {
                    mntnersForPasswordAuth: [],
                    selectedMntner: undefined,
                    password: '',
                    authResult: false,
                    message: '',
                    hasMessage: function () {
                        return !_.isUndefined($scope.providePasswordModal.message) && $scope.providePasswordModal.message !== '';
                    },
                    associateSSOAccountWithMntner: true
                };

                $scope.providePasswordModal.mntnersForPasswordAuth = mntnersForPasswordAuth;
                $scope.providePasswordModal.selectedMntner = mntnersForPasswordAuth[0];
                $('#providePasswordModal').modal('show');
            }

            function attemptAutentication(){
                RestService.authenticate($scope.source, 'mntner',$scope.providePasswordModal.selectedMntner.key,
                    $scope.providePasswordModal.password )
                .then(
                    function (resp) {
                        var whoisResources = WhoisResources.wrapWhoisResources(resp);

                        if (!whoisResources.isFiltered()){
                            console.log("authenticated ok");

                            $scope.providePasswordModal.authResult = true;
                            $('#providePasswordModal').modal('hide');
                            CredentialsService.setCredentials($scope.providePasswordModal.selectedMntner, $scope.providePasswordModal.password);

                            if ($scope.providePasswordModal.associateSSOAccountWithMntner) {
                                associate(whoisResources, UserInfoService.getUsername(), $scope.providePasswordModal.password, new function (){
                                    $scope.providePasswordModal.selectedMntner.mine = true;
                                    $scope.maintainers.mine.push($scope.providePasswordModal.selectedMntner);
                                    CredentialsService.removeCredentials();
                                });
                            }

                            $scope.maintainers.selected.push($scope.providePasswordModal.selectedMntner);
                            _addMntnerToSelected($scope.providePasswordModal.selectedMntner.key);

                        } else {
                            console.log("not authenticated");
                            $scope.providePasswordModal.authResult = false;
                            $scope.providePasswordModal.message =
                                'You have not supplied the correct password for mntner: \'' + $scope.providePasswordModal.selectedMntner.key + '\'';
                        }

                    }, function (resp) {
                        var whoisResources = WhoisResources.wrapWhoisResources(resp.data);
                        if (!_.isUndefined(whoisResources)) {
                            console.log('whois error response in modal');
                            $scope.providePasswordModal.message = _.reduce(whoisResources.getGlobalErrors(), function(total, n) {
                                return total + '\n' +n;
                            });
                        } else {
                            console.log('server error in modal');
                            $scope.providePasswordModal.message = 'server error : ' + JSON.stringify(resp);
                        }
                        $scope.providePasswordModal.authResult = true;
                    });
            }

            function associate(whoisResources, ssoUsername, mntnerPassword, callback) {
                if (_.isUndefined(ssoUsername)) {
                    return;
                }

                var attributes = WhoisResources.wrapAttributes(whoisResources.getAttributes()).addAttributeAfterType({
                    name: 'auth',
                    value: 'SSO ' + ssoUsername
                }, {name: 'auth'});

                RestService.associateSSOMntner(whoisResources.getSource(), whoisResources.getObjectType(), whoisResources.getPrimaryKey(),
                    WhoisResources.embedAttributes(attributes), mntnerPassword)
                    .then(
                    function (resp) {
                        // success response
                        callback();
                    },
                    function (resp) {
                        // error response
                    });
            }

}]);
