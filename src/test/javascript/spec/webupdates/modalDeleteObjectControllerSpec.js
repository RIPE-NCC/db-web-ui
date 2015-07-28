'use strict';

describe('webUpdates: ModalDeleteObjectController', function () {

    var $scope, $state, modalInstance, RestService, WhoisResources;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _WhoisResources_) {

            $state = _$state_;
            WhoisResources = _WhoisResources_;
            RestService =  { deleteObject: function() {
                return { then: function(f) { f();} }; // pretend to be a promise
            }};

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss')
            };

            $scope.objectType = 'MNT';
            $scope.name = 'TEST-MNT';
            $scope.source = 'RIPE';

            _$controller_('ModalDeleteObjectController', {
                $scope: $scope, $state:$state, $modalInstance: modalInstance, RestService:RestService, source:$scope.source, objectType:$scope.objectType, name:$scope.name
            });

        });
    });

    it('should call delete endpoint', function() {
        $scope.reason = 'some reason';

        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.delete();

        expect(RestService.deleteObject).toHaveBeenCalledWith($scope.source, $scope.objectType, $scope.name, $scope.reason);
    });

    it('should close modal after delete object', function() {
        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.delete();

        expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss modal after error deleting object', function() {
        spyOn(RestService, 'deleteObject').and.returnValue({then: function(a, b) { b({data:'error'}); }});

        $scope.delete();

        expect(modalInstance.dismiss).toHaveBeenCalledWith('error');
    });


    it('should redirect to succes delete page after delete object', function() {
        spyOn($state, 'transitionTo');

        $scope.delete();

        expect($state.transitionTo).toHaveBeenCalledWith('deleted', {source:$scope.source, objectType:$scope.objectType, name:$scope.name});
    });

    it('should close the modal and return error when canceled', function () {
        $scope.cancel();
        expect(modalInstance.close).toHaveBeenCalled();
    });

});

