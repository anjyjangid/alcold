MetronicApp.factory('productModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        getCategories: function(){
            return $http.get("/admin/category/getparentcategories/all");
        },

        saveProduct: function(data){
            return $http.post("/admin/product/store", {data:data});
        },

        storeProduct: function(fields,url){

	       	var fd = objectToFormData(fields);	       	  

	        return $http.post("/admin/"+url, fd, {
	            transformRequest: angular.identity,	            	            
	            headers: {'Content-Type': undefined}
	        }).error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please validate all fields.',
	                container: '.portlet-body',
	                place: 'prepend',
	                //closeInSeconds: 5
	            });
	        });
        },

        getProduct: function(productid){
            return $http.get("/admin/product/edit/"+productid);
        },

    };
}])