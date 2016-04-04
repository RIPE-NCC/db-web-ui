
describe('bare homepage', function() {
    it('should not crash', function() {
        browser.get('http://localhost.dev.ripe.net/index_test.html');
        expect(browser.getTitle()).toEqual('Super Calculator');
        expect(1).toEqual(2);
        var xxele = element(by.id('xxx'));
        //console.log('xxx' + JSON.stringify(xxele));
        expect(xxele.getText()).toEqual('hello there');
    });

    // it('should add a todo', function() {
    //     browser.get('https://localhost.dev.ripe.net');
    //
    //     element(by.model('todoList.todoText')).sendKeys('write first protractor test');
    //     element(by.css('[value="add"]')).click();
    //
    //     var todoList = element.all(by.repeater('todo in todoList.todos'));
    //     expect(todoList.count()).toEqual(3);
    //     expect(todoList.get(2).getText()).toEqual('write first protractor test');
    //
    //     // You wrote your first test, cross it off the list
    //     todoList.get(2).element(by.css('input')).click();
    //     var completedAmount = element.all(by.css('.done-true'));
    //     expect(completedAmount.count()).toEqual(2);
    // });
});
