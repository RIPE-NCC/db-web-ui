'use strict';

describe('dbWebApp: WhoisResourcesUtil', function () {

    var $whoisResourcesUtil;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (WhoisResourcesUtil) {
        $whoisResourcesUtil = WhoisResourcesUtil;
    }));

    afterEach(function () {

    });

    it('should work with error response', function () {

        var whoisResourcesWithErrorsAnsWarnings = {
            'errormessages': {
                'errormessage': [
                    {
                        'severity': 'Error',
                        'text': 'Unrecognized source: %s',
                        'args': [{'value': 'INVALID_SOURCE'}]
                    },
                    {
                        'severity': 'Warning',
                        'text': 'Not authenticated'
                    }, {
                        'severity': 'Error',
                        'attribute': {
                            'name': 'admin-c',
                            'value': 'INVALID'
                        },
                        'text': '\'%s\' is not valid for this object type',
                        'args': [{'value': 'admin-c'}]
                    }
                ]
            }
        }

        expect($whoisResourcesUtil.getGlobalErrors(whoisResourcesWithErrorsAnsWarnings)).toEqual([
            {'severity': 'Error', 'text': 'Unrecognized source: %s', 'args': [{'value': 'INVALID_SOURCE'}]}
        ]);

        expect($whoisResourcesUtil.getGlobalWarnings(whoisResourcesWithErrorsAnsWarnings)).toEqual([
            {'severity': 'Warning', 'text': 'Not authenticated'}
        ]);

        expect($whoisResourcesUtil.getErrorsOnAttribute(whoisResourcesWithErrorsAnsWarnings, 'admin-c')).toEqual([
            {
                'severity': 'Error',
                'attribute': {
                    'name': 'admin-c',
                    'value': 'INVALID'
                },
                'text': '\'%s\' is not valid for this object type',
                'args': [{'value': 'admin-c'}]
            }
        ]);

        expect($whoisResourcesUtil.getAttributes(whoisResourcesWithErrorsAnsWarnings)).toEqual([
        ])

    });

    it('should work with success response', function () {

        var whoisSuccessResponse = {
            "link": {
                "type": "locator",
                "href": "http://localhost.dev.ripe.net:8443/RIPE/person"
            },
            "objects": {
                "object": [
                    {
                        "type": "person",
                        "link": {
                            "type": "locator",
                            "href": "http://rest-dev.db.ripe.net/ripe/person/MG20276-RIPE"
                        },
                        "source": {
                            "id": "ripe"
                        },
                        "primary-key": {
                            "attribute": [
                                {
                                    "name": "nic-hdl",
                                    "value": "MG20276-RIPE"
                                }
                            ]
                        },
                        "attributes": {
                            "attribute": [
                                {
                                    "name": "as-block",
                                    "value": "a"
                                },
                                {
                                    "name": "mnt-by",
                                    "value": "b",
                                },
                                {
                                    "name": "source",
                                    "value": "c"
                                }
                            ]
                        }
                    }
                ]
            },
            "terms-and-conditions": {
                "type": "locator",
                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
            }
        };

        expect($whoisResourcesUtil.getGlobalErrors(whoisSuccessResponse)).toEqual([
        ]);

        expect($whoisResourcesUtil.getGlobalWarnings(whoisSuccessResponse)).toEqual([
        ]);

        expect($whoisResourcesUtil.getObjectUid(whoisSuccessResponse)).toEqual("MG20276-RIPE");

        expect($whoisResourcesUtil.getAttributes(whoisSuccessResponse)).toEqual( [
                { "name": "as-block",  "value": "a"  },
                { "name": "mnt-by", "value": "b"  },
                { "name": "source",  "value": "c"  }
        ]);

    });

});
