/*global browser, by, element, module, require*/
'use strict';

// System requires
var fs = require('fs');


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

    inpOrgName: element(by.id('createForm')).element(by.name('org-name')),
    inpOrganisation: element(by.id('createForm')).element(by.name('organisation')),
    inpOrgType: element(by.id('createForm')).element(by.name('org-type')),
    inpAddress: element(by.id('createForm')).element(by.name('address')),
    inpEmail: element(by.id('createForm')).element(by.name('e-mail')),
    inpNetname: element(by.id('createForm')).element(by.name('netname')),
    inpAssignmentSize: element(by.id('createForm')).element(by.name('assignment-size')),
    inpMntnerBox: element(by.id('createForm')).element(by.id('selectMaintainerDropdown')),
    inpAbuseC: element(by.id('createForm')).element(by.name('abuse-c')),
    inpMntRef: element(by.id('createForm')).element(by.name('mnt-ref')),
    inpSource: element(by.id('createForm')).element(by.name('source')),
    inpOrg: element(by.id('createForm')).element(by.name('org')),
    inpSponsoringOrg: element(by.id('createForm')).element(by.name('sponsoring-org')),
    inpInetnum: element(by.id('createForm')).element(by.name('inetnum')),
    inpInet6num: element(by.id('createForm')).element(by.name('inet6num')),
    inpMaintainer: element(by.id('selectMaintainerDropdown')),
    inpStatus: element(by.id('createForm')).element(by.name('status')),
    inpStatusLink: element(by.id('createForm')).element(by.name('status')).element(by.css('a')),
    inpStatusList: element(by.id('createForm')).element(by.name('status')).element(by.css('div > ul > li > ul')).all(by.css('li')),
    btnAbuseCBell: element(by.id('createRoleForAbuseCAttribute')),

    inpAdminC: element(by.id('createForm')).element(by.name('admin-c')),
    inpTechC: element(by.id('createForm')).element(by.name('tech-c')),
    inpCountry: element(by.id('createForm')).element(by.name('country')),
    inpCountryList: element(by.id('createForm')).element(by.name('country')).element(by.css('div > ul > li > ul')).all(by.css('li')),
    btnSubmitForm: element(by.id('btnSubmitCreate')),
    btnDeleteObject: element(by.id('deleteObject')),

    btnModify: element(by.css('section.inner-container')).element(by.css('span[ng-show]')).element(by.css('button[ng-click]')),

    modal: element(by.css('[modal-window]')),
    modalAttributeList:  element(by.css('[modal-window]')).element(by.css('select')),
    modalEmail: element(by.css('[modal-window]')).element(by.name('email')),
    modalInpMaintainer: element(by.css('[modal-window]')).element(by.model('selected.item')),
    modalInpPassword: element(by.css('[modal-window]')).element(by.model('selected.password')),
    modalInpAssociate: element(by.css('[modal-window]')).element(by.model('selected.associate')),
    modalBtnSubmit: element(by.css('[modal-window]')).element(by.css('input[type=Submit]')),
    modalClose: element(by.css('[modal-window]')).element(by.css('.modal-header')).element(by.css('i[ng-click]')),
    modalBody: element(by.css('[modal-window]')).element(by.css('.modal-body')),
    modalFooter: element(by.css('[modal-window]')).element(by.css('.modal-footer')),

    /**
     * Experimental support for iMacros scripts.
     *
     * @see http://wiki.imacros.net/TAG
     * @param str
     */
    iimPlay: function (str) {

        function parseAttr(attr) {
            var sp = attr.split('&&');
            var className, textContent, name;

            for (var i = 0; i < sp.length; i++) {
                if (sp[i].indexOf('CLASS:') > -1) {
                    // skip chars CLASS:
                    className = sp[i].substring(6);
                } else if (sp[i].indexOf('TXT:') > -1) {
                    textContent = sp[i].substring(4);
                } else if (sp[i].indexOf('NAME:') > -1) {
                    name = sp[i].substring(5);
                }
            }
            return {
                className: className.replace('<SP>', ' '),
                text: textContent.replace('<SP>', ' '),
                name: name
            };
        }

        function locator(line) {
            var type = line.match(/TYPE=([^ ]*)/)[1].split(':');
            var pos = parseInt(line.match(/POS=([^ ]*)/)[1], 10);
            var attr = parseAttr(line.match(/ATTR=([^ ]*)/)[1]);
            //var content = line.match(/CONTENT=([^ ]*)/)[1];

            var xpathExpr = ['//', type[0]];
            if (attr.className) {
                xpathExpr.push('[@class="', attr.className, '"]');
            }
            xpathExpr.push('[position()=', pos, ']');

            var locator = element(by.xpath(xpathExpr.join('')));
            //console.log('pos', pos, 'type', type, 'attr', attr, 'locator', locator);
            return locator;
        }

        function playLine(line) {
            var target = locator(line);
            target.click();
        }

        playLine(str);
    },

    selectFromList: function (listElement, itemValue) {
        return listElement.element(by.css('option[label=' + itemValue + ']'));
    },

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
