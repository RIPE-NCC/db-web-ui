
'use strict';

angular.module('dbWebuiApp')
.service('WhoisRestService', function() {
	  var _objectType = null;
	  var _objectUid = null;
	  var _attributes = [];
	  var _errors = [];
	  var _warnings = [];

    this.getObject = function( objectType, objectUid) {
       return _attributes;
    }

    this.createObject = function( objectType, attributes) {
       _objectType = objectType;
       _attributes = attributes;
       _warnings[0] = "Deprecated attribute 'changed' used";
       return "123";
    }

    this.modifyObject = function( objectType, objectUid, attributes) {
       _objectType = objectType;
       _objectUid = objectUid;
       _attributes = attributes;
       _warnings = [];
    }

    this.deleteObject = function( objectType, objectUid) {
       _objectType = null;
       _attributes = [];
    }

    this.getErrors = function() {
    	return _errors;
    }

    this.getWarnings = function() {
    	return _warnings;
    }

});
