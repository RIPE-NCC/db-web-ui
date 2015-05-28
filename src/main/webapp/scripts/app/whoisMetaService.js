
'use strict';

angular.module('dbWebApp')
.service('WhoisMetaService', function() {

  this.getObjectTypes = function() {
      var keys = [];
      for(var key in this._objectTypesMap) {
          keys.push(key);
      }
      return keys;
  };

  this.getAllAttributesOnObjectType = function( objectTypeName ) {
      if( objectTypeName == null ) {
          return [];
      }
      return this._objectTypesMap[objectTypeName].attributes;
  };

  this.getMandatoryAttributesOnObjectType = function( objectTypeName ) {
      if( objectTypeName == null ) {
          return [];
      }
      return this._objectTypesMap[objectTypeName].attributes.filter(
          function(attr) {
              return attr.mandatory == true;
          }
      );
  };

  this._objectTypesMap =
  {
      "as-block" : { "name": "as-block", "description":null,
         "attributes":[
                { "name":"as-block", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":false, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "as-set" : { "name": "as-set", "description":null,
         "attributes":[
                { "name":"as-set", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"members", "mandatory":false, "multiple":true, "description":null},
                { "name":"mbrs-by-ref", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
    },
    "aut-num" : { "name": "aut-num", "description":null,
         "attributes":[
                { "name":"aut-num", "mandatory":true, "multiple":false, "description":null},
                { "name":"as-name", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"member-of", "mandatory":false, "multiple":true, "description":null},
                { "name":"import-via", "mandatory":false, "multiple":true, "description":null},
                { "name":"import", "mandatory":false, "multiple":true, "description":null},
                { "name":"mp-import", "mandatory":false, "multiple":true, "description":null},
                { "name":"export-via", "mandatory":false, "multiple":true, "description":null},
                { "name":"export", "mandatory":false, "multiple":true, "description":null},
                { "name":"mp-export", "mandatory":false, "multiple":true, "description":null},
                { "name":"default", "mandatory":false, "multiple":true, "description":null},
                { "name":"mp-default", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":false, "description":null},
                { "name":"sponsoring-org", "mandatory":false, "multiple":false, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"status", "mandatory":false, "multiple":false, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-routes", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "domain" : { "name": "domain", "description":null,
         "attributes":[
                { "name":"domain", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"zone-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"nserver", "mandatory":true, "multiple":true, "description":null},
                { "name":"ds-rdata", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "filter-set" : { "name": "filter-set", "description":null,
         "attributes":[
                { "name":"filter-set", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"filter", "mandatory":false, "multiple":false, "description":null},
                { "name":"mp-filter", "mandatory":false, "multiple":false, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "inet6num" : { "name": "inet6num", "description":null,
         "attributes":[
                { "name":"inet6num", "mandatory":true, "multiple":false, "description":null},
                { "name":"netname", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"country", "mandatory":true, "multiple":true, "description":null},
                { "name":"geoloc", "mandatory":false, "multiple":false, "description":null},
                { "name":"language", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":false, "description":null},
                { "name":"sponsoring-org", "mandatory":false, "multiple":false, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"status", "mandatory":true, "multiple":false, "description":null},
                { "name":"assignment-size", "mandatory":false, "multiple":false, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-routes", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-domains", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-irt", "mandatory":false, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "inetnum" : { "name": "inetnum", "description":null,
         "attributes":[
                { "name":"inetnum", "mandatory":true, "multiple":false, "description":null},
                { "name":"netname", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"country", "mandatory":true, "multiple":true, "description":null},
                { "name":"geoloc", "mandatory":false, "multiple":false, "description":null},
                { "name":"language", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":false, "description":null},
                { "name":"sponsoring-org", "mandatory":false, "multiple":false, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"status", "mandatory":true, "multiple":false, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-domains", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-routes", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-irt", "mandatory":false, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "inet-rtr" : { "name": "inet-rtr", "description":null,
         "attributes":[
                { "name":"inet-rtr", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"alias", "mandatory":false, "multiple":true, "description":null},
                { "name":"local-as", "mandatory":true, "multiple":false, "description":null},
                { "name":"ifaddr", "mandatory":true, "multiple":true, "description":null},
                { "name":"interface", "mandatory":false, "multiple":true, "description":null},
                { "name":"peer", "mandatory":false, "multiple":true, "description":null},
                { "name":"mp-peer", "mandatory":false, "multiple":true, "description":null},
                { "name":"member-of", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "irt" : { "name": "irt", "description":null,
         "attributes":[
                { "name":"irt", "mandatory":true, "multiple":false, "description":null},
                { "name":"address", "mandatory":true, "multiple":true, "description":null},
                { "name":"phone", "mandatory":false, "multiple":true, "description":null},
                { "name":"fax-no", "mandatory":false, "multiple":true, "description":null},
                { "name":"e-mail", "mandatory":true, "multiple":true, "description":null},
                { "name":"abuse-mailbox", "mandatory":false, "multiple":true, "description":null},
                { "name":"signature", "mandatory":false, "multiple":true, "description":null},
                { "name":"encryption", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"auth", "mandatory":true, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"irt-nfy", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "key-cert" : { "name": "key-cert", "description":null,
         "attributes":[
                { "name":"key-cert", "mandatory":true, "multiple":false, "description":null},
                { "name":"method", "mandatory":false, "multiple":false, "description":null},
                { "name":"owner", "mandatory":false, "multiple":true, "description":null},
                { "name":"fingerpr", "mandatory":false, "multiple":false, "description":null},
                { "name":"certif", "mandatory":true, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":false, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "mntner" : { "name": "mntner", "description":null,
         "attributes":[
                { "name":"mntner", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":false, "multiple":true, "description":null},
                { "name":"upd-to", "mandatory":true, "multiple":true, "description":null},
                { "name":"mnt-nfy", "mandatory":false, "multiple":true, "description":null},
                { "name":"auth", "mandatory":true, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"abuse-mailbox", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "organisation" : { "name": "organisation", "description":null,
         "attributes":[
                { "name":"organisation", "mandatory":true, "multiple":false, "description":null},
                { "name":"org-name", "mandatory":true, "multiple":false, "description":null},
                { "name":"org-type", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"address", "mandatory":true, "multiple":true, "description":null},
                { "name":"phone", "mandatory":false, "multiple":true, "description":null},
                { "name":"fax-no", "mandatory":false, "multiple":true, "description":null},
                { "name":"e-mail", "mandatory":true, "multiple":true, "description":null},
                { "name":"geoloc", "mandatory":false, "multiple":false, "description":null},
                { "name":"language", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":false, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":false, "multiple":true, "description":null},
                { "name":"abuse-c", "mandatory":false, "multiple":false, "description":null},
                { "name":"ref-nfy", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-ref", "mandatory":true, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"abuse-mailbox", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "peering-set" : { "name": "peering-set", "description":null,
         "attributes":[
                { "name":"peering-set", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"peering", "mandatory":false, "multiple":true, "description":null},
                { "name":"mp-peering", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "person" : { "name": "person", "description":null,
         "attributes":[
                { "name":"person", "mandatory":true, "multiple":false, "description":null},
                { "name":"address", "mandatory":true, "multiple":true, "description":null},
                { "name":"phone", "mandatory":true, "multiple":true, "description":null},
                { "name":"fax-no", "mandatory":false, "multiple":true, "description":null},
                { "name":"e-mail", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"nic-hdl", "mandatory":true, "multiple":false, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"abuse-mailbox", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":true, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "poem" : { "name": "poem", "description":null,
         "attributes":[
                { "name":"poem", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":false, "multiple":true, "description":null},
                { "name":"form", "mandatory":true, "multiple":false, "description":null},
                { "name":"text", "mandatory":true, "multiple":true, "description":null},
                { "name":"author", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":false, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "poetic-form" : { "name": "poetic-form", "description":null,
         "attributes":[
                { "name":"poetic-form", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":false, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "role" : { "name": "role", "description":null,
         "attributes":[
                { "name":"role", "mandatory":true, "multiple":false, "description":null},
                { "name":"address", "mandatory":true, "multiple":true, "description":null},
                { "name":"phone", "mandatory":false, "multiple":true, "description":null},
                { "name":"fax-no", "mandatory":false, "multiple":true, "description":null},
                { "name":"e-mail", "mandatory":true, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":false, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":false, "multiple":true, "description":null},
                { "name":"nic-hdl", "mandatory":true, "multiple":false, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"abuse-mailbox", "mandatory":false, "multiple":false, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "route" : { "name": "route", "description":null,
         "attributes":[
                { "name":"route", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"origin", "mandatory":true, "multiple":false, "description":null},
                { "name":"pingable", "mandatory":false, "multiple":true, "description":null},
                { "name":"ping-hdl", "mandatory":false, "multiple":true, "description":null},
                { "name":"holes", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"member-of", "mandatory":false, "multiple":true, "description":null},
                { "name":"inject", "mandatory":false, "multiple":true, "description":null},
                { "name":"aggr-mtd", "mandatory":false, "multiple":false, "description":null},
                { "name":"aggr-bndry", "mandatory":false, "multiple":false, "description":null},
                { "name":"export-comps", "mandatory":false, "multiple":false, "description":null},
                { "name":"components", "mandatory":false, "multiple":false, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-routes", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "route6" : { "name": "route6", "description":null,
         "attributes":[
                { "name":"route6", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"origin", "mandatory":true, "multiple":false, "description":null},
                { "name":"pingable", "mandatory":false, "multiple":true, "description":null},
                { "name":"ping-hdl", "mandatory":false, "multiple":true, "description":null},
                { "name":"holes", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"member-of", "mandatory":false, "multiple":true, "description":null},
                { "name":"inject", "mandatory":false, "multiple":true, "description":null},
                { "name":"aggr-mtd", "mandatory":false, "multiple":false, "description":null},
                { "name":"aggr-bndry", "mandatory":false, "multiple":false, "description":null},
                { "name":"export-comps", "mandatory":false, "multiple":false, "description":null},
                { "name":"components", "mandatory":false, "multiple":false, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-routes", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "route-set" : { "name": "route-set", "description":null,
         "attributes":[
                { "name":"route-set", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"members", "mandatory":false, "multiple":true, "description":null},
                { "name":"mp-members", "mandatory":false, "multiple":true, "description":null},
                { "name":"mbrs-by-ref", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      },
      "rtr-set" : { "name": "rtr-set", "description":null,
         "attributes":[
                { "name":"rtr-set", "mandatory":true, "multiple":false, "description":null},
                { "name":"descr", "mandatory":true, "multiple":true, "description":null},
                { "name":"members", "mandatory":false, "multiple":true, "description":null},
                { "name":"mp-members", "mandatory":false, "multiple":true, "description":null},
                { "name":"mbrs-by-ref", "mandatory":false, "multiple":true, "description":null},
                { "name":"remarks", "mandatory":false, "multiple":true, "description":null},
                { "name":"org", "mandatory":false, "multiple":true, "description":null},
                { "name":"tech-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"admin-c", "mandatory":true, "multiple":true, "description":null},
                { "name":"notify", "mandatory":false, "multiple":true, "description":null},
                { "name":"mnt-by", "mandatory":true, "multiple":true, "description":null},
                { "name":"mnt-lower", "mandatory":false, "multiple":true, "description":null},
                { "name":"changed", "mandatory":false, "multiple":true, "description":null},
                { "name":"created", "mandatory":false, "multiple":false, "description":null},
                { "name":"last-modified", "mandatory":false, "multiple":false, "description":null},
                { "name":"source", "mandatory":true, "multiple":false, "description":null}
         ]
      }
    };

});
