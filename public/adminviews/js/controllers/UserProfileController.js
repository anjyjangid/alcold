'use strict';

MetronicApp.controller('UserProfileController',['$rootScope', '$scope', '$timeout','userModel','AdminUserService', function($rootScope, $scope, $timeout,userModel,AdminUserService) {
    

    $scope.$on('$viewContentLoaded', function() {
        Metronic.initAjax(); // initialize core components
                                                                        
        /*userModel.getUserDetails().success(function(response) {
            $scope.user = response;
        });*/        
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = true;
    $rootScope.settings.layout.pageSidebarClosed = false;  

    $scope.errors = {};

	angular.extend($scope, {
        
        submitAccount: function(accountForm) {
        	        	
            var data = {
                first_name: $scope.user.first_name,
                last_name: $scope.user.last_name,
                email: $scope.user.email
            };

            userModel.submitAccount(data).success(function(response){

                $scope.errors = {};

                AdminUserService.storeUser(response);
                Metronic.alert({
                    type: 'success',
                    icon: 'success',
                    message: 'Profile updated successfully',
                    container: '#tab_1_1',
                    place: 'prepend',
                    closeInSeconds: 3
                });
            }).error(function(data, status, headers) {                            
                $scope.errors = data;                
            });
        },

        changePassword: function(accountForm) {
                        
            var data = {
                current_password: $scope.user.current_password,
                new_password: $scope.user.new_password,
                retype_password: $scope.user.retype_password
            };

            userModel.changePassword(data).success(function(response){
                $scope.errors = {};
                Metronic.alert({
                    type: 'success',
                    icon: 'success',
                    message: 'Password updated successfully',
                    container: '#tab_1_3',
                    place: 'prepend',
                    closeInSeconds: 3
                });
                $scope.user.current_password = '';
                $scope.user.new_password = '';
                $scope.user.retype_password = '';
            }).error(function(data, status, headers) {                            
                $scope.errors = data;                
            });
        },

    });
        
    

}]); 
