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

			$scope.hideMenu = function(){					
				$('.dropdown-menu').removeClass('animate');
			}
		}
	};
})

.directive('topMenu', function(){

	return {
		restrict: 'E',
		/*scope:{
			user:'='
		},*/
		templateUrl: '/templates/partials/topmenu.html',
		controller: function($scope,$rootScope,$http,$state,sweetAlert,UserService,store,alcoholWishlist,ClaimGiftCard,$fblogin){

			$scope.list = [];

			$scope.menu = {openSearch:true};

			$scope.signup = {
				terms:null
			};

			$scope.login = {};
			$scope.forgot = {};
			$scope.reset = {};

			$scope.resetSignup = function(){

				$scope.signup = {
					terms:null
				};

			}

			$scope.signupSubmit = function() {
				$scope.signup.errors = {};
				$http.post('/auth/register',$scope.signup).success(function(response){
	                $scope.user = response;
					$scope.user.name = response.email;
	                sweetAlert.swal({
						type:'success',
						title: "Congratulation!",
						text : "Account Created successfully. Please check your mail to verify your account",
						timer: 10000
					});
	                $scope.signup = {
						terms:null
					};
					$('#register').modal('hide');

	            }).error(function(data, status, headers) {
	                $scope.signup.errors = data;
	            });
			};

			$scope.loginSubmit = function(){
				$scope.errors = {};
				$http.post('/auth',$scope.login).success(function(response){				  

					$scope.loginSuccess(response);

				}).error(function(data, status, headers) {
					$scope.errors = data;
	            });
			};

			$http.get('/check').success(function(response){
	            $scope.user = response;
	        }).error(function(data, status, headers) {

	        });

	        $scope.forgotSubmit = function() {
				$scope.forgot.errors = {};
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
				$scope.reset.errors = {};
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
	                // Destroy Cart Params start
	                delete $rootScope.deliverykey;
	                localStorage.removeItem("deliverykey");	                
	                store.init().then(
	                	function(successRes){
	                		$state.go("mainLayout.index", {}, {reload: true});
	                	},
	                	function(errorRes){}
	                );
	                alcoholWishlist.init();
	            }).error(function(data, status, headers) {
	                $scope.user = {};	                
	            });

			};

			$scope.openMenu = function(){
				angular.element('#wrapper').toggleClass('toggled');
			}			
			//FACEBOOK LOGIN
			$scope.loginToggle = function() {      
		    	$fblogin({
		            fbId: '273669936304095',
		            permissions: 'email,user_birthday',
		            fields: 'first_name,last_name,locale,email,birthday'
		        })
		        .then(
		            function(response){
		            	$('#login').modal('hide');
		            	$http.post('/auth/registerfb',response)
		            	.success(function(res){
		            		$scope.loginSuccess(res);
		            	});
		            }
		        );
		    };

		    //INTIALIZE AFTER USER LOGIN(FB & NORMAL)
		    $scope.loginSuccess = function(response){

		    	UserService.currentUser = response;

		    	$scope.login = {};
                $scope.user = response;
				$scope.user.name = response.email;
                $('#login').modal('hide');
                $scope.errors = {};                
                store.init().then(
                	function(successRes){
                		$state.go($state.current, {}, {reload: true});
                	},
                	function(errorRes){}
                );
                alcoholWishlist.init();
                ClaimGiftCard.claim();
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
          		
				$(element.parent()).find(".owl-wrapper-outer").remove();//$(element.parent()).find(".owl-wrapper").remove();
          		$(element.parent()).data('owlCarousel').destroy();

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
})

.directive('errProSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {

        element.parent(".prod_pic").addClass("no-image");

          attrs.$set('src', attrs.errSrc);

      });
    }
  }
})

// .directive('myError', function() {
//   return {
//   	require: 'ngModel',
//     link: function(scope, element, attrs, ctrl) {
       
//       element.on('blur', function() {
      	
//       	if(element.context.value==""){
//       		ctrl.$setValidity("blank", false);
//       	}else{
//       		ctrl.$setValidity("blank", true);
//       	}

//       	scope.$apply();

//       });
//     }
//   }
// })

.directive('onlyDigits', function () {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, element, attr, ctrl) {
        function inputValue(val) {
          if (val) {
            var digits = val.replace(/[^0-9]/g, '');

            if (digits !== val) {
              ctrl.$setViewValue(digits);
              ctrl.$render();
            }
            return parseInt(digits,10);
          }
          return undefined;
        }
        ctrl.$parsers.push(inputValue);
      }
    };
})

.directive('ngTouchSpin', ['$timeout', '$interval', function($timeout, $interval) {
	'use strict';

	var setScopeValues = function (scope, attrs) {
		scope.min = attrs.min || 0;
		// scope.max = attrs.max || 100;
		scope.step = attrs.step || 1;
		scope.prefix = attrs.prefix || undefined;
		scope.postfix = attrs.postfix || undefined;
		scope.decimals = attrs.decimals || 0;
		scope.stepInterval = attrs.stepInterval || 500;
		scope.stepIntervalDelay = attrs.stepIntervalDelay || 500;
		scope.initval = attrs.initval || '';
		//scope.val = attrs.value || scope.initval;
		scope.verticalButtons = attrs.vertical || false;
	};

	return {
		restrict: 'EA',
		require: '?ngModel',
		scope: {
			'myincrement': '&onIncrement',
			'mydecrement': '&onDecrement',
			'val': "=value",
			'max': "=mquantity"
		},
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
				scope.mydecrement();
			};

			scope.increment = function () {
				oldval = scope.val;
				var value = parseFloat(parseFloat(Number(scope.val)) + parseFloat(scope.step)).toFixed(scope.decimals);

				if (parseFloat(value) > parseFloat(scope.max)) return;

				scope.val = value;

				ngModel.$setViewValue(value);
				scope.myincrement();
			};

			scope.startSpinUp = function () {

				scope.checkValue();
				scope.increment();

				clickStart = Date.now();
				scope.stopSpin();

				// $timeout(function() {
				// 	timer = $interval(function() {
				// 		scope.increment();
				// 	}, scope.stepInterval);
				// }, scope.stepIntervalDelay);

			};

			scope.startSpinDown = function () {
				scope.checkValue();
				scope.decrement();

				clickStart = Date.now();

				// var timeout = $timeout(function() {
				// 	timer = $interval(function() {
				// 		scope.decrement();
				// 	}, scope.stepInterval);
				// }, scope.stepIntervalDelay);
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
				scope.val = String(scope.val);
				if (scope.val !== '' && !scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
					val = oldval !== '' ? parseFloat(oldval).toFixed(scope.decimals) : parseFloat(scope.min).toFixed(scope.decimals);
					scope.val = val;
					ngModel.$setViewValue(val);
				}
			};

		},
		template:
		// '<div class="input-group bootstrap-touchspin">'+

		// '	<span class="input-group-addon bootstrap-touchspin-prefix" ng-show="prefix" ng-bind="prefix"></span>'+

		// '	<input type="text" ng-model="val" class="form-control" ng-blur="checkValue()">'+

		// '	<span class="input-group-addon bootstrap-touchspin-postfix" ng-show="postfix" ng-bind="postfix"></span>'+

		// '	<span class="input-group-btn-vertical">'+

		// '		<button class="btn btn-default bootstrap-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-plus"></i></button>'+

		// '		<button class="btn btn-default bootstrap-touchspin-down"  ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-minus"></i></button>'+

		// '	</span>'+

		// '</div>'

		'<div class="input-group bootstrap-touchspin" ng-class={vertical:!verticalButtons}>' +
		'  <span class="input-group-btn" ng-show="verticalButtons">' +
		'    <button class="btn btn-default bootstrap-touchspin-down" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()">-</button>' +
		'  </span>' +
		'  <span class="input-group-addon bootstrap-touchspin-prefix" ng-show="prefix" ng-bind="prefix"></span>' +
		'  <span class="addmore-count" ng-bind="val"></span>'+
		// '  <input type="text" ng-model="val" class="form-control addmore-count" ng-blur="checkValue()" disabled>' +
		'  <span class="input-group-addon" ng-show="postfix" ng-bind="postfix"></span>' +
		'  <span class="input-group-btn" ng-if="verticalButtons">' +
		'    <button class="btn btn-default bootstrap-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()">+</button>' +
		'  </span>' +

		'  <span class="input-group-btn-vertical" ng-if="!verticalButtons">'+
		'		<button class="btn btn-default bootstrap-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-plus"></i></button>'+
		'		<button class="btn btn-default bootstrap-touchspin-down"  ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-minus"></i></button>'+
		'	</span>'+
		'</div>'
		// <div class="input-group bootstrap-touchspin">
		// 	<span class="input-group-btn">
		// 		<button class="btn btn-default bootstrap-touchspin-down" type="button">-</button>
		// 	</span>
		// 	<span class="input-group-addon bootstrap-touchspin-prefix" style="display: none;"></span>
		// 	<input id="addmore_count" type="text" value="" name="addmore_count" class="form-control" style="display: block; top: 0px;">
		// 	<span class="input-group-addon bootstrap-touchspin-postfix" style="display: none;"></span>
		// 	<span class="input-group-btn">
		// 		<button class="btn btn-default bootstrap-touchspin-up" type="button">+</button>
		// 	</span>
		// </div>



	};

}])

.directive('alTplProduct',[function($rootScope){
	return {
		restrict: 'A',
		transclude: true,
		priority: 100,
		replace: true,
		scope:{
			productInfo:'=info',
			classes : '@',
			promotion : '=',
			loyalty : '='
		},
		templateUrl: '/templates/product/product_tpl.html',

		controller: ['$rootScope','$scope','$state','sweetAlert','alcoholCart','alcoholWishlist','promotionsService',"$mdToast",function($rootScope,$scope,$state,sweetAlert,alcoholCart,alcoholWishlist,promotionsService,$mdToast){
			
			$scope.settings = $rootScope.settings;

			$scope.alcoholCart = alcoholCart;

			$scope._sPromotion = promotionsService;			

			var isInCart = alcoholCart.getProductById($scope.productInfo._id);

			$scope.isInwishList = alcoholWishlist.getProductById($scope.productInfo._id);

			$scope.productInfo.servechilled=$scope.productInfo.chilled;

			if(isInCart!==false){

				$scope.productInfo.servechilled = isInCart.getLastServedAs();

			}

			$scope.addToWishlist = function(){

				alcoholWishlist.add($scope.productInfo._id).then(function(response) {

						if(response.success){

							$scope.isInwishList = alcoholWishlist.getProductById($scope.productInfo._id);

						}

					}, function(error) {

						var toast = $mdToast.simple()
							.textContent(error.message)
							.action('OK')
							.highlightAction(false)
							.position("top right fixed");

						$mdToast.show(toast).then(function(response) {
							// if ( response == 'ok' ) {
							// 	$('#login').modal('show');
							// }
						});


					});
			}

			$scope.setPrices = function(localpro){

				if(typeof localpro.categories === "undefined"){return true;}			

				var catIdIndex = localpro.categories.length - 1;			

				var catPriceObj = angular.copy($rootScope.catPricing[localpro.categories[catIdIndex]]);
								
				if(typeof catPriceObj === "undefined"){

					console.log("Something wrong with this product : "+localpro._id);
					localpro.quantity = 0;
					return localpro;
				}

				delete catPriceObj._id;
				
				var dst = {};
				angular.extend(dst,catPriceObj,localpro);
				angular.extend(localpro,dst);

				localpro.price = parseFloat(localpro.price);

				var costPrice = localpro.price;

				var orderValue = localpro.regular_express_delivery;

				if(orderValue.type==1){
					localpro.price +=  parseFloat(localpro.price * orderValue.value/100);
				}else{
					localpro.price += parseFloat(orderValue.value);
				}

				for(i=0;i<localpro.express_delivery_bulk.bulk.length;i++){

					var bulk = localpro.express_delivery_bulk.bulk[i];

					if(bulk.type==1){
						bulk.price = localpro.price + (localpro.price * bulk.value/100);
					}else{
						bulk.price = localpro.price + bulk.value;
					}
					bulk.price = bulk.price.toFixed(2);
				}

				if(typeof $scope.loyalty!=="undefined"){

					localpro.href = "mainLayout.productLoyalty({product:"+localpro.slug+"})";
					// $scope.productInfo.isLoyaltyStoreProduct = true;

					// if($scope.productInfo.loyaltyValueType===0){
					// 	localpro.price = parseFloat($scope.productInfo.loyaltyValuePoint)
					// }else{
					// 	localpro.price = parseFloat($scope.productInfo.loyaltyValuePoint + $scope.productInfo.loyaltyValuePrice);
					// }
					// localpro.price = parseFloat(localpro.price) * (1/$rootScope.settings.loyalty.point_value);
												
				}

				localpro.href = function(){
					if(typeof $scope.loyalty!=="undefined"){
						$state.go("mainLayout.productLoyalty",{product:localpro.slug});
					}else{
						$state.go("mainLayout.product",{product:localpro.slug});
					}
				}

				localpro.price = localpro.price.toFixed(2);							

				return localpro;

			}

			$scope.setPrices($scope.productInfo);			

		}]
	}
}])


.directive('addToCartBtn',[function(){
	return {
		restrict : "E",
		replace: true,
		priority: 99,
		templateUrl: function(elem, attr){
			return '/templates/partials/addToCartBtn.html';
		},
		scope: {
			product:'=',			
		},

		controller: function($scope,$rootScope,$element,$timeout,$http,alcoholCart,$mdToast){

			$scope.isInCart = false;
			$scope.addMoreCustom = false;
			$scope.element = $element;

			$scope.product.qChilled = 0;
			$scope.product.qNChilled = 0;

			$scope.product.isLoyaltyStoreProduct = false;
			if($scope.product.isLoyaltyStoreProduct){
				var isInCart = alcoholCart.getLoyaltyProductById($scope.product._id);
			}else{
				var isInCart = alcoholCart.getProductById($scope.product._id);
			}

			if(isInCart!==false){

				$scope.isInCart = true;
				$scope.product.qChilled = isInCart.getRQuantity('chilled');
				$scope.product.qNChilled = isInCart.getRQuantity('nonchilled');

			}

			if($scope.product.quantity==0 && $scope.product.outOfStockType==2){

				$scope.maxQuantity = $scope.product.maxQuantity; //if product is out of stock then its max quantity is available for future order.

			}else{

				$scope.maxQuantity = $scope.product.quantity;

			}

			var available = $scope.maxQuantity-$scope.product.qNChilled+$scope.product.qChilled;

			if(available<0){

				$scope.overQunatity = true;
				$scope.product.qNChilled = $scope.product.qNChilled + available;

			}

			var available = $scope.maxQuantity-$scope.product.qNChilled+$scope.product.qChilled;

			if(available<0){

				$scope.product.qChilled = $scope.product.qChilled + available;

			}

			$scope.$watchGroup(['product.qNChilled','product.qChilled','maxQuantity'],
						function(newValue, oldValue) {

							$scope.updateQuantity();

						},true
					);

			$scope.updateQuantity = function(){

				$scope.product.chilledMaxQuantity = $scope.maxQuantity - $scope.product.qNChilled;
				$scope.product.nonChilledMaxQuantity = $scope.maxQuantity - $scope.product.qChilled;
				$scope.tquantity = parseInt($scope.product.qNChilled)+parseInt($scope.product.qChilled);

			}

			$scope.addtocart = function(){

				if(typeof $scope.proUpdateTimeOut!=="undefined"){
					$timeout.cancel($scope.proUpdateTimeOut);
				}

				$scope.proUpdateTimeOut = $timeout(function(){

					var quantity = $scope.product.servechilled?$scope.product.qChilled:$scope.product.qNChilled;

					if($scope.product.isLoyaltyStoreProduct){

						var addFunc = "addLoyaltyProduct";

					}else{

						var addFunc = "addItem";

					}

					alcoholCart[addFunc]($scope.product._id,quantity,$scope.product.servechilled).then(

						function(successRes){

							if(successRes.success){							

								switch(successRes.code){
									case 100:

										$scope.product.qNChilled = successRes.product.nonchilled.quantity;
										$scope.product.qChilled = successRes.product.chilled.quantity;
										$scope.maxQuantity = successRes.product.maxQuantity;
										$scope.product.quantity = successRes.product.product.quantity;

										$scope.product.chilledMaxQuantity = $scope.maxQuantity - $scope.product.qNChilled;
										$scope.product.nonChilledMaxQuantity = $scope.maxQuantity - $scope.product.qChilled;
										$scope.tquantity = parseInt($scope.product.qNChilled)+parseInt($scope.product.qChilled);

										$timeout(function(){
										$mdToast.show({
											controller:function($scope){

												$scope.qChilled = 0;
												$scope.qNchilled = 0;

												$scope.closeToast = function(){
													$mdToast.hide();
												}
											},
											templateUrl: '/templates/toast-tpl/notify-quantity-na.html',
											parent : $element,											
											position: 'top center',
											hideDelay:10000
										});
										},1000);

									break;
									case 101:
										
										$scope.product.outOfStockType = successRes.product.product.outOfStockType;
										$scope.product.quantity = successRes.product.product.quantity;

										$timeout(function(){
										$mdToast.show({
											controller:function($scope){

												$scope.qChilled = 0;
												$scope.qNchilled = 0;

												$scope.closeToast = function(){
													$mdToast.hide();
												}
											},											
											templateUrl: '/templates/toast-tpl/notify-quantity-na.html',
											parent : $element,											
											position: 'top center',
											hideDelay:10000
										});
										},1000);

									break;

								}
								
							}

						},
						function(errorRes){

						}

					);
					
					if($scope.product.quantitycustom==0){
						$scope.isInCart = false;
						$scope.addMoreCustom = false;
						$scope.product.quantitycustom = 1;
					}

				},1500)


			};

			$scope.addCustom = function(){

				var currQ = $scope.product.servechilled
				
				if($scope.product.qNChilled)

				$scope.activeAddToCart();

			};

			$scope.activeAddToCart = function() {

				if($scope.maxQuantity < $scope.tquantity){

					var ele = $scope.element;
					var qChilled = $scope.product.qChilled;
					var qNchilled = $scope.product.qNChilled;

					$mdToast.show({
						controller:function($scope){

							$scope.qChilled = qChilled;
							$scope.qNchilled = qNchilled;

							$scope.closeToast = function(){
								$mdToast.hide();
							}
						},
						templateUrl: '/templates/toast-tpl/notify-quantity-na.html',
						parent : ele,
						//parent : $document[0].querySelector('nav'),
						position: 'top center',
						hideDelay:116000
					});


					return false;
				}

				$scope.addMoreCustom = false;

				$timeout(function(){
					$element.find(".addmore-count").animate({ top: "0px"},300);
				}, 100);

				if($scope.product.servechilled){

					if($scope.product.qChilled==0)
					$scope.product.qChilled = 1;

				}else{

					if($scope.product.qNChilled==0)
					$scope.product.qNChilled = 1;
				}

				$scope.addtocart();

			};

			$scope.activeAddToCartCustom = function(){

				$scope.addMoreCustom = true;

				$timeout(function(){
					$element.find(".addmanual input").animate({ width: "70%"},250).focus();
		  			$element.find(".addmanual .addbuttton").animate({ width: "30%"},250);
				}, 100);

			};
		}
	}
}])

.directive('productBreadcrumb', ['categoriesFac', function(categoriesFac){
	'use strict';

	return {
		restrict: 'EA',
		transclude: true,
		scope: {
			productInfo : "=info",
			viaLoyaltyStore : "="

		},
		replace: true,
		controller: function ($scope) {

			$scope.categoryBread = [];

			$scope.$watch('productInfo',

				function(newValue, oldValue) {

					if(typeof $scope.productInfo === "undefined"){
						return $scope.categoryBread;
					}

					if(typeof $scope.viaLoyaltyStore === "undefined"){
						return $scope.categoryBread.push({

									_id:0,
									title:'loyalty-store',
									slug:'loyalty-store'

								});
					}

					angular.forEach($scope.productInfo.categories, function (catId, index) {

						for(i=0;i<categoriesFac.categories.length;i++){

							var cat = categoriesFac.categories[i];
							if(cat["_id"]===catId){

								$scope.categoryBread.push({

									_id:catId,
									title:cat.cat_title,
									slug:cat.slug
									
								})
								
							}
						}

					});

				}
			);			

			

		},
		template:'<div class="productdetailbrudcumcover">'+

				'<a href="">Home</a>'+
				'<img src="images/productdetail2.png">'+			

				'<span ng-repeat="category in categoryBread">'+
				
				'<a ng-if="$first" ui-sref="mainLayout.category.products({categorySlug:category.slug})">{{category.title}}</a>'+				
				'<a ng-if="!$first" ui-sref="mainLayout.category.subCatProducts({categorySlug:categoryBread[$index-1].slug,subcategorySlug:category.slug})">{{category.title}}</a>'+
				'<img src="images/productdetail2.png">'+

				'</span>'+

				'<span>{{productInfo.name}}</span>'+
				'</div>'
	};
}])

.directive('ngBlur', ['$parse', function($parse){
	return function(scope, element, attr) {
		var fn = $parse(attr['ngBlur']);
		element.on('blur', function(event) {
			scope.$apply(function() {
				fn(scope, {$event:event});
			});
		});
	};
}])

.directive("apFocusOut", ['$document','$parse', function( $document, $parse ){
    return {
        link: function( $scope, $element, $attributes ){
            var scopeExpression = $attributes.apFocusOut,
                onDocumentClick = function(event){
                    var isChild = $element.find(event.target).length > 0;
console.log(isChild);
                    if(!isChild) {
                        $scope.$apply(scopeExpression);
                    }
                };

            $document.on("click", onDocumentClick);

            $element.on('$destroy', function() {
                $document.off("click", onDocumentClick);
            });
        }
    }
}])

.directive('backImg', function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
        });
    };
})

.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
})

.directive('outOfStock',[function(){
	return {
		restrict : "E",
		replace: true,
		templateUrl: function(elem, attr){
			return '/templates/partials/outOfStock.html';
		},
		scope: {
			product:'=',
		},
		controller: function($scope,$rootScope,$http,$mdToast,$document,UserService,$log){

			$scope.nlabel = 'Notify Me';

			$scope.showCustomToast = function() {

				$scope.nlabel = 'Wait..';

				UserService.GetUser().then(

					function(result) {

						if(result.auth===false){
							$scope.nlabel = 'Notify Me';
							$('#login').modal('show');

						}else{


							$http.post('/user/notifyme',{pid:$scope.product._id}).success(function(){
								$scope.showPopover(result);
							}).error(function(){
								$scope.nlabel = 'Notify Me';
							});
						}

					}
				);
			};


			$scope.showPopover = function(result){
				$mdToast.show({
			      controller:function($scope){
			      	$scope.user = result;
			      	$scope.closeToast = function(){
			      		$mdToast.hide();
			      	}
			      },
			      templateUrl: '/templates/toast-tpl/notify-template.html',
			      parent : $document[0].querySelector('#toastBounds'),
			      //parent : $document[0].querySelector('nav'),
			      position: 'top center',
			      hideDelay:6000
			    });

				$scope.nlabel = 'Notify Me';
			};

		}
	}
}])

.directive('notAvailable',[function(){
	return {
		restrict : "E",
		replace: true,
		templateUrl: function(elem, attr){
			return '/templates/partials/available-tag.html';
		},
		scope: {
			product:'=',
		},
		controller: function($scope,$rootScope,$log,$filter){		

			var holiDays = angular.copy($rootScope.settings.holiDays);

			$scope.weekdayoff = $filter('filter')(holiDays,{_id:'weekdayoff'});		

			if(typeof $scope.weekdayoff[0] !== 'undefined'){
				$scope.weekdayoff = $scope.weekdayoff[0];				
			}else{
				$scope.weekdayoff = {dow:[]};
			}

			$scope.isHoliday = function(daystoadd){
				var cDate = new Date();
				cDate.setTime($rootScope.settings.today);
				cDate.setDate(cDate.getDate() + daystoadd);				
				var dayofdate = cDate.getDay();				
				if($scope.weekdayoff.dow.indexOf(dayofdate) !== -1){
					return true;
				}				
				var tsofdate = cDate.getTime();
				var isPh = $filter('filter')(holiDays,{timeStamp:tsofdate});
				if(typeof isPh[0] !== 'undefined'){
					return true;
				}else{
					return false;
				}
			}

			$scope.addDays = function(days,mins){				
				var old = days;
				//CHECK UNTILL THE DAY IS NOT HOLIDAY OR WEEKDAYOFF
				while($scope.isHoliday(days)){
					days+=1;
				}
				var curDate = new Date();
				curDate.setTime($rootScope.settings.today);
				curDate.setHours(0,0,0,0);
				curDate.setDate(curDate.getDate() + days);				
				return curDate.setMinutes(mins);
			}

			$scope.availDate = $scope.addDays($scope.product.availabilityDays,$scope.product.availabilityTime);

		}
	}
}])

.directive('hoverClass', function () {
    return {
        restrict: 'A',
        scope: {
            hoverClass: '@'
        },
        link: function (scope, element) {
            /*element.on('mouseenter', function() {
                element.addClass(scope.hoverClass);
            });*/
            element.on('mouseleave', function() {
                element.removeClass(scope.hoverClass);
            });
        }
    };

})

.directive('twitterShareBtn',["SocialSharingService","sweetAlert",
    function(SocialSharingService,sweetAlert) {
        return {
            link: function(scope, element, attr) {
                setTimeout(function() {
                        twttr.widgets.createHashtagButton(
                            attr.url,
                            element[0],
                            function(el) {}, {
                                count: 'none',
                                text: "I have made a purchase on alcoholdelivery",
                                url: "http://54.169.107.156",
                                screen_name : "orderShare",
                                via : "alcoholdelivery.com"
                            }
                        );

						twttr.events.bind('tweet',function (event) {
							SocialSharingService.shareTwitter({

								key:'ADSG37171O1022',
								type:'order',

							}).then(

								function(resolveRes){

									sweetAlert.swal({

										title: "Awesome!",
										text: "Share successfully! Loyalty points are credit to your account",
										imageUrl: 'http://54.169.107.156/images/thumbimg.png'

									});
									
								},
								function(rejectRes){

									// sweetAlert.swal({

									// 	type:'error',
									// 	title: 'Oops...',
									// 	text:rejectRes.message,
									// 	timer: 2000

									// });

								}
							)
						});
                });
            }
        }
    }
])

.directive('giftingProducts',['alcoholCart',function(alcoholCart){
	return {
		restrict: 'A',
		scope: {
			giftItemKey : '@'
		},
		controller:''
	};
}])

.directive('userCards', function(){

	return {
		scope :{
			paymentmode: '=paymentmode',
			payment:'=payment'
		},
		restrict: 'A',		
		templateUrl: '/templates/partials/addcard.html',
		controller: function($scope,$rootScope,$http,$state,$payments,UserService,sweetAlert,alcoholCart){
			
			$scope.$on('addcardsubmit', function() {
	            $scope.addnewcard();
	        });

			UserService.GetUser().then(
			    function(result) {
			    	$scope.userdata = result;
			    }
			);

		    $scope.verified = function () {
		    	return $payments.verified();
		    }

		    $scope.addnewcard = function(){		    			    	
		    	if($scope.paymentmode){		    		
		    		$scope.payment.creditCard.token = 1;
		    	}
		    	$scope.processingcard = true;
		    	$scope.errors = [];
				$http.post('/payment/addcard',$scope.payment.creditCard).success(function(rdata){					

					if($scope.paymentmode){
						$scope.payment.creditCard = rdata.card;

						alcoholCart.deployCart().then(
							function(result){
								$state.go('mainLayout.checkout.review');
							}
						);

					}else{
						$scope.payment.card = '';					
						$scope.userdata = rdata.user;
						$scope.payment.creditCard = {};
					}
					
					$scope.processingcard = false;
				}).error(function(errors){
					$scope.errors = errors;
					$scope.processingcard = false;
				});

			}			

			$scope.removeCard = function(card){				
				sweetAlert.swal({
				  title: 'Are you sure?',
				  text: "You won't be able to revert this!",
				  type: 'warning',
				  showCancelButton: true,
				  confirmButtonColor: '#3085d6',
				  cancelButtonColor: '#d33',
				  confirmButtonText: 'Yes, delete it!'
				}).then(function() {				  
					$http.post('/payment/removecard',card).success(function(rdata){
						$scope.userdata = rdata.user;						
						$scope.payment.card = '';
					}).error(function(errors){						
						sweetAlert.swal({
							type:'error',
							text:errors,							
						});						
					});
				});				
			}

			$scope.changeCard = function(card){
				$scope.payment.creditCard = card;
			}
		}
	};
})
;
