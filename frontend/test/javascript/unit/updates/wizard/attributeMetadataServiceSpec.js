/*global beforeEach, describe, expect, inject, it, module*/

'use strict';

describe('The attributeMetadataService', function () {

    var VALID_PREFIX = '22.22.0.0/22';

    var AttributeMetadataService;
    var $scope;
    var objectType = 'prefix';
    var vm;

    beforeEach(function() {
        module('dbWebApp');
        inject(function (_$rootScope_, _$controller_, _$stateParams_, _RestService_, _PrefixService_, _AttributeMetadataService_) {
            $scope = _$rootScope_.$new();
            _$stateParams_.objectType = 'prefix';
            vm = _$controller_('DomainObjectController', {
                $scope: $scope,
                $stateParams: _$stateParams_,
                RestService: _RestService_,
                PrefixService: _PrefixService_
            });
            AttributeMetadataService = _AttributeMetadataService_;
        });
    });

    it('should not crash', function () {
        $scope.objectType = 'prefix';
        expect(!!vm.attributes).toBe(true);
        expect(vm.attributes.length).toBe(9);
    });

    xit('should be able to calculate validity of an attribute', function() {
        var isInvalid;
        var attributes = vm.attributes,
            attributePk = vm.attributes[0],
            attribute = vm.attributes[4];

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

    xit('should be able to calculate hidden state of an attribute with no dependencies', function() {
        var attributes = vm.attributes,
            attribute = vm.attributes[0];

        expect(attribute.name).toBe('prefix');
        var isHidden = AttributeMetadataService.isHidden(objectType, attributes, attribute);
        expect(isHidden).toBe(false);
    });

    xit('should be able to calculate hidden state of an attribute with dependencies', function() {
        var isHidden,
            attributes = vm.attributes,
            attrPrefix = vm.attributes[0],
            attrNs1 = vm.attributes[1],
            attrNs2 = vm.attributes[2],
            attrToTest = vm.attributes[4];

        expect(attrPrefix.name).toBe('prefix');
        expect(attrNs1.name).toBe('nserver');
        expect(attrNs2.name).toBe('nserver');
        expect(attrToTest.name).toBe('admin-c');

        attrPrefix.value = '';
        attrNs1.value = 'ns1.nowhere.com'; // a valid host name
        attrNs2.value = 'ns2.nowhere.com'; // a valid host name
        isHidden = AttributeMetadataService.isHidden(objectType, attributes, attrToTest);
        expect(isHidden).toBe(true);

        attrPrefix.value = VALID_PREFIX;
        isHidden = AttributeMetadataService.isHidden(objectType, attributes, attrToTest);
        expect(isHidden).toBe(false);

    });

});
