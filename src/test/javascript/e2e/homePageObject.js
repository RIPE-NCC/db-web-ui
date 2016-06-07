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
    return [
        pad(date.getFullYear()), '-', pad(date.getMonth() + 1), '-', pad(date.getDate()),
        'T',
        pad(date.getHours()), '_', pad(date.getMinutes()), '_', pad(date.getSeconds()), '.', date.getMilliseconds()
    ].join('');
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
    inpNetname: element(by.id('createForm')).element(by.name('netname')),
    inpAssignmentSize: element(by.id('createForm')).element(by.name('assignment-size')),
    inpAbuseC: element(by.id('createForm')).element(by.name('abuse-c')),
    inpMntRef: element(by.id('createForm')).element(by.name('mnt-ref')),
    inpSource: element(by.id('createForm')).element(by.name('source')),
    inpOrg: element(by.id('createForm')).element(by.name('org')),
    inpSponsoringOrg: element(by.id('createForm')).element(by.name('sponsoring-org')),
    inpInetnum: element(by.id('createForm')).element(by.name('inetnum')),
    inpInet6num: element(by.id('createForm')).element(by.name('inet6num')),
    inpStatus: element(by.id('createForm')).element(by.name('status')),
    inpStatusLink: element(by.id('createForm')).element(by.name('status')).element(by.css('a')),
    inpStatusList: element(by.id('createForm')).element(by.name('status')).element(by.css('div > ul > li > ul')).all(by.css('li')),
    btnAbuseCBell: element(by.id('createRoleForAbuseCAttribute')),

    modal: element(by.css('[modal-window]')),
    modalEmail: element(by.css('[modal-window]')).element(by.name('email')),
    modalInpMaintainer: element(by.css('[modal-window]')).element(by.model('selected.item')),
    modalBtnSubmit: element(by.css('[modal-window]')).element(by.css('input[type=Submit]')),
    modalClose: element(by.css('[modal-window]')).element(by.css('.modal-header')).element(by.css('i[ng-click]')),

    selectObjectType: function (itemValue) {
        return element(by.id('objectTypeSelector')).element(by.css('option[label=' + itemValue + ']'));
    },

    takeScreenshot: function (/*optional string*/ imageName) {
        var filename = imageName ? imageName : 'screenshot-' + timestamp() + '.png';
        browser.takeScreenshot().then(function (png) {
            writeToDisk(png, filename);
        });
        return filename;
    },

    scrollIntoView: function (el) {
        browser.executeScript(function (el) {
            el.scrollIntoView();
        }, el.getWebElement());
    }

};
