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

function GetWhoisObject(parent) {

    var _this = this;
    this.parent = parent;

    this.directive = function () {
        return (typeof _this.parent !== 'undefined') ? parent.element(by.css('whois-object-viewer')) : element(by.css('whois-object-viewer'));
    };

    this.attributes = function () {
        return _this.directive().element(by.css('pre')).element(by.css('ul')).all(by.css('li'));
    };

    this.isPresent = function () {
        return _this.directive().isPresent();
    };

    this.showMoreButton = function () {
        return _this.directive().element(by.css('.show-more'));
    };

    this.showRipeStatButton = function () {
        return _this.directive().element(by.css('.ripe-stat-button'));
    };

    this.showUpdateObjectButton = function () {
        return _this.directive().element(by.css('.update-object-button'));
    };
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
    btnUpdateObjectButton: element(by.css('div.viewerbuttons')).element(by.css('a.blue-button[ng-click]')),

    inpOrgName: element(by.id('createForm')).element(by.name('org-name')),
    inpOrganisation: element(by.id('createForm')).element(by.name('organisation')),
    inpOrgType: element(by.id('createForm')).element(by.name('org-type')),
    inpAddress: element(by.id('createForm')).all(by.name('address')).get(0),
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
    inpStatusLink: element(by.id('createForm')).element(by.name('status')),
    inpStatusList: element(by.id('createForm')).element(by.name('status')).element(by.css('.ui-select-choices-group')).all(by.css('.ui-select-choices-row')),
    inpPrefix: element(by.id('createForm')).element(by.name('prefix$0')),
    inpNserver1: element(by.id('createForm')).element(by.name('nserver$1')),
    inpNserver2: element(by.id('createForm')).element(by.name('nserver$2')),
    inpAdminC4: element(by.id('createForm')).element(by.name('admin-c$4')),
    inpTechC5: element(by.id('createForm')).element(by.name('tech-c$5')),
    inpZoneC6: element(by.id('createForm')).element(by.name('zone-c$6')),
    inpReverseZoneTable: element(by.id('createForm')).element(by.css('table')),
    inpRemarks: element(by.id('createForm')).element(by.name('remarks')),
    inpDescrCreateForm: element(by.id('createForm')).element(by.name('descr')),
    btnAbuseCBell: element(by.id('createRoleForAbuseCAttribute')),

    inpAutnum: element(by.id('createForm')).element(by.name('aut-num')),
    inpAsName: element(by.id('createForm')).element(by.name('as-name')),

    inpAdminC: element(by.id('createForm')).element(by.name('admin-c')),
    inpTechC: element(by.id('createForm')).element(by.name('tech-c')),
    inpCountry: element(by.id('createForm')).element(by.name('country')),
    inpCountryList: element(by.id('createForm')).element(by.name('country')).element(by.css('.ui-select-choices-group')).all(by.css('.ui-select-choices-row')),
    btnSubmitForm: element(by.id('btnSubmitCreate')),
    inpRoute: element(by.id('createForm')).element(by.name('route')),
    inpOrigin: element(by.id('createForm')).element(by.name('origin')),
    btnDeleteObject: element(by.id('deleteObject')),
    btnConfirmDeleteObject: element(by.id('btnConfirmDeleteObject')),
    btnSubmitModify: element(by.id('btnSubmitModify')),

    displayPanel: element(by.css('section.inner-container')),
    btnModify: element(by.css('section.inner-container')).element(by.css('span[ng-show]')).element(by.css('button[ng-click]')),
    btnAddAttribute: element(by.id('createForm')).element(by.css('.attr-0')).element(by.css('.fa.fa-plus')),
    allObjectRows: element(by.id('createForm')).element(by.css('section.visible-field-form')).element(by.css('ul.appeared-fields')).all(by.css('li')),

    modal: element(by.css('[uib-modal-window]')),
    modalAttributeList: element(by.css('[uib-modal-window]')).element(by.css('select')),
    modalEmail: element(by.css('[uib-modal-window]')).element(by.name('email')),
    modalInpMaintainer: element(by.css('[uib-modal-window]')).element(by.model('$ctrl.selected.item')),
    modalInpPassword: element(by.css('[uib-modal-window]')).element(by.model('$ctrl.selected.password')),
    modalInpAssociate: element(by.css('[uib-modal-window]')).element(by.model('$ctrl.selected.associate')),
    modalOrg: element(by.css('[uib-modal-window]')).element(by.css("option[label='org']")),
    modalBtnSubmit: element(by.css('[uib-modal-window]')).element(by.css('button[type=submit]')),
    modalClose: element(by.css('[uib-modal-window]')).element(by.css('.modal-header')).element(by.css('.close')),
    modalBody: element(by.css('[uib-modal-window]')).element(by.css('.modal-body')),
    modalFooter: element(by.css('[uib-modal-window]')).element(by.css('.modal-footer')),
    modalSplashBtn: element(by.id('modal-splash-button')),
    modalSplashText: element(by.css('[uib-modal-window]')).element(by.css('h1')),

    orgSelector: element(by.id('organisation-selector')),
    orgSelectorOptions: element(by.id('organisation-selector')).all(by.css('small')),
    orgSelectorOptions0: element(by.id('ui-select-choices-row-0-0')),
    orgSelectorOptions1: element(by.id('ui-select-choices-row-0-1')),
    orgSelectorOptions2: element(by.id('ui-select-choices-row-0-2')),

    // Lefthand menu items
    topMenuItems: element.all(by.css('.toplevel li.child')),
    myLirMenuItems: element.all(by.css('.toplevel li.child')).get(0).all(by.css('.level2 li')),
    resourcesMenuItems: element.all(by.css('.toplevel li.child')).get(1).all(by.css('.level2 li')),
    ripeDatabaseMenuItems: element.all(by.css('.toplevel li.child')).get(2).all(by.css('.level2 li')),

    // My resources
    myResources: element(by.css('.my-resources')),
    myResourcesTabs: element(by.css('.my-resources')).element(by.id('ipv4-ipv6-asn-tabs')).all(by.css('.nav-item')),
    myResourcesActiveTabLabel: element(by.css('.my-resources')).element(by.id('ipv4-ipv6-asn-tabs')).element(by.css('.nav-item.active')),
    myResourcesActiveTabContent: element(by.css('.my-resources')).element(by.id('ipv4-ipv6-asn-tabs')).element(by.css('.tab-pane.active')),
    myResourcesActiveTabRows: element(by.css('.my-resources')).element(by.id('ipv4-ipv6-asn-tabs')).element(by.css('.tab-pane.active')).all(by.css('resource-item')),
    tabsMySponsoredResources: element(by.css('.my-resources')).element(by.css('.resources-sponsored-tabs')),
    tabsMySponsoredResourcesActiveLabel: element(by.css('.my-resources')).element(by.css('.resources-sponsored-tabs')).element(by.css('.nav-tabs')).element(by.css('.nav-item.active')),
    tabMyResources: element(by.css('.my-resources')).element(by.css('.resources-sponsored-tabs')).all(by.css('li')).get(0),
    tabSponsoredResources: element(by.css('.my-resources')).element(by.css('.resources-sponsored-tabs')).all(by.css('li')).get(1),
    tabsMySponsoredResourcesAllTabs: element(by.css('.my-resources')).element(by.css('.resources-sponsored-tabs')).all(by.css('li')),
    btn1HierarchySelector: element(by.css('hierarchy-selector')).element(by.css('.fa-chevron-left')),
    btn2HierarchySelector: element(by.css('hierarchy-selector')).element(by.css('.fa-sitemap')),
    btnTransfer: element(by.css('.my-resources')).element(by.css('transfer-drop-down')).element(by.css('.grey-button')),
    transferMenuItems: element(by.css('.my-resources')).element(by.css('transfer-drop-down')).all(by.css('li')),

    // More specifics page
    moreSpecificsTable: element(by.css('.table')),
    moreSpecificsTableRows: element(by.css('.table')).element(by.css('tbody')).all(by.css('tr')),

    usageStatus: element(by.css('ip-usage')),
    usageStatusStatistics: element(by.css('ip-usage')).all(by.css('.box-statistic')),

    flagsContainer: element(by.css('.flags-container')),
    flags: element(by.css('.flags-container')).all(by.css('flag')),

    numberOfMoreSpecific: element(by.css('.prefix-filter')),
    filterOfMoreSpecific: element(by.id('ipFilter')),

    // Whois Object Viewer / lookup
    lookupPageViewer: element(by.css('whois-object-viewer')),
    lookupPageObjectLi: element(by.css('whois-object-viewer')).all(by.css('li')),
    lookupHeader: element(by.css('lookup')).element(by.css('.lookupheader')),
    ripeManagedAttributesCheckbox: element(by.css('whois-object-viewer')).element(by.css('.checkbox')),
    btnRipeStat: element(by.css('whois-object-viewer')).element(by.css('.ripe-stat-button')),
    lookupLinkToXmlJSON: element(by.id('resultsSection')).element(by.css('.resultlinks')).all(by.css('a')),

    // Whois Object Editor
    inpDescr: element(by.css('whois-object-editor')).element(by.name('descr$2')),
    inpDescr2: element(by.css('whois-object-editor')).element(by.name('descr$3')),
    woeNetname: element(by.css('whois-object-editor')).element(by.name('netname$1')),
    woeOrg: element(by.css('whois-object-editor')).element(by.name('org$1')),
    woeSource: element(by.css('whois-object-editor')).element(by.name('source$8')),
    woeBtnAddAttribute: element(by.css('whois-object-editor')).all(by.css('.fa.fa-plus')).first(),
    btnSubmitObject: element(by.css('whois-object-editor')).element(by.css('.blue-button')),
    successMessage: element(by.css('.alert-success')),
    infoMessage: element(by.css('.alert-info')),

    // Query page
    inpQueryString: element(by.model('$ctrl.qp.queryText')),
    inpShowFullDetails: element(by.model('$ctrl.qp.showFullObjectDetails')),
    inpDontRetrieveRelated: element(by.model('$ctrl.qp.doNotRetrieveRelatedObjects')),
    btnSubmitQuery: element(by.name('searchform')).element(by.css('button.blue-button')),
    resultsSection: element(by.id('resultsSection')),
    searchResults: element(by.id('resultsSection')).all(by.css('lookup')),
    queryParamTabs: element(by.name('searchform')).element(by.css('.nav.nav-tabs')).all(by.css('li')),

    // Syncupdate page
    inpSyncupdateString: element(by.model('$ctrl.rpslObject')),
    viewSyncupdateString: element(by.id('updateResultPreview')),
    btnUpdate: element(by.name('btnSyncupdate')),
    btnSwitchSyncupdates: element(by.name('btnSwitchSyncupdates')),

    // full text search page
    fullTextSearchResults: element(by.id('resultsAnchor')).all(by.css('.results')),
    fullTextResultSummaryRow: element(by.css('full-text-result-summary')).element(by.css('tbody')).all(by.css('tr')),

    // FMP page
    fmpForm: element(by.name('fmpform')),
    fmpReason: element(by.name('fmpform')).element(by.id('reason')),
    fmpEmail: element(by.name('fmpform')).element(by.id('email')),
    fmpNext: element(by.name('fmpform')).element(by.id('next')),
    fmpStep2: element(by.id('fmp-step2')),

    //Find maintainer
    findMaintainerForm: element(by.id('find-maintainer')),
    searchMaintainer: element(by.id('find-maintainer')).element(by.id('search-maintainer')),
    inputMaintainer: element(by.id('find-maintainer')).element(by.id('input-maintainer')),
    searchMaintainerCancel: element(by.id('find-maintainer')).element(by.id('search-cancel')),
    errorAlert: element(by.css('.alert-expired')),
    maintainerContainer: element(by.id('maintainer-container')),

    checkImg: element(by.css('email-confirmation')).element(by.css('.fa-check')),
    exclamationImg: element(by.css('email-confirmation')).element(by.css('.fa-exclamation-circle')),
    emailConfirmationMsg: element(by.css('email-confirmation')).element(by.css('h2')),

    byId: function(id) {
        return element(by.id(id));
    },

    progressbarFromResourceItem: function (row) {
        return this.myResourcesActiveTabRows.get(row).element(by.css('.progress-bar'));
    },

    btnAddAnAttribute: function(attribute) {
        return attribute.element(by.xpath('../../..')).element(by.css('.fa.fa-plus'));
    },

    btnRemoveAttribute: function(attribute) {
        return attribute.element(by.xpath('../../..')).element(by.css('.fa.fa-trash'));
    },

    getTableCell: function (tableElement, rowIndex, colIndex) {
        return tableElement.element(by.css('tbody')).all(by.css('tr')).get(rowIndex).all(by.css('td')).get(colIndex);
    },

    getListItem: function (list, index) {
        return list.all(by.css('li')).get(index);
    },

    getContentInTableCell: function(tableCell, cssExpression) {
        return tableCell.element(by.css(cssExpression));
    },

    /*
    orderNumber - number of whois object position between results objects on Query Page
     */
    getWhoisObjectViewerOnQueryPage: function(orderNumber) {
        return this.searchResults.get(orderNumber).element(by.css('whois-object-viewer'))
    },

    /*
    whoisViewerNumber - order number of whois object in search result on Query Page
    attributeNumber - attribute order number in specified whois object on Query Page
     */
    getAttributeValueFromWhoisObjectOnQueryPage: function(whoisViewerNumber, attributeNumber) {
        return this.getWhoisObjectViewerOnQueryPage(whoisViewerNumber).all(by.css('li')).get(attributeNumber).element(by.css('span'));
    },

    getAttributeHrefFromWhoisObjectOnQueryPage: function(whoisViewerNumber, attributeNumber) {
        return this.getWhoisObjectViewerOnQueryPage(whoisViewerNumber).all(by.css('li')).get(attributeNumber).element(by.css('a'));
    },

    getRipeStateFromWhoisObjectOnQueryPage: function(whoisViewerNumber) {
        return this.searchResults.get(whoisViewerNumber).element(by.css('.ripe-stat-button'))
    },

    getAttributeHrefFromWhoisObjectOnLookupPage: function(attributeNumber) {
        return this.lookupPageObjectLi.get(attributeNumber).element(by.css('a'));
    },

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

            //console.log('pos', pos, 'type', type, 'attr', attr, 'locator', locator);
            return element(by.xpath(xpathExpr.join('')));
        }

        function playLine(line) {
            var target = locator(line);
            target.click();
        }

        playLine(str);
    },

    selectFromList: function (listElement, itemValue) {
        return listElement.element(by.css('option[label="' + itemValue + '"]'));
    },

    selectObjectType: function (itemValue) {
        return element(by.id('objectTypeSelector')).element(by.css('option[label="' + itemValue + '"]'));
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
    },

    getWhoisObject: function (parent) {
        return new GetWhoisObject(parent);
    }
};
