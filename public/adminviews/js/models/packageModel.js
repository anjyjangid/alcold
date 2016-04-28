MetronicApp.factory('packageModel', ['$http', '$cookies', '$rootScope', function($http, $cookies, $rootScope) {
    
    return {
    	storePackage: function(fields,url){
	       	var fd = objectToFormData(fields);	       	  
	        return $http.post("/admin/"+url, fd, {
	            transformRequest: angular.identity,	            	            
	            headers: {'Content-Type': undefined}
	        });
	    },   
	    searchItem: function(qry){	       	
	        return $http.post("/admin/product/searchproduct",{length:10,qry:qry});
	    }
    };

}]);
