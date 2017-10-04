/*global beforeEach,describe,inject,it*/
'use strict';

describe('The Paginator', function () {

    var $componentController;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function(_$componentController_) {
        $componentController = _$componentController_;
    }));

    it('should show all results on 1 page', function () {
        var ctrl = $componentController('paginator');
        ctrl.numResults = 5;
        ctrl.resultsPerPage = 100;

        ctrl.refresh();
        expect(ctrl.hidePaginator).toEqual(true);
        expect(ctrl.activePage).toEqual(1);
    });

    it('should figure out how many pages to show and go there', function () {
        var ctrl = $componentController('paginator', null, {pageClicked: function() {}});
        ctrl.numResults = 400;
        ctrl.resultsPerPage = 10;

        ctrl.refresh();
        expect(ctrl.hidePaginator).toEqual(false);
        expect(ctrl.activePage).toEqual(1);

        ctrl.fastFwd(2);
        expect(ctrl.activePage).toEqual(3);

        ctrl.pageSelected(2);
        expect(ctrl.activePage).toEqual(2);
    });

});
