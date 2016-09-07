/*global beforeEach, describe, expect, inject, it*/

'use strict';

describe('The prefix wizard', function () {

    var VALID_PREFIX = '22.22.0.0/22';

    var AttributeMetadataService;
    var $scope;
    var objectType = 'prefix';

    beforeEach(function() {
        module('dbWebApp');
        inject(function (_$rootScope_, _$controller_, _RestService_, _PrefixService_, _AttributeMetadataService_) {
            $scope = _$rootScope_.$new();
            _$controller_('DomainObjectController', {
                $scope: $scope,
                RestService: _RestService_,
                PrefixService: _PrefixService_
            });
            AttributeMetadataService = _AttributeMetadataService_;
        });
    });

    it('controller should not crash', function () {
        //$scope.objectType = 'prefix';
        expect(!!$scope.attributes).toBe(true);
        expect($scope.attributes.length).toBe(9);
    });

    it('should be able to calculate validity of an attribute', function() {
        var isInvalid;
        var attributes = $scope.attributes,
            attributePk = $scope.attributes[0],
            attribute = $scope.attributes[4];

        expect(attributePk.name).toBe('prefix');
        expect(attribute.name).toBe('admin-c');

        //TODO: add object which has primary key with no deps
        attributePk.value = '';
        isInvalid = AttributeMetadataService.isInvalid(objectType, attributes, attributePk);
        expect(isInvalid).toBe(true);

        attributePk.value = VALID_PREFIX;
        isInvalid = AttributeMetadataService.isInvalid(objectType, attributes, attributePk);
        expect(isInvalid).toBe(false);

        attribute.value = '';
        isInvalid = AttributeMetadataService.isInvalid(objectType, attributes, attribute);
        expect(isInvalid).toBe(false);

        attribute.value = 'could be anything';
        isInvalid = AttributeMetadataService.isInvalid(objectType, attributes, attribute);
        expect(isInvalid).toBe(false);
    });

    it('should be able to calculate hidden state of an attribute with no dependencies', function() {
        var attributes = $scope.attributes,
            attribute = $scope.attributes[0];

        expect(attribute.name).toBe('prefix');
        var isHidden = AttributeMetadataService.isHidden(objectType, attributes, attribute);
        expect(isHidden).toBe(false);
    });

    it('should be able to calculate hidden state of an attribute with dependencies', function() {
        var isHidden,
            attributes = $scope.attributes,
            attrPrefix = $scope.attributes[0],
            attrToTest = $scope.attributes[4];

        expect(attrPrefix.name).toBe('prefix');
        expect(attrToTest.name).toBe('admin-c');

        attrPrefix.value = '';
        isHidden = AttributeMetadataService.isHidden(objectType, attributes, attrToTest);
        expect(isHidden).toBe(true);

        attrPrefix.value = VALID_PREFIX;
        isHidden = AttributeMetadataService.isHidden(objectType, attributes, attrToTest);
        expect(isHidden).toBe(false);

    });

});
