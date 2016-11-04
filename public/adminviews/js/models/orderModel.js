MetronicApp.factory('orderModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getOrder: function(orderId){
            return $http.get("/adminapi/order/detail/"+orderId);
        },

        updateOrder: function(fields,orderId){
	       	
	       	//put is used to updated data, Laravel router automatically redirect to update function 

	        return $http.put("/adminapi/order/"+orderId, fields, {
	            
	        }).error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please enter all required fields.',
	                container: '.portlet-body',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	        })
	        .success(function(response) {	            
	            
	            Metronic.alert({
	                type: 'success',
	                icon: 'check',
	                message: response.message,
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	            $location.path("orders/list");

	        })
	        /*.error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: data,
	                container: '.portlet-body',
	                place: 'prepend'
	            });
	        });*/

        },

        setStatus: function(orderId,state){

	        return $http.put("/adminapi/order/status/"+orderId+"/"+state, {} , {

			}).error(function(data, status, headers) {

	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'There is some issue in updation',
	                container: '.portlet-body',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	        })
	        .success(function(response) {	            
	            
	            Metronic.alert({
	                type: 'success',
	                icon: 'check',
	                message: response.message,
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	            $location.path("orders/list");

	        })
	        /*.error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: data,
	                container: '.portlet-body',
	                place: 'prepend'
	            });
	        });*/

        }

    };
}])