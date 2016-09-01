/*global beforeEach, describe, expect, inject, it*/

'use strict';

fdescribe('Domain Wizard', function () {

    var AttributeMetadataService;
    var $scope;
    var constants;

    beforeEach(function() {
        module('dbWebApp');
        inject(function (_$rootScope_, _$controller_, _RestService_, _constants_, _PrefixService_, _AttributeMetadataService_) {
            $scope = _$rootScope_.$new();
            _$controller_('DomainObjectController', {
                $scope: $scope,
                RestService: _RestService_,
                constants: _constants_,
                PrefixService: _PrefixService_
            });
            AttributeMetadataService = _AttributeMetadataService_;
            constants = _constants_;
        });
    });

    it('controller should not crash', function () {
        //$scope.objectType = 'prefix';
        expect(!!$scope.attributes).toBe(true);
        expect($scope.attributes.length).toBe(9);
    });

    it('should be able to calculate validity of an primary with no metadata', function() {
        var isValid;
        var objectType = 'prefix',
            attributes = $scope.attributes,
            attribute = $scope.attributes[0],
            attrMetadata = AttributeMetadataService.getMetadata(objectType, attribute.name);

        console.log('prefix', constants.ObjectMetadata.prefix.prefix);
        console.log('attrMetadata', attrMetadata);
        expect(attribute.name).toBe('prefix');

        attribute.value = '';
        isValid = AttributeMetadataService.isValid(objectType, attributes, attribute);
        expect(isValid).toBe(false);

        attribute.value = '22.22.0/22';
        isValid = AttributeMetadataService.isValid(objectType, attributes, attribute);
        expect(isValid).toBe(true);
    });

    it('should be able to calculate hidden state of an attribute with no dependencies', function() {
        var objectType = 'prefix',
            attributes = $scope.attributes,
            attribute = $scope.attributes[0];

        expect(attribute.name).toBe('prefix'); // make sure we've got the right one :$
        var isHidden = AttributeMetadataService.isHidden(objectType, attributes, attribute);
        expect(isHidden).toBe(false);
    });

    it('should be able to calculate hidden state of an attribute with dependencies', function() {
        var objectType = 'prefix',
            attributes = $scope.attributes,
            attrDep1 = $scope.attributes[0],
            attrToTest = $scope.attributes[4];

        expect(attrDep1.name).toBe('prefix'); // make sure we've got the right one :$
        expect(attrToTest.name).toBe('admin-c'); // make sure we've got the right one :$
        var isHidden = AttributeMetadataService.isHidden(objectType, attributes, attrToTest);
        expect(isHidden).toBe(true);
    });

});
