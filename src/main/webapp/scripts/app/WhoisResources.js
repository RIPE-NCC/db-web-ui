var WhoisResources = (function () {

      var getGlobalErrors = function (whoisResources) {
          return whoisResources.errormessages.errormessage.filter(
              function (errorMessage) {
                return errorMessage.severity == 'Error' && errorMessage.attribute == null
          });
      };

      var getGlobalWarnings = function (whoisResources) {
          return whoisResources.errormessages.errormessage.filter( 
              function (errorMessage) {
               return errorMessage.severity == 'Warning' && errorMessage.attribute == null
          });
      };

      var getErrorsOnAttribute = function (whoisResources,attributeName) {
          return whoisResources.errormessages.errormessage.filter(
              function (errorMessage) {
                  if( errorMessage.attribute != null ) {
                    return errorMessage.attribute.name == attributeName;
                  }
                  return false;
          });
      };
          
      var getSingleAttributeOnName = function (whoisResources,attributeName) {
          attributes = whoisResources.objects.object[0].attributes.attribute.filter(
              function (attribute) {
                    return attribute.name == attributeName
          });
          if( attributes == null || attributes.length == 0 ) {
              return null;
          }
          return attributes[0];
      };

      var countAttributesOnName = function (whoisResources,attributeName) {
          return whoisResources.objects.object[0].attributes.attribute.filter(
              function (attribute) {
                    return attribute.name == attributeName
          }).length;
      };

      var getAllAttributesOnName = function (whoisResources,attributeName) {
          return whoisResources.objects.object[0].attributes.attribute.filter(
              function (attribute) {
                    return attribute.name == attributeName
          });
      };

      var setAttributeValueOnName = function (whoisResources, attributeName, attributeValue) {
          attribute = getSingleAttributeOnName(whoisResources, attributeName);
          if( attributes != null ) {
              attributes[0].value = attributeValue;
          }
      };

      var addAttributeValueOnName = function (whoisResources,attributeName, attributeValue) {
          whoisResources.objects.object[0].attributes.attribute.push({'name':attributeName, 'value':attributeValue});
      };

      var getObjectType = function(whoisResources) {
          return whoisResources.objects.object[0].type;
      };

      var setObjectType = function(whoisResources,objectType) {
          whoisResources.objects.object[0].type = objectType;
      };

      return {
          getGlobalErrors: getGlobalErrors,
          getGlobalWarnings: getGlobalWarnings,
          getErrorsOnAttribute: getErrorsOnAttribute,
          countAttributesOnName: countAttributesOnName,
          getSingleAttributeOnName: getSingleAttributeOnName,
          getAllAttributesOnName: getAllAttributesOnName,
          setAttributeValueOnName: setAttributeValueOnName,
          addAttributeValueOnName: addAttributeValueOnName,
          getObjectType: getObjectType,
          setObjectType: setObjectType
      };
})();


function assertThat( testName, actual, expected ) {
    if( actual != expected ) {
        console.log(testName + ": error: actual '"+ actual + "' != expected '" + expected + "'");
    } else {
        console.log(testName + ": OK");
    }
}

var errorResponse = {
 'errormessages' : {
    'errormessage' : [ 
        {
          'severity' : 'Error',
          'text' : 'Unrecognized source: %s',
          'args' : [ { 'value' : 'INVALID_SOURCE' } ]
        },
        {
          'severity' : 'Warning',
          'text' : 'Not authenticated'
        }, {
          'severity' : 'Error',
          'attribute' : {
            'name' : 'admin-c',
            'value' : 'INVALID'
          },
          'text' : '\'%s\' is not valid for this object type',
          'args' : [ { 'value' : 'admin-c' } ]
        } 
     ]
  }
}

errors = WhoisResources.getGlobalErrors(errorResponse);
assertThat("getGlobalErrors", errors[0].text, "Unrecognized source: %s" );

warnings = WhoisResources.getGlobalWarnings(errorResponse);
assertThat( "getGlobalWarnings", warnings[0].text, "Not authenticated" );

specificErrors = WhoisResources.getErrorsOnAttribute(errorResponse,"admin-c");
assertThat("getErrorsOnAttribute", specificErrors[0].text, "\'%s\' is not valid for this object type" );

var okResponse = {
    "link": {
        "xlink:type": "locator",
        "xlink:href": "http://rest.db.ripe.net/ripe"
    },
    "objects": {
        "object": [
            {
                "type": "person",
                "link": {
                    "xlink:type": "locator",
                    "xlink:href": "http://rest.db.ripe.net/ripe/person/PP1-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [
                        {
                            "name": "nic-hdl",
                            "value": "PP1-RIPE"
                        }
                    ]
                },
                "attributes": {
                    "attribute": [
                        {
                            "name": "person",
                            "value": "Pauleth Palthen"
                        },
                        {
                            "name": "address",
                            "value": "Singel 258"
                        },
                        {
                            "name": "phone",
                            "value": "+31-1234567890"
                        },
                        {
                            "name": "e-mail",
                            "value": "noreply@ripe.net"
                        },
                        {
                            "link": {
                                "xlink:type": "locator",
                                "xlink:href": "http://rest.db.ripe.net/ripe/mntner/OWNER-MNT"
                            },
                            "name": "mnt-by",
                            "value": "OWNER-MNT",
                            "referenced-type": "mntner"
                        },
                        {
                            "name": "nic-hdl",
                            "value": "PP1-RIPE"
                        },
                        {
                            "name": "changed",
                            "value": "noreply@ripe.net 20120101"
                        },
                        {
                            "name": "remarks",
                            "value": "remark"
                        },
                        {
                            "name": "source",
                            "value": "RIPE"
                        }
                    ]
                }
            }
        ]
    }, 
    "terms-and-conditions": {
         "xlink:type": "locator",
         "xlink:href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
    }  
}

assertThat("getObjectType", WhoisResources.getObjectType(okResponse), "person" );
WhoisResources.setObjectType(okResponse, "mntner" );
assertThat("setObjectType", WhoisResources.getObjectType(okResponse), "mntner" );

assertThat("countAttributeOnName", WhoisResources.countAttributesOnName(okResponse,"nic-hdl"), 1 );
assertThat("getSingleAttributeOnName", WhoisResources.getSingleAttributeOnName(okResponse,"nic-hdl").value, "PP1-RIPE" );
assertThat("getAllAttributesOnName", WhoisResources.getAllAttributesOnName(okResponse,"nic-hdl")[0].value, "PP1-RIPE" );

WhoisResources.setAttributeValueOnName(okResponse, "nic-hdl", "MARC" );
assertThat("setAttributeOnName", WhoisResources.getSingleAttributeOnName(okResponse, "nic-hdl").value,"MARC" );

WhoisResources.addAttributeValueOnName(okResponse, "remarks", "Marcs test remark" );
assertThat("countAttributeOnName", WhoisResources.countAttributesOnName(okResponse, "remarks"),2 );
assertThat("addAttributeOnName", WhoisResources.getAllAttributesOnName(okResponse, "remarks")[0].value,"remark" );
assertThat("addAttributeOnName", WhoisResources.getAllAttributesOnName(okResponse, "remarks")[1].value,"Marcs test remark" );

