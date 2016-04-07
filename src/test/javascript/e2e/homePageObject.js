'use strict';


module.exports = {
    selectForm: element(by.id('selectForm')),
    createForm: element(by.id('createForm')),
    createButton: element(by.css('button[ng-click]')),
    heading: element(by.id('createForm')).element(by.css('h1')),
    searchTextInput: element(by.id('searchtext')),
    selectObjectType: function(itemValue) {
        return element(by.cssContainingText('option', itemValue));
    }
};
