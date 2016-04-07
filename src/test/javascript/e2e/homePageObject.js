//(function () {
    'use strict';


    var AngularPage = function () {
        browser.get('index.html');
    };

    AngularPage.prototype = Object.create({}, {
        // todoText: {
        //     get: function () {
        //         return element(by.model('todoText'));
        //     }
        // },
        // addButton: {
        //     get: function () {
        //         return element(by.css('[value="add"]'));
        //     }
        // },
        // yourName: {
        //     get: function () {
        //         return element(by.model('yourName'));
        //     }
        // },
        // greeting: {
        //     get: function () {
        //         return element(by.binding('yourName')).getText();
        //     }
        // },
        // todoList: {
        //     get: function () {
        //         return element.all(by.repeater('todo in todos'));
        //     }
        // },
        // typeName: {
        //     value: function (keys) {
        //         return this.yourName.sendKeys(keys);
        //     }
        // },
        // todoAt: {
        //     value: function (idx) {
        //         return this.todoList.get(idx).getText();
        //     }
        // },
        selectForm: {
            get: function () {
                return element(by.id('selectForm'));
            }
        }
    });

    module.exports = AngularPage;
//})();
