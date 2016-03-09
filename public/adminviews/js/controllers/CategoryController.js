'use strict';

MetronicApp.controller('CategoryController',['$rootScope', '$scope', '$timeout','$http','fileUpload', function($rootScope, $scope, $timeout,$http,fileUpload) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_categories')); // set profile link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  

    $scope.category = {

	};

	angular.extend($scope, {

		submitCategory : function() {
			
			var data = {
                title: $scope.category.title,
                ptitle: $scope.category.ptitle,                
            };

			var files = {
				"thumb":$scope.category.thumb,
				"lthumb":$scope.category.lthumb
			};

			var uploadUrl = "admin/category/store";
			fileUpload.uploadFileToUrl(files, data, uploadUrl);

		}
	})

   
}]); 
