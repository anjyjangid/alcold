AlcoholDelivery.directive('sideBar', function() {
	return {
		restrict: 'E',
		templateUrl: '/templates/partials/sidebar.html',
		controller: function($scope){
								
				$scope.childOf = function(categories, parent){
					
						if(!categories) return [];

						if(!parent || parent==0){
								return categories.filter(function(category){
										return (!category.ancestors || category.ancestors.length==0);
								});
						}

						return categories.filter(function(category){
								return (category.ancestors && category.ancestors.length > 0 && category.ancestors[0]._id["$id"] == parent);
						});
				}
				
		}
	};
});

 AlcoholDelivery.directive('topMenu', function(){

	return {
		restrict: 'E',
		/*scope:{
			user:'='
		},*/
		templateUrl: '/templates/partials/topmenu.html',
		controller: function($scope,$rootScope,$http,$state,sweetAlert){			
			
			$scope.list = [];

			$scope.signup = {
				terms:null
			};

			$scope.login = {};
			$scope.forgot = {};
			$scope.reset = {};
			$scope.errors = {};
			$scope.signup.errors = {};
			$scope.forgot.errors = {};
			$scope.reset.errors = {};

			$scope.signupSubmit = function() {
				$http.post('/auth/register',$scope.signup).success(function(response){
	                $scope.user = response;
					$scope.user.name = response.email;	                

	                sweetAlert.swal({
						type:'success',
						title: "Congratulation!",
						text : "Account Created successfully. Please check your mail to verify your account",
						timer: 10000
					});

					$('#register').modal('hide');

	            }).error(function(data, status, headers) {                            
	                $scope.signup.errors = data;                
	            });
			};

			$scope.loginSubmit = function(){
				$http.post('/auth',$scope.login).success(function(response){
	                $scope.login = {};
	                $scope.user = response;
					$scope.user.name = response.email;
	                $('#login').modal('hide');
	                $scope.errors = {};
	            }).error(function(data, status, headers) {                            
	                $scope.errors = data;
	            });
			};

			$http.get('/check').success(function(response){
	            $scope.user = response;            
	        }).error(function(data, status, headers) {                            
	          	
	        });

	        $scope.forgotSubmit = function() {
				$http.post('/password/email',$scope.forgot).success(function(response){					
	                $scope.forgot = {};	                
	                $scope.forgot.message = response.message;
	                $('#forgot_password').modal('hide');
	                $('#forgot_password_sent').modal('show');	                
	            }).error(function(data, status, headers) {                            
	                $scope.forgot.errors = data;                
	            });
			};

			$scope.resetSubmit = function() {

				$scope.reset.token = $rootScope.token;
				
				$http.post('/password/reset',$scope.reset).success(function(response){					
	                $scope.reset = {};
	                $scope.reset.errors = {};

	                $('#reset').modal('hide');
	                
		                sweetAlert.swal({
							type:'success',
							title: "Congratulation!",
							text : response.message,
							timer: 4000,
							closeOnConfirm: false
						});

		                setTimeout(function(){
							$state.go('mainLayout.login');
						},4000)

						

	            }).error(function(data, status, headers) {

	            	if(typeof data.token !== "undefined" && data.token===false){

	            		$('#reset').modal('hide');
	            		$state.go('mainLayout.index');

	            		sweetAlert.swal({
							type:'warning',
							title: "Not a valid token",							
							timer: 4000,
							showConfirmButton:false,
							closeOnConfirm: false
						})
	            	}

	                $scope.reset.errors = data;                
	            });
			};



	        $scope.logout = function() {
				$http.get('/auth/logout').success(function(response){
	                $scope.user = {};      									
	            }).error(function(data, status, headers) {                            						                
	            });
			};

			$scope.searchbar = function(toggle){
				if(toggle){
					$(".searchtop").addClass("searchtop100").removeClass("again21");			
					$(".search_close").addClass("search_close_opaque");		
					$(".logoss").addClass("leftminusopacity leftminus100").removeClass("again0left againopacity");
					$(".homecallus_cover").addClass("leftminus2100").removeClass("again0left");
					$(".signuplogin_cover").addClass("rightminus100").removeClass("again0right");	
					$("input[name='search']").focus();
				}else{
					$(".searchtop").removeClass("searchtop100").addClass("again21");			
					$(".search_close").removeClass("search_close_opaque");		
					$(".logoss").removeClass("leftminusopacity leftminus100").addClass("again0left againopacity");
					$(".homecallus_cover").removeClass("leftminus2100").addClass("again0left");
					$(".signuplogin_cover").removeClass("rightminus100").addClass("again0right");
				}
			}
		}
	};
})

.directive("owlCarousel", function(){

    return {
        restrict: 'E',
        transclude: false,
        
        link: function (scope) {

            scope.initCarousel = function(element,ngModel) {
              // provide any default options you want

                var defaultOptions = {
                };
                var customOptions = scope.$eval($(element).attr('data-options'));
                // combine the two options objects
                for(var key in customOptions) {
                    defaultOptions[key] = customOptions[key];
                }

            	// init carousel
            	if(typeof $(element).data('owlCarousel') === "undefined"){
            		
                	scope[ngModel] = $(element).owlCarousel(defaultOptions);

            	}
            };
        }
    };
})

.directive('owlCarouselItem', [function() {
    return {
        restrict: 'A',
        transclude: false,
        link: function(scope, element) {
        					          
          	if(scope.$first && typeof $(element.parent()).data('owlCarousel') !== "undefined"){

          		$(element.parent()).data('owlCarousel').destroy();
          		$(element.parent()).find(".owl-wrapper").remove();

          	}

            if(scope.$last) {

                scope.initCarousel(element.parent(),element.parent().attr("ng-model"));

            }
        }
    };
}])

.directive("tscroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
             
             if(element.hasClass('fixh')) return;

             if (this.pageYOffset >= 1) {
                 element.addClass('navbar-shrink');                 
             } else {
                 element.removeClass('navbar-shrink');                 
             }
        });
    };
});

AlcoholDelivery.directive('errProSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {

        element.parent(".prod_pic").addClass("no-image");

          attrs.$set('src', attrs.errSrc);
        
      });
    }
  }
});

AlcoholDelivery.directive('ngTouchSpin', ['$timeout', '$interval', function($timeout, $interval) {
	'use strict';

	var setScopeValues = function (scope, attrs) {
		scope.min = attrs.min || 0;
		scope.max = attrs.max || 100;
		scope.step = attrs.step || 1;
		scope.prefix = attrs.prefix || undefined;
		scope.postfix = attrs.postfix || undefined;
		scope.decimals = attrs.decimals || 0;
		scope.stepInterval = attrs.stepInterval || 100;
		scope.stepIntervalDelay = attrs.stepIntervalDelay || 500;
		scope.initval = attrs.initval || '';
		scope.val = attrs.value || scope.initval;
	};

	return {
		restrict: 'EA',
		require: '?ngModel',
		scope: true,
		replace: true,
		link: function (scope, element, attrs, ngModel) {
			setScopeValues(scope, attrs);

			var timeout, timer, helper = true, oldval = scope.val, clickStart;

			ngModel.$setViewValue(scope.val);

			scope.decrement = function () {
				oldval = scope.val;
				var value = parseFloat(parseFloat(Number(scope.val)) - parseFloat(scope.step)).toFixed(scope.decimals);

				if (parseFloat(value) < parseFloat(scope.min)) {
					value = parseFloat(scope.min).toFixed(scope.decimals);
					scope.val = value;
					ngModel.$setViewValue(value);
					return;
				}

				scope.val = value;
				ngModel.$setViewValue(value);
			};

			scope.increment = function () {
				oldval = scope.val;
				var value = parseFloat(parseFloat(Number(scope.val)) + parseFloat(scope.step)).toFixed(scope.decimals);
				
				if (parseFloat(value) > parseFloat(scope.max)) return;
				
				scope.val = value;

				ngModel.$setViewValue(value);
			};

			scope.startSpinUp = function () {

				scope.checkValue();
				scope.increment();

				clickStart = Date.now();
				scope.stopSpin();

				$timeout(function() {
					timer = $interval(function() {
						scope.increment();
					}, scope.stepInterval);
				}, scope.stepIntervalDelay);
			};

			scope.startSpinDown = function () {
				scope.checkValue();
				scope.decrement();

				clickStart = Date.now();

				var timeout = $timeout(function() {
					timer = $interval(function() {
						scope.decrement();
					}, scope.stepInterval);
				}, scope.stepIntervalDelay);
			};

			scope.stopSpin = function () {
				if (Date.now() - clickStart > scope.stepIntervalDelay) {
					$timeout.cancel(timeout);
					$interval.cancel(timer);
				} else {
					$timeout(function() {
						$timeout.cancel(timeout);
						$interval.cancel(timer);
					}, scope.stepIntervalDelay);
				}
			};

			scope.checkValue = function () {
				var val;

				if (scope.val !== '' && !scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
					val = oldval !== '' ? parseFloat(oldval).toFixed(scope.decimals) : parseFloat(scope.min).toFixed(scope.decimals);
					scope.val = val;
					ngModel.$setViewValue(val);
				}
			};

		},
		template: 
		'<div class="input-group bootstrap-touchspin">'+

		'	<span class="input-group-addon bootstrap-touchspin-prefix" ng-show="prefix" ng-bind="prefix"></span>'+

		'	<input type="text" ng-model="val" class="form-control" ng-blur="checkValue()">'+

		'	<span class="input-group-addon bootstrap-touchspin-postfix" ng-show="postfix" ng-bind="postfix"></span>'+
			
		'	<span class="input-group-btn-vertical">'+

		'		<button class="btn btn-default bootstrap-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-plus"></i></button>'+

		'		<button class="btn btn-default bootstrap-touchspin-down"  ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-minus"></i></button>'+

		'	</span>'+

		'</div>'

		// '<div class="input-group bootstrap-touchspin">' +
		// '  <span class="input-group-btn" ng-show="!verticalButtons">' +
		// '    <button class="btn btn-default" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()"><i class="fa fa-minus"></i></button>' +
		// '  </span>' +
		// '  <span class="input-group-addon" ng-show="prefix" ng-bind="prefix"></span>' +
		// '  <input type="text" ng-model="val" class="form-control" ng-blur="checkValue()">' +
		// '  <span class="input-group-addon" ng-show="postfix" ng-bind="postfix"></span>' +
		// '  <span class="input-group-btn" ng-show="!verticalButtons">' +
		// '    <button class="btn btn-default" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()"><i class="fa fa-plus"></i></button>' +
		// '  </span>' +
		// '</div>'



	};

}]);


AlcoholDelivery.directive('alTplProduct',[function($rootScope){
	return {
		restrict: 'A',
		transclude: true,
		scope:{
			productInfo:'=info',
			classes : '@'
		},
		templateUrl: '/templates/product/product_tpl.html',

		controller: ['$rootScope','$scope',function($rootScope,$scope){

			$scope.settings = $rootScope.settings;

			$scope.setPrices = function(localpro){

				if(typeof localpro.categories === "undefined"){return true;}
				
				var catIdIndex = localpro.categories.length - 1;
				var catPriceObj = $rootScope.catPricing[localpro.categories[catIdIndex]];	

				if(typeof catPriceObj === "undefined"){
					console.log("Something wrong with this product : "+localpro._id);
					return false;
				}

				localpro = $.extend(catPriceObj, localpro);

				var advanceOrder = localpro.advance_order;

				if(advanceOrder.type==1){
					localpro.discountedPrice = localpro.price - (localpro.price * advanceOrder.value/100);
				}else{
					localpro.discountedPrice = localpro.price - advanceOrder.value;
				}

				for(i=0;i<localpro.advance_order_bulk.bulk.length;i++){

					var bulk = localpro.advance_order_bulk.bulk[i];

					if(bulk.type==1){
						bulk.price = localpro.price - (localpro.price * bulk.value/100);
					}else{
						bulk.price = localpro.price - bulk.value;
					}
					bulk.price = bulk.price.toFixed(2);
				}

				for(i=0;i<localpro.express_delivery_bulk.bulk.length;i++){

					var bulk = localpro.express_delivery_bulk.bulk[i];

					if(bulk.type==1){
						bulk.price = localpro.price - (localpro.price * bulk.value/100);
					}else{
						bulk.price = localpro.price - bulk.value;
					}
					bulk.price = bulk.price.toFixed(2);
				}


				localpro.discountedPrice = localpro.discountedPrice.toFixed(2);

				return localpro;

			}
		
			$scope.productPricing = $scope.setPrices($scope.productInfo);


		}]
	}



}])