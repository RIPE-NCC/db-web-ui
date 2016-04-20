/*global browser, module*/

// System requires
var fs = require('fs');

'use strict';

// abstract writing screen shot to a file
function writeToDisk(data, filename) {
    var stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
}

function pad(val) {
    if (typeof val !== 'number') {
        return val;
    }
    return val < 10 ? '0' + val : val;
}

function timestamp() {
    var date = new Date();
    return [pad(date.getHours()), '_', pad(date.getMinutes()), '_', pad(date.getSeconds()), '.', date.getMilliseconds()].join('');
}

module.exports = {
    selectForm: element(by.id('selectForm')),
    createForm: element(by.id('createForm')),
    textCreateForm: element(by.id('textCreateForm')),
    heading: element(by.id('createForm')).element(by.css('h1')),
    searchTextInput: element(by.id('searchtext')),
    selectMaintainerDropdown: element(by.id('selectMaintainerDropdown')),

    btnNavigateToCreate: element(by.id('btnNavigateToCreate')),
    btnCreateInTextArea: element(by.id('btnCreateInTextArea')),
    btnSwitchToWebCreate: element(by.id('btnSwitchToWebCreate')),
    //btnSwitchToTextCreate: element(by.id('btnSwitchToTextCreate')),
    //btnSwitchToTextModify: element(by.id('btnSwitchToTextModify')),
    //btnEditInTextArea: element(by.id('btnEditInTextArea')),

    inpOrgName: element(by.id('createForm')).element(by.name('org-name')),
    inpOrganisation: element(by.id('createForm')).element(by.name('organisation')),
    inpOrgType: element(by.id('createForm')).element(by.name('org-type')),
    inpAddress: element(by.id('createForm')).element(by.name('address')),
    inpEmail: element(by.id('createForm')).element(by.name('e-mail')),
    inpAbuseC: element(by.id('createForm')).element(by.name('abuse-c')),
    inpMntRef: element(by.id('createForm')).element(by.name('mnt-ref')),
    inpSource: element(by.id('createForm')).element(by.name('source')),
    inpOrg: element(by.id('createForm')).element(by.name('org')),
    inpSponsoringOrg: element(by.id('createForm')).element(by.name('sponsoring-org')),
    btnAbuseCBell: element(by.id('createRoleForAbuseCAttribute')),

    modalEmail: element(by.css('[modal-window]')).element(by.name('email')),
    modalBtnSubmit: element(by.css('[modal-window]')).element(by.css('[value=Submit]')),

    selectObjectType: function(itemValue) {
        return element(by.id('objectTypeSelector')).element(by.css('option[label=' + itemValue + ']'));
    },

    takeScreenshot: function(/*optional string*/ imageName) {
        browser.takeScreenshot().then(function (png) {
            var filename = imageName ? imageName : 'screenshot-' + timestamp() + '.png';
            writeToDisk(png, filename);
        });
    }
};
