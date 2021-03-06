'use strict';

angular.module('alcoholCart.directives',[])

	.controller('CartTopController',['$scope', 'alcoholCart', 'appSettings', '$timeout', function($scope, alcoholCart, appSettings, $timeout) {

		$scope.alcoholCart = alcoholCart;

		$scope.scrollconfig = {
				autoHideScrollbar: false,
				theme: 'light',
				setHeight: 200,
				scrollInertia: 0,
				advanced:{
				        updateOnContentResize: true
				    }
			};

		$scope.$watch(function(){return appSettings.layout.cartSummaryEnable},function(n,o){
			$scope.cartSummaryEnable = appSettings.layout.cartSummaryEnable;
		});

		// angular.scrollconfig = $scope.scrollconfig;


		// $scope.updateScrollbar('scrollTo', 10);

	}])

	.directive('alcoholcartAddtocart', ['alcoholCart', function(alcoholCart){
		return {
			restrict : 'E',
			controller : 'CartController',
			scope: {
				id:'@',
				name:'@',
				quantity:'@',
				quantityMax:'@',
				price:'@',
				data:'='
			},
			transclude: true,
			templateUrl: function(element, attrs) {
				if ( typeof attrs.templateUrl == 'undefined' ) {
					return 'template/alcoholCart/addtocart.html';
				} else {
					return attrs.templateUrl;
				}
			},
			link:function(scope, element, attrs){
				scope.attrs = attrs;
				scope.inCart = function(){
					return  alcoholCart.getItemById(attrs.id);
				};

				if (scope.inCart()){
					scope.q = alcoholCart.getItemById(attrs.id).getQuantity();
				} else {
					scope.q = parseInt(scope.quantity);
				}

				scope.qtyOpt =  [];
				for (var i = 1; i <= scope.quantityMax; i++) {
					scope.qtyOpt.push(i);
				}

			}

		};
	}])

	.directive('alcoholcartCart', [function(){
		return {
			restrict : 'E',
			controller : 'CartController',
			scope: {},
			templateUrl: function(element, attrs) {
				if ( typeof attrs.templateUrl == 'undefined' ) {
					return 'template/alcoholCart/cart.html';
				} else {
					return attrs.templateUrl;
				}
			},
			link:function(scope, element, attrs){

			}
		};
	}])

	.directive('alcoholcartSummary', [function(){
		return {
			restrict : 'E',
			controller : 'CartTopController',
			replace: true,
			scope: {},
			transclude: true,
			templateUrl: function(element, attrs) {
				if ( typeof attrs.templateUrl == 'undefined' ) {
					return 'templates/partials/headerCartSummary.html';
				} else {
					return attrs.templateUrl;
				}
			}
		};
	}])
	
	.directive('paymentForm', ['$rootScope','$timeout',function($rootScope,$timeout){
		return {
			restrict: 'E',
            replace: true,
            template:
                '<form action="{{ formData.url }}" method="{{ formData.method }}">' +
                '   <div ng-repeat="(key,val) in formData.params">' +
                '       <input type="hidden" name="{{ key }}" value="{{ val }}" />' +
                '   </div>' +
                '</form>',
            link: function($scope, $element, $attrs) {
                $scope.$on('gateway.redirect', function(event, data) {
                    $scope.formData = data;
                    $timeout(function() {
                        $rootScope.$broadcast('redirecting','Wait while we redirect you to the payment gateway..');
                        $element.submit();
                    });
                })
            }
		};
	}]);
	