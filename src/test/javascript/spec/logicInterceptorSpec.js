'use strict';

describe('dbWebApp: LogicInterceptor', function () {

    var logicInterceptor;
    var whoisResources;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (WhoisResources, LogicInterceptor) {
        whoisResources = WhoisResources;
        logicInterceptor = LogicInterceptor;
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

        printAttrs('before:', before );
        var after =
            logicInterceptor.beforeEdit('Create', 'RIPE', 'person', before, errors, warnings, infos );
        printAttrs('after:', after);

        expect(after.length).toEqual(6);

        expect(after.getSingleAttributeOnName('source').value).toBe('RIPE');

        var nicHdle = after.getAllAttributesOnName('nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('AUTO-1');
    });


});
