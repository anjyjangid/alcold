MetronicApp.factory('userModel', ['$http', '$cookies', '$rootScope', function($http, $cookies, $rootScope) {
    var userModel = {};

    /**
     * Check if the credentials are correct from server
     * and return the promise back to the controller
     * 
     * @param  {array} loginData
     * @return {promise}
     */

    userModel.submitAccount = function(postedData) {

        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: 'adminapi/admin/updateprofile',
            method: "POST",
            data: {
                first_name: postedData.first_name,
                last_name: postedData.last_name,
                email: postedData.email,
            }
        });
    };
    
    /**
     * Return whether the user is logged in or not
     * based on the cookie set during the login
     * 
     * @return {boolean}
     */
    userModel.getAuthStatus = function() {
        var status = $cookies.get('auth');
        if (status) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Get the user object converted from string to JSON
     * @return {user object}
     */
    userModel.getUserObject = function() {
        var userObj = angular.fromJson($cookies.get('auth'));
        return userObj;
    }

    /**
     * Close the session of the current user
     * and delete the cookie set for him
     *
     * @return boolean
     */
    userModel.doUserLogout = function() {
        $cookies.remove('auth');
    };  

    userModel.getUserDetails = function() {
        return $http.get('adminapi/admin');
    };  

    userModel.changePassword = function(postedData) {

        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: 'adminapi/admin/updatepassword',
            method: "POST",
            data: {
                current_password: postedData.current_password,
                new_password: postedData.new_password,
                retype_password: postedData.retype_password,
            }
        });
    };

    return userModel;
}])
