/*global beforeEach, describe, expect, inject, it, module*/

'use strict';

describe('The attributeMetadataService', function () {

    var VALID_PREFIX = '22.22.0.0/22';

    var AttributeMetadataService;
    var $scope;
    var objectType = 'prefix';
    var $ctrl;

    beforeEach(function() {
        module('dbWebApp');
            inject(function (_$rootScope_, _$componentController_, _$stateParams_, _RestService_, _PrefixService_, _AttributeMetadataService_) {
            $scope = _$rootScope_.$new();
            _$stateParams_.objectType = 'prefix';
            AttributeMetadataService = _AttributeMetadataService_;
            $ctrl = _$componentController_('domainObjectWizard', {
                $scope: $scope,
                $stateParams: _$stateParams_,
                AttributeMetadataService: _AttributeMetadataService_,
                RestService: _RestService_,
                PrefixService: _PrefixService_
            });
        });
    });

    it('should not crash', function () {
        $scope.objectType = 'prefix';
        expect(!!$ctrl.attributes).toBe(true);
        expect($ctrl.attributes.length).toBe(9);
    });

    it('should create metadata for NOT co-maintained inetnum object with netname NOT read only', function () {

        var attributes = [{name: 'mnt-by', value: 'SOME-MNT'}];
        var type = 'inetnum';
        var metaData = AttributeMetadataService.getAllMetadata(type);
        var isReadOnly = metaData.netname.readOnly(type, attributes);
        expect(isReadOnly).toBe(false);
    });

    it('should create metadata for co-maintained inetnum object with netname read only', function () {

        var attributes = [{name: 'mnt-by', value: 'RIPE-NCC-HM-MNT'}];
        var type = 'inetnum';
        var metaData = AttributeMetadataService.getAllMetadata(type);
        var isReadOnly = metaData.netname.readOnly(type, attributes);
        expect(isReadOnly).toBe(true);
    });

    it('should create metadata for NOT co-maintained inet6num object with netname NOT read only', function () {

        var attributes = [{name: 'mnt-by', value: 'SOME-MNT'}];
        var type = 'inet6num';
        var metaData = AttributeMetadataService.getAllMetadata(type);
        var isReadOnly = metaData.netname.readOnly(type, attributes);
        expect(isReadOnly).toBe(false);
    });

    it('should create metadata for co-maintained inet6num object with netname read only', function () {

        var attributes = [{name: 'mnt-by', value: 'RIPE-NCC-HM-MNT'}];
        var type = 'inet6num';
        var metaData = AttributeMetadataService.getAllMetadata(type);
        var isReadOnly = metaData.netname.readOnly(type, attributes);
        expect(isReadOnly).toBe(true);
    });

    it('should create metadata for co-maintained inetnum object with org read only', function () {

        var attributes = [{name: 'mnt-by', value: 'RIPE-NCC-HM-MNT'}, {name: 'org', value: 'ORG-EIP1-RIPE'}];
        var type = 'inetnum';
        var metaData = AttributeMetadataService.getAllMetadata(type);
        var isReadOnly = metaData.org.readOnly(type, attributes);
        expect(isReadOnly).toBe(true);
    });

    it('should create metadata for NOT co-maintained inetnum object with org NOT read only', function () {

        var attributes = [{name: 'org', value: 'ORG-EIP1-RIPE'}];
        var type = 'inetnum';
        var metaData = AttributeMetadataService.getAllMetadata(type);
        var isReadOnly = metaData.org.readOnly(type, attributes);
        expect(isReadOnly).toBe(false);
    });

    it('should create metadata for co-maintained inet6num object with org read only', function () {

        var attributes = [{name: 'mnt-by', value: 'RIPE-NCC-HM-MNT'}, {name: 'org', value: 'ORG-EIP1-RIPE'}];
        var type = 'inet6num';
        var metaData = AttributeMetadataService.getAllMetadata(type);
        var isReadOnly = metaData.org.readOnly(type, attributes);
        expect(isReadOnly).toBe(true);
    });

    it('should create metadata for NOT co-maintained inet6num object with org NOT read only', function () {

        var attributes = [{name: 'org', value: 'ORG-EIP1-RIPE'}];
        var type = 'inet6num';
        var metaData = AttributeMetadataService.getAllMetadata(type);
        var isReadOnly = metaData.org.readOnly(type, attributes);
        expect(isReadOnly).toBe(false);
    });

    xit('should be able to calculate validity of an attribute', function() {
        var isInvalid;
        var attributes = $ctrl.attributes,
            attributePk = $ctrl.attributes[0],
            attribute = $ctrl.attributes[4];

        expect(attributePk.name).toBe('prefix');
        expect(attribute.name).toBe('admin-c');

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
        var attributes = $ctrl.attributes,
            attribute = $ctrl.attributes[0];

        expect(attribute.name).toBe('prefix');
        var isHidden = AttributeMetadataService.isHidden(objectType, attributes, attribute);
        expect(isHidden).toBe(false);
    });

    xit('should be able to calculate hidden state of an attribute with dependencies', function() {
        var isHidden,
            attributes = $ctrl.attributes,
            attrPrefix = $ctrl.attributes[0],
            attrNs1 = $ctrl.attributes[1],
            attrNs2 = $ctrl.attributes[2],
            attrToTest = $ctrl.attributes[4];

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
