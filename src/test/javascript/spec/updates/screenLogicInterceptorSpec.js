'use strict';

describe('updates: ScreenLogicInterceptor', function () {

    var interceptor;
    var whoisResources;

    beforeEach(module('updates'));

    beforeEach(inject(function (WhoisResources, ScreenLogicInterceptor) {
        whoisResources = WhoisResources;
        interceptor = ScreenLogicInterceptor;
    }));

    afterEach(function() {
    });


    function printAttrs( msg, attrs ) {
        console.log(
            msg + ':' + JSON.stringify(
                _.map(attrs, function(attr) {
                    return {name: attr.name, value: attr.value};
                }
                ))
        );
    }

    it('should call before-edit interceptor for person', function() {
        var before = whoisResources.wrapAttributes(whoisResources.getMandatoryAttributesOnObjectType('person', true));
        var errors = [];
        var warnings = [];
        var infos = [];


        var after = interceptor.beforeEdit('Create', 'RIPE', 'person', before, errors, warnings, infos );

        expect(after.length).toEqual(6);

        expect(after.getSingleAttributeOnName('source').value).toBe('RIPE');

        var nicHdle = after.getAllAttributesOnName('nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('AUTO-1');

        expect(errors.length).toBe(0);
        expect(warnings.length).toBe(0);
        expect(infos.length).toBe(0);
    });


});
