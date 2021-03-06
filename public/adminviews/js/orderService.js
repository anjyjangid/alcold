MetronicApp
.service('alcoholCart',['$http', '$q', '$filter', 'sweetAlert', 'alcoholCartItem', 'cartSale', 'alcoholCartPackage', 'alcoholCartGiftCard', '$rootScope'
, function($http, $q, $filter, sweetAlert, alcoholCartItem, cartSale, alcoholCartPackage, alcoholCartGiftCard, $rootScope){

	this.init = function(){

		this.$cart = {

			products : {},
			sales : [],
			packages : [],
			giftCards : [],
			nonchilled : false,
			delivery : {

				type : 0,
				charges : null,
				address : null,
				contact : null,
				instruction : null,
				leaveatdoor : false,
				instructions : null,

			},
			service : {
				express : {
					status : "false",
					charges : null
				},
				smoke : {
					status : false,
					charges : null
				},
				delivery : {
					free : false,
					charges : null,
					mincart : null,
				},
			},
			discount : {
				nonchilled : {
					status : false,
					exemption : null
				}
			},
			timeslot : {
					datekey:false,
					slotkey:false,
					slug:"",
					slotslug:""
				},
		};

	}

	this.getUser = function () {

		return this.$cart[this.$cart.orderType];

	}

	this.addProduct = function (id, quantity, serveAs) {

		var defer = $q.defer();

		var inCart = this.getProductById(id);
		var _self = this;
		var deliveryKey = _self.getCartKey();

		id = mongoIdToStr(id);

		$http.put("api/cart/"+deliveryKey, {
			"id":id,
			"quantity":quantity,
			"chilled":serveAs,
			"type":"product"
		})
		.error(function(data, status, headers) {

			defer.reject(data);

		})
		.success(function(response) {

			var resProduct = response.product;
			var sales = response.sales;
			var proRemaining = response.proRemaining;

			if(inCart){

				if(resProduct.quantity==0){

					_self.removeItemById(id);

				}else{

					inCart.setRQuantity(resProduct.chilled.quantity,resProduct.nonchilled.quantity);
					inCart.setTQuantity(resProduct.remainingQty);
					inCart.setRemainingQty(resProduct.remainingQty);
					inCart.setPrice(resProduct);

				}									

			}else{				
				
	    		var newItem = new alcoholCartItem(id, resProduct);
				_self.$cart.products[id] = newItem;
				
			}

			_self.setAllProductsRemainingQty(proRemaining);
			_self.setAllSales(sales);

			

			if(resProduct.product.change!==0){

				if(resProduct.product.change>0){
					$rootScope.$broadcast('alcoholCart:updated',{msg:"Items added to cart",quantity:Math.abs(resProduct.product.change)});
				}else{
					$rootScope.$broadcast('alcoholCart:updated',{msg:"Items removed from cart",quantity:Math.abs(resProduct.product.change)});
				}
				
			}

			_self.validateContainerGift();

			defer.resolve(response);

		});

		return defer.promise;

	};

	this.setAllProductsRemainingQty = function(data){
		_self = this;
		angular.forEach(data, function (value,key) {

			var p = _self.getProductById(key);

			if(p!==false){
				p.setRemainingQty(value);
			}

		})
	}

	this.setAllSales = function (sales) {

		var _self = this;
		_self.$cart.sales = [];
		angular.forEach(sales, function (sale,index) {

			var id = sale._id.$id;

			var isExist = _self.getSaleById(id);

			if(isExist === false){

				var saleDetail = "";

				angular.forEach(sale.products, function(sPro){

					var temp = _self.getProductById(sPro._id);
					
					sPro.product = {
						name : temp.product.name,
						slug : temp.product.slug,
						chilled : temp.product.chilled,
						price : temp.unitPrice,
						image : $filter('getProductThumb')(temp.product.imageFiles)
					}

					saleDetail = temp.sale;
				});
				
				angular.forEach(sale.action, function(sPro){

					var temp = _self.getProductById(sPro._id);

					sPro.product = {
						name : temp.product.name,
						slug : temp.product.slug,
						chilled : temp.product.chilled,
						price : temp.unitPrice,
						image : $filter('getProductThumb')(temp.product.imageFiles)
					}

				});	

				var newSale = new cartSale(sale,saleDetail);
				_self.$cart.sales.push(newSale);

			}else{

			}


		});

		this.resetProductsPrice();

	}

	this.resetProductsPrice = function (){

		var products = this.getProducts();
		angular.forEach(products, function(product, key) {
			product.setPrice();
		});

	}

	this.saleChilled = function(saleObj){
			
			if(this.$cart.nonchilled)return false; // unable to change product chilled status if whole cart set as nonchilled

			var saleId = saleObj.getId();
			saleId = saleId.$id;

			saleObj.chilled = !saleObj.chilled;

			var chilled = saleObj.chilled;
			var deliveryKey = this.getCartKey();

			$http.put("api/cart/sale/chilled/"+deliveryKey, {
					"id":saleId,
					"chilled":chilled,					
				},{

			}).error(function(data, status, headers) {

			}).success(function(response) {

			});

		}

	this.updateChilledStatus = function(id,type){
		
		if(this.$cart.nonchilled)return false; // unable to change product chilled status if whole cart set as nonchilled

		var product = this.getProductById(id);

		product[type+'Status'] = !product[type+'Status'];
					
		var deliveryKey = this.getCartKey();

		$http.put("api/cart/chilledstatus/"+deliveryKey, {
				"id":id,
				"chilled":product.qChilledStatus,
				"nonchilled":product.qNChilledStatus
			},{

		}).error(function(data, status, headers) {

		}).success(function(response) {

		});

	}

	this.removeSmoke = function(){

		this.$cart.service.smoke.status = false;
		this.$cart.service.smoke.detail = "";

		this.deployCart();
	}

	this.addSmoke = function(detail){

		var smoke = this.$cart.service.smoke;
		
		if(typeof detail==="undefined" || detail==""){

			var toast = $mdToast.simple()
				.textContent("Please provide smoke detail")
				
				.highlightAction(false)
				.position("top right fixed smokedetail")
				.hideDelay(2000);

			$mdToast.show(toast);

		}else{

			smoke.detail = detail;

		}

		this.deployCart();

	}

	this.addGiftCard = function(giftData){

		var isFound = this.getGiftCardByUniqueId(giftData._uid);

		if(isFound===false){

			var giftCard = new alcoholCartGiftCard(giftData);
			this.$cart.giftCards.push(giftCard);

		}		
	};
	
	this.addPackage = function (id,detail) {

		var _self = this;

		var deliveryKey = _self.getCartKey();
		
		var d = $q.defer();

		var products = [];

		angular.forEach(detail.packageItems,function(item,key){

			angular.forEach(item.products,function(product,key){

				if(product.cartquantity > 0){

					var tempPro = {
						_id:product._id,
						quantity : product.cartquantity
					};

					products.push(tempPro);
				}
			})
		});		

		$http.post("api/cart/package/"+deliveryKey, {
				"id":id,
				"products":products,
				"quantity" : parseInt(detail.packageQuantity),
				"price" : parseFloat(detail.packagePrice),
				"savings" : parseFloat(detail.packageSavings)

		}).error(function(data, status, headers) {

			$rootScope.$broadcast('alcoholCart:updated',{msg:"Something went wrong"});

		}).success(function(response) {			
			
			var inCart = _self.getPackageByUniqueId(response.key);

			detail.products = products;

			var newPackage = new alcoholCartPackage(id, response.key, detail);

	    _self.$cart.packages.push(newPackage);

	    //$rootScope.$broadcast('alcoholCart:updated',{msg:"Package added to cart",quantity:detail.packageQuantity});
	    	
			d.resolve(response);			
		});

		return d.promise;		

	};

	this.getGiftCardByUniqueId = function(cardUniqueId){

		var giftCards = this.getGiftCards();
		var build = false;

		angular.forEach(giftCards, function (giftCard) {
			if (giftCard.getUniqueId() === cardUniqueId) {
				build = giftCard;
			}
		});
		return build;

	}

	this.getGiftCards = function(){

		var cards = this.getCart().giftcards || [];

		return cards;
	}

	this.removeProduct = function (id,chilled) {

		var defer = $q.defer();
		var deliveryKey = this.getCartKey();
		var _self = this;

		$http.delete("api/cart/product/"+deliveryKey+'/'+id+'/'+chilled).then(

			function(response){

				response = response.data;

				var inCart = _self.getProductById(id);

				if(response.removeCode==200){

					var resProduct = response.product;

					inCart.setRQuantity(resProduct.chilled.quantity,resProduct.nonchilled.quantity);
					inCart.setTQuantity(resProduct.quantity);
					inCart.setRemainingQty(resProduct.remainingQty);

				}else{
					_self.removeItemById(id);
				}

				if(response.change>0){
					
					$rootScope.$broadcast('alcoholCart:updated',{msg:"Items removed from cart",quantity:Math.abs(response.change)});
					
				}

				if(typeof(_self.$cart.couponData) !== "undefined"){
					_self.setCouponPrice(_self.$cart.couponData);
				}
				_self.validateContainerGift();

				defer.resolve(response);

			},
			function(errorRes){

				defer.reject(errorRes);

			}
		);

		return defer.promise;		
		
	};

	this.removeItemById = function (id,notify) {

		var item;
		var cart = this.getCart();
		angular.forEach(cart.products, function (product, index) {
			if(index === id) {

				delete cart.products[index];
				item = product || {};

			}
		});

		var showNotification = notify || true;

		if(showNotification){
			$rootScope.$broadcast('alcoholCart:itemRemoved', item);
		}
		
	};


	this.removePackage = function (id,fromServerSide) {

		var defer = $q.defer();
		var locPackage;
		var cart = this.getCart();
		var deliveryKey = this.getCartKey();
		var _self = this;

		$http.delete("api/cart/package/"+id+'/'+deliveryKey).then(

			function(response){

				angular.forEach(cart.packages, function (package, index) {

					if(package.getUniqueId() === id) {

						var locPackage = cart.packages.splice(index, 1)[0] || {};

						//$rootScope.$broadcast('alcoholCart:updated',{msg:"Package Removed from cart",quantity:1});
					}
				});	

				defer.resolve(response);
			},
			function(errorRes){

				defer.reject(errorRes);
			}
		);
	
		return defer.promise;	
	};

	this.removeCard = function (id,fromServerSide) {

		var locPackage;
		var cart = this.getCart();
		var cartKey = this.getCartKey();
		var d = $q.defer();

		angular.forEach(cart.giftCards, function (giftcard, index) {

			if(giftcard.getUniqueId() === id) {

				if(typeof fromServerSide !== 'undefined' && fromServerSide){

					$http.delete("api/cart/card/"+cartKey+'/'+id).then(

						function(successRes){

							var locCard = cart.giftCards.splice(index, 1)[0] || {};

							// $rootScope.$broadcast('alcoholCart:cardRemoved', "GiftCard removed from cart");

							d.resolve(successRes);

						},
						function(errorRes){

							d.reject(errorRes);

						}

					);
				}

			}
		});

		// $rootScope.$broadcast('alcoholCart:itemRemoved', locCard);
		return d.promise;

	};

	this.removeSale = function (id) {

		var defer = $q.defer();
		var locSale;
		var cart = this.getCart();
		var deliveryKey = this.getCartKey();
		var _self = this;

		$http.delete("api/cart/sale/"+deliveryKey+'/'+id).then(

			function(response){
				
				response = response.data;
				
				_self.removeSaleAndSetProducts(id);

				_self.validateContainerGift();
				$rootScope.$broadcast('alcoholCart:saleRemoved', locSale);

				defer.resolve(response);

			},
			function(errorRes){

				defer.reject(errorRes);

			}
		);

		return defer.promise;		
		
	};

	this.removeSaleAndSetProducts = function(id){

		var item;
		var cart = this.getCart();
		var _self = this;

		angular.forEach(cart.sales, function (sale, index) {

			if(sale.getId().$id === id) {
				 
				sale['action'] = sale['action'] || [];

				var products = [].concat(sale['products'] , sale['action'])

				var toRemove = {};

				angular.forEach(products, function(sPro){

					if(!angular.isDefined(toRemove[sPro._id])){
						toRemove[sPro._id] = 0;
					}

					toRemove[sPro._id]+= sPro.quantity;

				});

				angular.forEach(toRemove, function( value, key ) {

					var product = _self.getProductById(key);

					var qtyChilled = parseInt(product.qChilled);
					var qtyNonChilled = parseInt(product.qNChilled);

					if(qtyChilled>value){

						qtyChilled-=value;
						value = 0;

					}else{

						value-= qtyChilled;
						qtyChilled=0;

					}

					if(value > 0){							

						if(qtyNonChilled>value){

							qtyNonChilled-=value;
							value = 0;

						}else{

							value-= qtyNonChilled;
							qtyNonChilled=0;

						}

					}

					var totalProQty = qtyChilled+qtyNonChilled;
					
					if(totalProQty<1){
						_self.removeItemById(product.getId());
					}else{
						product.setRQuantity(qtyChilled,qtyNonChilled);
					}

				});

				var locPackage = cart.sales.splice(index, 1)[0] || {};
				item = sale || {};

			}

		});			

		$rootScope.$broadcast('alcoholCart:updated',{msg:"Sale Removed from cart"});
		
	}

	this.getCartKey = function(){

		var deliverykey = this.getCart()._id;
		return deliverykey;

	}

	this.getProductById = function (productId){

		var products = this.getCart().products;
		var build = false;

		if(typeof products[productId] !== 'undefined'){
			build = products[productId];
		}

		return build;
	};

	this.getSaleById = function(saleId){
		
		var sales = this.getCart().sales;
		var build = false;

		angular.forEach(sales, function (sale) {
			if  (sale._id.$id === saleId) {
				build = sale;
			}
		});
		return build;

	}

	this.validateContainerGift = function(){

		var cGifts = this.getGifts();
		var proInCartCount = this.getProductsCountInCart();
		
		angular.forEach(cGifts,function(cGift,i){

			angular.forEach(cGift.products,function(product,index){

				var key = product.getId();
				
				if(typeof proInCartCount[key] !== 'undefined'){

					var qtyInCart = proInCartCount[key];
					var qtyInGift = product.getQuantity();

					if(qtyInCart > 0){

						if(qtyInCart<qtyInGift){							
							product.setQuantity(qtyInCart);
						}
						proInCartCount[key]-=qtyInGift;

						return;
					}
				}

				cGifts[i].products.splice(index, 1)[0]

			})

			if(typeof cGifts[i].products!=="undefined" && cGifts[i].products.length<1){
				cGifts.splice(i, 1)[0]
			}

		})

	}

	this.setPromotionsInCart = function(){

		_oCart = this;
		angular.forEach(promotionsService.$promotions,function(promotion){

			if(_oCart.getPromotionById(promotion._id)!==false ){
				promotion.inCart = true;
			}else{
				promotion.inCart = false;
			}
		
		});	

	}

	this.getProductsCountInCart = function(){

		var products = this.getProducts();
		var promotions = this.getPromotions();
		var loyalty = this.getLoyaltyProducts();

		var prosInCart = {};

		angular.forEach(products, function(product, key) {
			prosInCart[key] = product.getQuantity();
		});
	
		angular.forEach(loyalty, function(product, key) {

			if(typeof prosInCart[key] === 'undefined'){

				prosInCart[key] = product.getQuantity();

			}else{

				prosInCart[key] = parseInt(prosInCart[key]) + parseInt(product.getQuantity());

			}
		});
		
		return prosInCart;

	}

	this.getGiftCardByUid = function (uId){

			var cards = this.getCart().giftCards;
			var build = false;

			angular.forEach(cards, function (card) {
				
				if (card.getUniqueId() == uId) {
					build = card;
				}
			});
			return build;
		};

	this.getPromotions = function(){
		return this.getCart().promotions;
	};

	this.getLoyaltyProducts = function(){
		return this.getCart().loyalty || {};
	};

	this.getPackageByUniqueId = function(packageUniqueId){

		var packages = this.getCart().packages;
		var build = false;
		
		angular.forEach(packages, function (package) {
			if  (package.getUniqueId() === packageUniqueId) {
				build = package;
			}
		});
		return build;

	};

	this.getGifts = function(){

			var gifts = this.getCart().gifts || [];
			
			return gifts;
		}

	this.getProducts = function(){
		return this.getCart().products;
	};

	this.getSales = function(){
		return this.getCart().sales  || [];
	}
		
	this.getGiftCards = function(){
		return this.getCart().giftCards;
	};

	this.getPackages = function(){
		return this.getCart().packages;
	};

	this.getTotalItems = function(){

		var count = 0;
		var items = this.getProducts();
		angular.forEach(items, function (item) {
			count += item.getQuantity();
		});

		return count;
	};

	this.getCart = function(){
		return this.$cart;
	};

	this.resetTimeslot = function(){

		this.$cart.timeslot = {
					datekey:false,
					slotkey:false,
					slug:"",
					slotslug:""
				}
	}

	this.getTotalPackages = function () {

		return this.getCart().packages.length
	};

	this.getTotalGifts = function () {

		return this.getCart().giftCards.length
	};

	this.getTotalUniqueItems = function () {
		
		if(typeof this.getCart() === "undefined"){
			return 0;
		}

		var cart = this.getCart();

		count = 0;

		angular.forEach(cart.products, function (product) {
			if(product.getQuantity()>0){
				count++;
			}
		});

		count+= Object.keys(cart.sales).length;

		count+= cart.packages.length;

		count+= cart.giftCards.length;

		return count;
	};

	this.setSubTotal =function(){
		
		var total = 0;
		var cart = this.getCart();

		angular.forEach(cart.products, function (product) {
			if(product.getQuantity()>0){
				total += parseFloat(product.getRemainQtyPrice());
			}
		});

		angular.forEach(cart.packages, function (package) {
			total += parseFloat(package.getTotal());
		});		

		
		angular.forEach(cart.giftCards, function (giftCard) {
			total += parseFloat(giftCard.getPrice());
		});

		angular.forEach(cart.sales, function (sale) {
			total += parseFloat(sale.getPrice());
		});

		if(typeof(this.$cart.couponData) !== "undefined"){
			this.setCouponPrice(this.$cart.couponData,total);
		}

		return +parseFloat(total).toFixed(2);

	}

	this.getSubTotal = function(){

		return this.$cart.payment.subtotal = this.setSubTotal();

	};

	this.setCartTotal = function(){

		var cartTotal = 0;

		cartTotal+= parseFloat(this.getSubTotal());

		cartTotal+= parseFloat(this.getAllServicesCharges());

		cartTotal+= parseFloat(this.getDeliveryCharges());

		cartTotal-= parseFloat(this.getDiscount());

		cartTotal-= parseFloat(this.getCouponDiscount());

		var service = this.$cart.service;
			var _self = this;
			
			_self.$cart.otherCharges = {};

			this.$cart.payment.totalWithoutSur = cartTotal;

			if(this.$cart.service.tempsurcharge && this.$cart.delivery.type==0 && angular.isDefined(service.surcharge)){

				if(angular.isDefined(service.surcharge.holiday)) {

					if(angular.isDefined(service.surcharge.holiday.value) && service.surcharge.holiday.value>0) {

						var amt = 0;
						if(service.surcharge.holiday.type==1){
							amt = (cartTotal * service.surcharge.holiday.value)/100;
						}else{
							amt = service.surcharge.holiday.value;
						}


						_self.$cart.otherCharges = {
							"label" : service.surcharge.holiday.label,
							"value" : amt.toFixed(2),
						}
						
						cartTotal = cartTotal + amt.toFixed(2)
						//charges.push(currCharge);

					}

				}

			}

		return +parseFloat(cartTotal).toFixed(2);

	};

	this.getCartTotal = function(){

		var cartTotal = this.setCartTotal();
		this.$cart.payment.total = cartTotal;
		return cartTotal;

	};

	this.setCartChilled = function(status){

			var isEligible = this.isEligibleNonChilled();
			
			if(!isEligible){

				sweetAlert.swal({
								type:'warning',
								title: "There are no chilled items in cart.",
								text : "Chilled items are usually beers, champagnes and white wines",
								customClass: 'swal-wide'
							}).done();				

				return false;
			}

			if(typeof status !=="undefined"){

				this.$cart.nonchilled = status;
				this.$cart.discount.nonchilled.status = status;				
			}

			this.deployCart().then(
				function(res){

					if(!status){
						$rootScope.$broadcast('alcoholCart:notify',"Non-Chilled condition deactivated");
					}else{
						$rootScope.$broadcast('alcoholCart:notify',"Non-Chilled condition activated");
					}

				}
			);
		
		}

	this.isEligibleNonChilled = function(){

		var products = this.getProducts();
		
		var isEligible = false;
		angular.forEach(products, function (item,key) {
			if(item.getChilledAllowed()){
				
				isEligible = true;
				return false;
			}
			if(isEligible)
				return false;

		});

		if(!isEligible)
		this.$cart.nonchilled = false;
		return isEligible;
		
	}

	this.setDiscount = function(){

		var discount = 0;

		if(this.$cart.nonchilled){

			discount += this.$cart.discount.nonchilled.exemption;

		}

		return +parseFloat(discount).toFixed(2);

	}

	this.getDiscount = function(type){

		var discount = 0, nonChilledDiscount = 0;

		this.isEligibleNonChilled();

		if(this.$cart.nonchilled){

			nonChilledDiscount = parseFloat(this.$cart.discount.nonchilled.exemption);

			discount+=nonChilledDiscount;

		}

		if(type==='nonchilled'){
				
			return nonChilledDiscount.toFixed(2);
		}

		return +parseFloat(discount).toFixed(2);
	}

	this.setAllServicesCharges = function(){

		var allServicesCharges = 0;

		var service = this.$cart.service;

		if(service.express.status){
			allServicesCharges+= service.express.charges;
		}
		if(service.smoke.status){
			allServicesCharges+= service.smoke.charges;
		}

		service.total = allServicesCharges;

		return +parseFloat(allServicesCharges).toFixed(2);
	};

	this.getAllServicesCharges = function(){
		return this.setAllServicesCharges();
	}

	this.setDeliveryCharges =function(){

		var delivery = this.$cart.service.delivery;

		var subTotal = parseFloat(this.getSubTotal());

		if(subTotal>=parseFloat(delivery.mincart)){

			this.$cart.service.delivery.free = true;
			this.$cart.delivery.charges = 0;

		}else{

			this.$cart.service.delivery.free = false;
			this.$cart.delivery.charges = parseFloat(this.$cart.service.delivery.charges).toFixed(2);

		}

		return this.$cart.delivery.charges;

	}

	this.getDeliveryCharges = function(){

		return this.setDeliveryCharges();

	};

	this.totalCost = function () {
		return +parseFloat(this.getSubTotal() + this.getShipping() + this.getTax()).toFixed(2);
	};

	this.$restore = function(storedCart) {

		var _self = this;

		_self.init();

		if(typeof storedCart.products !== 'undefined'){

			angular.forEach(storedCart.products, function (item,key) {

				var newItem = new alcoholCartItem(key, item);
				_self.$cart.products[key] = newItem;

			});

			delete storedCart.products;

		}

		if(typeof storedCart.sales !== 'undefined'){

			angular.forEach(storedCart.sales, function (sale,key) {

				var saleDetail = "";

				angular.forEach(sale.products, function(sPro){

					var temp = _self.getProductById(sPro._id);
					
					sPro.product = {
						name : temp.product.name,
						slug : temp.product.slug,
						chilled : temp.product.chilled,
						price : temp.unitPrice,
						image : $filter('getProductThumb')(temp.product.imageFiles)
					}

					saleDetail = temp.sale;
				});
				
				angular.forEach(sale.action, function(sPro){

					var temp = _self.getProductById(sPro._id);

					sPro.product = {
						name : temp.product.name,
						slug : temp.product.slug,
						chilled : temp.product.chilled,
						price : temp.unitPrice,
						image : $filter('getProductThumb')(temp.product.imageFiles)
					}

				});				

				var newSale = new cartSale(sale,saleDetail);
				_self.$cart.sales.push(newSale);

			});

			delete storedCart.sales;
		}

		if(typeof storedCart.giftCards !== 'undefined'){

			angular.forEach(storedCart.giftCards, function (giftCard,key) {

				var giftCard = new alcoholCartGiftCard(giftCard);
				_self.$cart.giftCards.push(giftCard);

			});
			delete storedCart.giftCards;
		}

		if(typeof storedCart.packages !== 'undefined'){

			angular.forEach(storedCart.packages, function (package,key) {

				var newPackage = new alcoholCartPackage(package._id,package._unique,package);
				_self.$cart.packages.push(newPackage);

			});
			delete storedCart.packages;

		}

		angular.extend(_self.$cart,storedCart);

		// _self.$cart._id = storedCart._id;

	};

	this.deployCart = function(){

		var cart = {};
		var cartKey = this.getCartKey();

		angular.copy(this.getCart(),cart);
		
		delete cart.packages;
		delete cart.products;
		delete cart._id;
		delete cart.created_at;
		delete cart.updated_at;

		var d = $q.defer();

		$http.put("adminapi/order/deploycart/"+cartKey, cart,{

		}).error(function(data, status, headers) {

			d.reject(data);

		}).success(function(response) {

			d.resolve(response);

		});

		return d.promise;

	}

	this.newCart = function() {

		var _self = this;
		return $http.get("/adminapi/order/newcart")
		.success(function(newCartRes){
			_self.$restore(newCartRes.cart);
		});
	}


	this.checkoutValidate = function(){

		var d = $q.defer();

		var isValid = true;

		var subTotal = this.getSubTotal();

		var errmessage = [];

		var resolve = false;	
		
		//check address selected
		if(typeof this.$cart.selectedAddress == 'undefined'){			
			errmessage.push({value:'addresserror',message:'Please select delivery address!'});
		}

		//check address selected
		if(this.$cart.delivery.contact == null){			
			errmessage.push({value:'contacterror',message:'Please enter contact number!'});
		}

		if(errmessage.length){			
			d.reject({customError:true,messages:errmessage});
		}

		
		//CHECK PAYMENT OPTIONS
		if(this.$cart.payment.method == 'COD'){				
			//REMOVE CARD ATTR IN CASE OF COD
			delete this.$cart.payment.card;
			delete this.$cart.payment.creditCard;
			delete this.$cart.payment.savecard;
			d.resolve({});
		}else{

			var cartpayment = this.$cart.payment;

			if(typeof cartpayment.card == 'undefined' || cartpayment.card == "" || cartpayment.card == null){
				d.reject({value:'paymenterror',message:'Please select card for payment.'});
			}else{				
				if(cartpayment.card == 'newcard'){
					cartpayment.creditCard.token = 1;							
					$http.post('/adminapi/payment/addcard/'+this.$cart.user,cartpayment.creditCard).error(function(data, status, headers) {			        	
			        	d.reject({value:'paycarderror',message:'Please validate credit card details',errors:data});			        	
			        }).success(function(rdata){						
						d.resolve(rdata);
					});
					//$scope.$broadcast('addcardsubmit');					
				}else{
					if(!this.$cart.payment.creditCard.cvc || this.$cart.payment.creditCard.cvc == ''){						
						d.reject({value:'paymentcvverror',message:'Please enter cvv for the selected card.'});						
					}else{
						d.resolve({});						
					}						
				}
			}

		}

		/*if(isValid){
			d.resolve("every thing all right");
		}else{
			d.reject("foo");
		}*/		
		
		return d.promise;
	}

	this.processPayment = function(){

		var d = $q.defer();

		d.reject("foo");

		return d.promise;
	}

	this.freezCart = function(){

			var d = $q.defer();

			this.deployCart().then(
				
				function(successRes){

					$http.get("freezcart").error(function(data, status, headers) {

			        	d.reject(data);

			        }).success(function(response) {	        		      

			        	d.resolve(response);

			        });	
				},
				function(errorRes){}
			);

			return d.promise;

		}

	this.setCouponPrice = function(coupon,cartSubTotal){
			
			var _self = this;
			var cTotal = coupon.total;

			var isProductOriented = (coupon.products.length + coupon.categories.length)?true:false;

			cartSubTotal = angular.isDefined(cartSubTotal)?cartSubTotal:this.getSubTotal();

			var discountTotal = 0;
			var discountMessage = '';
			this.$cart.couponMessage = '';

			if(!cTotal || (cTotal && cTotal <= cartSubTotal) ){

				if(isProductOriented){

					var productsList = _self.getProducts();

					if(Object.keys(productsList).length){
						angular.forEach(productsList, function (item) {

							var discountAmt = item.setCoupon(coupon);
							discountTotal += discountAmt.couponAmount;

							if(discountAmt.couponMessage)
								discountMessage = discountAmt.couponMessage;
						});

						if(!discountTotal && discountMessage)
							this.$cart.couponMessage = discountMessage;

					}else{
						if(typeof(this.$cart.couponData) !== "undefined"){
							this.removeCoupon();
						}
					}

				}else{

					if(coupon.type==1){
						discountTotal = coupon.discount;
					}else{
						discountTotal = cartSubTotal*(coupon.discount/100);
					}

					var totalExceptCoupon = cartSubTotal;

					totalExceptCoupon+= parseFloat(this.getAllServicesCharges());

					totalExceptCoupon+= parseFloat(this.$cart.delivery.charges);

					totalExceptCoupon-= parseFloat(this.getDiscount());

					discountTotal = discountTotal>totalExceptCoupon?totalExceptCoupon:discountTotal;

				}

			}else{
				this.$cart.couponMessage = 'Minimum amount should be '+cTotal+' to use this coupon.';
			}

			this.setCouponMessage(this.$cart.couponMessage, 1);

			this.$cart.couponDiscount = discountTotal;
		}

		this.removeCoupon = function(res){
			var _self = this;
			var productsList = this.getProducts();

			$rootScope.couponInput = true;
			$rootScope.couponOutput = false;
			this.$cart.couponDiscount = 0;
			this.$cart.couponMessage = '';

			if(typeof(res) == "undefined"){
				this.setCouponMessage(this.$cart.couponMessage, 2);
			}

			if(this.$cart.user == null){
				alert('Please select customer.');
				return false;
			}

			$http.post("adminapi/checkCoupon/"+this.$cart.user, {params: {cart: _self.getCartKey(), removeCoupon: 1}}).success(function(result){
				delete _self.$cart.couponData;
			}).error(function(){

			});	
		}

		this.checkCoupon = function(discountCode, cartKey){
			var _self = this;
			var cartKey = cartKey;
			var couponCode = discountCode;

			if(this.$cart.user == null){
				alert('Please select customer.');
				return false;
			}

			$http.post("adminapi/checkCoupon/"+this.$cart.user, {params: {cart: cartKey, coupon: couponCode}})
				.success(function(result){

					if(result.errorCode==1 || result.errorCode==2){

						_self.removeCoupon();
						$rootScope.invalidCodeMsg = false;
						$rootScope.invalidCodeMsgTxt = result.msg;
						return false;
					}

					$rootScope.invalidCodeMsg = true;
					_self.$cart.couponData = result.coupon;
					_self.setCouponPrice(result.coupon);
					

				}).error(function(){

				});
		}

		this.getCouponDiscount = function(){
			if(typeof(this.$cart.couponDiscount) !== "undefined"){

				if(!isNaN(this.$cart.couponDiscount))
					return this.$cart.couponDiscount;

				return 0;	
			}

			return 0;
		}

		this.getCouponCode = function(){
			if(typeof(this.$cart.couponData) !== "undefined"){
				return this.$cart.couponData.code;
			}else{
				return '';
			}
		}

		this.setCouponMessage = function(msg, type){
			if(typeof(msg) !== "undefined"){
				if(msg){
					$rootScope.invalidCodeMsg = false;
					$rootScope.invalidCodeMsgTxt = msg;
					this.removeCoupon(1);
				}else{
					$rootScope.invalidCodeMsg = true;
					$rootScope.invalidCodeMsgTxt = '';

					if(type==1){
						$rootScope.couponInput = false;
						$rootScope.couponOutput = true;
					}					
				}				
			}
		}

}])

.service('alcoholGifting', ['$rootScope', '$q', '$http', '$mdToast', 'alcoholCart', function ($rootScope, $q, $http, $mdToast, alcoholCart) {

	this.addUpdateGiftCard = function(gift, cartId){

		var defer = $q.defer();

		$http.post("api/cart/giftcard/"+cartId,{
			type: 'giftcard',
			id:gift._id,
			recipient : gift.recipient
		}).then(

			function(successRes){

				alcoholCart.addGiftCard(successRes.data.data);

				defer.resolve(successRes);

			},
			function(errorRes){
				defer.reject(errorRes);
			}

		)

		return defer.promise;
	}

	this.updateGiftCard = function(uid){

		var giftObj = alcoholCart.getGiftCardByUid(uid);

		if(giftObj===false){
			return false;
		}

		if(giftObj.recipient.quantity<1){
			alcoholCart.removeCard(uid,true);
			return false;
		}

		recipient = giftObj.getRecipient();

		var defer = $q.defer();

		$http.put("api/cart/giftcard/"+uid,{
			type: 'giftcard',
			recipient : recipient
		}).then(

			function(successRes){

				$rootScope.$broadcast('alcoholCart:updated',{msg:"Gift Card Updated"});
				defer.resolve(successRes);

			},
			function(errorRes){
				defer.reject(errorRes);
			}

		)

		return defer.promise;
	}

}])

.service('alcoholStore', ['$http', 'alcoholCart', '$q', 'sweetAlert', function ($http, alcoholCart, $q, sweetAlert) {

	return {

		init : function (){

			return $q(function(resolve,reject){

				$http.get("/adminapi/order").success(function(response){

					if(!response.isUnprocessed){

						alcoholCart.newCart()
						.then(resolve,reject);

					}else{

						alcoholCart.$restore(response.cart);
						resolve();

					}

				})

			})

		}

	}

}])

.service('categoriesService', ['$http', '$q', '$log', function ($http, $q, $log){

	this.init = function() {

		var _self = this;
		var d = $q.defer();

		$http.get("api/category/pricing").success(function(response){
			_self.categoryPricing = response;
		});

		$http.get("api/super/category").success(function(response){

			_self.categories = response;			

			_self.processCategories(_self.categories).then(
				function(res){
					_self.categoriesParentChild = res;
					d.resolve(_self.categoriesParentChild);
				}
			);

		});



		return d.promise;

	};

	this.processCategories = function(categories){

		var parentCategories = {};

		return $q(function(resolve,reject){

			$http.get("/adminapi/setting/settings/pricing").success(function(response){

				var globalPricingObj = {
					express_delivery_bulk : response.settings.express_delivery_bulk,
					regular_express_delivery : response.settings.regular_express_delivery
				}

				angular.forEach(categories, function(value, key) {

					if(!value.ancestors){

						angular.extend(globalPricingObj,value);
						angular.extend(value,globalPricingObj);

						parentCategories[value._id] = value;
					}

				});

				angular.forEach(categories, function(value, key) {

					if(typeof value.ancestors!=='undefined'){

						var parId = value.ancestors[0]._id["$id"];
					
						if(!value.express_delivery_bulk){
							value.express_delivery_bulk = parentCategories[parId].express_delivery_bulk;
						}
						if(!value.regular_express_delivery){
							value.regular_express_delivery = parentCategories[parId].regular_express_delivery;
						}

						parentCategories[parId]['child'] = {};
						parentCategories[parId]['child'][value._id] = value;

					}

				});

				resolve(parentCategories);

			});

		})

	}

	this.getCategoryById = function(catId){

		var i = 0;
		var category = false;
		for(i;i<this.categories.length;i++){
			if(this.categories[i]._id == catId){
				category = this.categories[i];
				break;
			}
		}

		return category;
	}

}])

.factory('productFactory', ['$http', '$q', '$log', 'categoriesService', 'alcoholCart', function ($http, $q, $log, categoriesService, alcoholCart){

	var product = function(product){

		this.setDetail(product);
		this.setPricing(product);
		this.setPrice(product);

		this.setIncartSetting(product);

	};

	product.prototype.setDetail = function(product){

		angular.extend(this,product);

	}

	product.prototype.setPricing = function(product){

		var categories = angular.copy(product.categories);
		var proCategory = categoriesService.getCategoryById(categories.pop());


		this.express_delivery_bulk = !product.express_delivery_bulk?proCategory.express_delivery_bulk:product.express_delivery_bulk;

		this.regular_express_delivery = !product.regular_express_delivery?proCategory.regular_express_delivery:product.regular_express_delivery;

	}

	product.prototype.getQuantity = function(){

		return this.quantity;

	};

	product.prototype.getRegularExpressPricing = function(){

		return this.regular_express_delivery;

	};

	product.prototype.getExpressBulkPricing = function(){
		return this.express_delivery_bulk.bulk
	}

	product.prototype.setPrice = function(product){

		if(angular.isDefined(product)){
			var originalPrice = parseFloat(this.product.price);
		}else{
			var originalPrice = parseFloat(product.price);
		}

		var unitPrice = originalPrice;

		var pricing = this.getRegularExpressPricing();

		if(pricing.type==1){

			unitPrice +=  parseFloat(originalPrice * pricing.value/100);

		}else{

			unitPrice += parseFloat(pricing.value);

		}

		price = unitPrice;
		price = parseFloat(price.toFixed(2));

		this.unitPrice = price;

		var bulkArr = this.getExpressBulkPricing();

		for(i=0;i<bulkArr.length;i++){

			var bulk = bulkArr[i];

			if(bulk.type==1){
				bulk.price = originalPrice + (originalPrice * bulk.value/100);
			}else{
				bulk.price = originalPrice + bulk.value;
			}
			bulk.price = bulk.price.toFixed(2);
		}

		return this.price = price;


	};

	product.prototype.getTotalQuantity = function(){

		this.totalQuantity = (parseInt(this.qChilled) || 0) + (parseInt(this.qNChilled) || 0);

		return parseInt(this.totalQuantity);

	}

	product.prototype.getPrice = function(){

		var totalQuantity = this.getTotalQuantity();

		var pricing = this.getRegularExpressPricing();

		var proPrice = parseFloat(this.unitPrice);

		if(pricing.type==1){

			oPrice = (proPrice*100)/(100+pricing.value);

		}else{

			oPrice = proPrice - parseFloat(pricing.value);

		}

		var bulkArr = this.getExpressBulkPricing();

		for(i=0;i<bulkArr.length;i++){

			var bulk = bulkArr[i];

			if(totalQuantity >= parseInt(bulk.from_qty) && totalQuantity <= parseInt(bulk.to_qty)){

				if(bulk.type==1){

					proPrice = totalQuantity * (oPrice + (oPrice * bulk.value/100));

				}else{

					proPrice = totalQuantity(oPrice + bulk.value);

				}

				proPrice = parseFloat(proPrice);
				proPrice = proPrice.toFixed(2);

				break;
			}
		}
		// console.log(proPrice);
		return this.price = proPrice;

	}

	product.prototype.setIncartSetting = function(product){

		var isInCart = alcoholCart.getProductById(product._id);

		this.qChilled = 0;
		this.qNChilled = 0;

		this.servechilled=this.chilled;

		if(isInCart!==false){

			this.isInCart = true;
			this.qChilled = isInCart.getRQuantity('chilled');
			this.qNChilled = isInCart.getRQuantity('nonchilled');
			this.servechilled = isInCart.getLastServedAs();

		}else{

			if(this.chilled){
				this.qChilled = 1;
			}else{
				this.qNChilled = 1;
			}


		}

		this.maxQuantity = this.quantity;

		var available = this.maxQuantity-this.qNChilled+this.qChilled;

		if(available<0){

			this.overQunatity = true;
			this.qNChilled = this.qNChilled + available;

		}

		var available = this.maxQuantity-this.qNChilled+this.qChilled;

		if(available<0){

			this.qChilled = this.qChilled + available;

		}

		this.totalQuantity = parseInt(this.qChilled) + parseInt(this.qNChilled);

	}

	product.prototype.addToCart = function(){

		alcoholCart.addProduct(this._id, { chilled: this.qChilled, nonChilled: this.qNChilled },true);

	}

	return product;

}])

.factory('AlcoholProduct',[
			'$rootScope','$state','$filter','$log','$timeout','$q','categoriesService','alcoholCart',
	function($rootScope,$state,$filter, $log, $timeout, $q, catPricing, alcoholCart){

	var product = function(product){
	
		this._id = mongoIdToStr(product._id);
	
		this.setPricingParams(
			product.categories,
			product.express_delivery_bulk,
			product.regular_express_delivery
		);

		if(angular.isDefined(product.nameSales) && angular.isArray(product.nameSales) && product.nameSales.length){
			this.setNameSale(product);
		}

		if(angular.isDefined(product.proSales) && angular.isObject(product.proSales)){
			this.setSale(product);
		}

		this.setSettings(product);

		this.setPrice(product); // must before setAddBtnState

		this.setAddBtnState(product);

		if(this.error === true){
			return false;
		}

		this.setDefaults(product);

		if(product.wishlist){
		//if wishlist product passed
			this.wishlist = product.wishlist;
		}
		//this.setDetailLink();

	}

	

	product.prototype.setSettings = function(p){

		var isInCart = alcoholCart.getProductById(this._id);

		this.isInCart = false;
		this.servechilled=p.chilled;
		this.qChilled = 0;
		this.qNChilled = 0;

		if(isInCart!==false){

			this.isInCart = true;
			this.servechilled = isInCart.getLastServedAs();
			this.qChilled = isInCart.getRQuantity('chilled');
			this.qNChilled = isInCart.getRQuantity('nonchilled');

		}

		this.tquantity = this.qChilled + this.qNChilled;

	}

	product.prototype.setNameSale = function(p){

		var nameSale = p.nameSales.pop();

		this.nameSale = nameSale.listingTitle;
		this.nameDetailSale = nameSale.detailTitle;

		if(angular.isDefined(nameSale.coverImage))
			this.saleImage = nameSale.coverImage.source;

	}

	product.prototype.setSale = function(p){

		var pSale = p.proSales;

		this.sale = {
			quantity : pSale.conditionQuantity,
			type : pSale.actionType,
			title : pSale.listingTitle,
			detailTitle : pSale.detailTitle,
			actionProductId:pSale.actionProductId,
			imageLink:pSale.imageLink			
		};

		this.sale.isSingle = (pSale.conditionQuantity==1 && pSale.actionProductId.length==0)?true:false;

		if(angular.isDefined(pSale.coverImage))
			this.sale.coverImage = pSale.coverImage.source;

		if(pSale.actionType==2){
			this.sale.discount = {
				value : pSale.discountValue,
				type : pSale.discountType
			}
		}

		if(pSale.actionType==1){
			this.sale.discount = {
				quantity : pSale.giftQuantity
			}
		}

		var saleProduct = "";

		if(angular.isDefined(pSale.saleProduct) && pSale.saleProduct.length){
			saleProduct = pSale.saleProduct.pop();
		}else{
			saleProduct = p;
		}

		this.sale.discount.product = {
			name : saleProduct.name,
			imageFiles : saleProduct.imageFiles,
			slug : saleProduct.slug
		}

	}

	/**
	*	function to get total quantity is set for current product object
	*	return SUM of chilled and non chilled quantity
	**/
	product.prototype.getTotalQty = function(){
		return parseInt(this.qChilled) + parseInt(this.qNChilled);
	}

	product.prototype.getTotalQtyInCart = function(){

		var isInCart = alcoholCart.getProductById(this._id);

		if(isInCart!==false)
		return isInCart.getRQuantity('chilled') + isInCart.getRQuantity('nonchilled');

		return 0;

	}

	product.prototype.setAddBtnState = function(p){

		if( typeof p === 'undefined' ){
			var p = this;
		}

		var productAvailQty = parseInt(p.quantity);

		this.addBtnAllowed = true;

		if(productAvailQty<1){

			if(p.outOfStockType===1){

				this.addBtnAllowed = false;

			}

		}

		switch(this.type){

			case 1:{

				var notSufficient = false;

				var userData = UserService.getIfUser();

				if(userData!==false){

					var userloyaltyPoints = userData.loyaltyPoints || 0;

					var pointsInCart = alcoholCart.getLoyaltyPointsInCart();				  				   

					var userloyaltyPointsDue = userloyaltyPoints - pointsInCart;

					var point = parseFloat(userloyaltyPointsDue);

					var pointsRequired = this.loyaltyValue.point;

					if(point < pointsRequired && !this.isInCart){
						notSufficient = true;
					}
				}

				this.notSufficient = notSufficient;

			}
			break;
		}

	}

	product.prototype.setDetailLink = function(){

		var href = "javascript:void(0)";
		switch(this.type){

			case 1:{
				href = mainLayout.product({product:productInfo.slug})
			}
			break;
			case 1:{

			}
			break;

		}

		this.href = href;

		return href;

	}

	product.prototype.setPricingParams = function(categories,bulkPricing,singlePricing){

		var categoryKey = [];
		var catData = [];
		angular.copy(categories,categoryKey);

		categoryKey = categoryKey.pop();
		catData = catPricing.categoryPricing[categoryKey];

		if(typeof catData==='undefined'){
			this.error = true;
			return false;
		}

		if(typeof bulkPricing === 'undefined'){
			this.bulkPricing = catData.express_delivery_bulk.bulk
		}else{
			this.bulkPricing = bulkPricing.bulk;
		}

		if(typeof singlePricing === 'undefined'){
			this.singlePricing = catData.regular_express_delivery
		}else{
			this.singlePricing = singlePricing;
		}

	}

	product.prototype.setPrice = function(p){

		var _product = this;

		if (p.price){

			var basePrice = parseFloat(p.price)/1;
			var unitPrice = basePrice;

			var singlePricing = this.singlePricing;
			singlePricing.type = parseInt(singlePricing.type);

			if(singlePricing.type===1){

				unitPrice +=  parseFloat(basePrice * singlePricing.value/100);

			}else{

				unitPrice += parseFloat(singlePricing.value);

			}

			this.unitPrice = parseFloat(unitPrice.toFixed(2));

			var bulkArr = this.bulkPricing;
			var quantity = this.getTotalQty();
			var price = unitPrice;

			this.discountedUnitPrice = price/quantity;

			this.price = price;
			
			this.bulkApplicable = false;

			if(this.sale && this.sale.isSingle){

				if(this.sale.discount.type == 1){//FIXED AMOUNT SALE
					this.price = this.price - this.sale.discount.value;
				}
				if(this.sale.discount.type == 2){//% AMOUNT SALE
					this.price = this.price - (this.price * this.sale.discount.value/100);
				}
				this.price = this.price.toFixed(2);

			}else{

				//CHECK IF BULK IS ENABLE FOR THE PRODUCT
				if(this.bulkDisable == 0){
					
					this.bulkApplicable = true;
					
					angular.forEach(bulkArr, function(bulk,key){

					if(bulk.type==1){
						bulk.price = basePrice + (basePrice * bulk.value/100);
					}else{
						bulk.price = basePrice + bulk.value;
					}

					bulk.price = bulk.price.toFixed(2);

				})
				}

			}

		}
		else {
			$log.error('Each Product Required Price');
		}
	

	};

	product.prototype.getCurrentUnitPrice = function () {

		var price = this.price;

		if(this.bulkApplicable){

			var qty = this.getTotalQty();
			var bulkArr = this.bulkPricing;

			angular.forEach(bulkArr, function(bulk){

				if(qty>=bulk.from_qty && qty<=bulk.to_qty){

					price = bulk.price;
				}

			})
		}
		return price.toFixed(2);

	}

	product.prototype.setDefaults = function(p){

		this.availabilityDays = p.availabilityDays;
		this.availabilityTime = p.availabilityTime;
		this.categories = p.categories;
		this.chilled = p.chilled;
		this.description = p.description;
		this.imageFiles = p.imageFiles;
		this.name = p.name;
		this.outOfStockType = p.outOfStockType;
		this.quantity = p.quantity;
		this.shortDescription = p.shortDescription;
		this.sku = p.sku;
		this.slug = p.slug;

		this.isLoyalty = p.isLoyalty;
		this.loyaltyValueType = p.loyaltyValueType;
		this.loyaltyValuePoint = p.loyaltyValuePoint;
		this.loyaltyValuePrice = p.loyaltyValuePrice;
		this.loyalty = p.loyalty;
		this.loyaltyType = p.loyaltyType;
		
		this.metaTitle = p.metaTitle;
		this.metaDescription = p.metaDescription;
		this.metaKeywords = p.metaKeywords;

	}

	product.prototype.addToCart = function() {

		var _product = this;

		var defer = $q.defer();

		if(typeof _product.proUpdateTimeOut!=="undefined"){

			$timeout.cancel(_product.proUpdateTimeOut);

		}

		_product.proUpdateTimeOut = $timeout(function(){

			var quantity = {
					chilled : parseInt(_product.qChilled),
					nonChilled : parseInt(_product.qNChilled)
				}

			alcoholCart.addProduct(_product._id,quantity,_product.servechilled).then(

				function(successRes){

					if(successRes.success){

						switch(successRes.code){
							case 100:

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

						if(_product.isInCart===false){
							_product.isInCart = alcoholCart.getProductById(_product._id);
						}


					}

				},
				function(errorRes){
					//
				}

			);
		

			if(_product.quantitycustom==0){
				$scope.isInCart = false;
				$scope.addMoreCustom = false;
				this.quantitycustom = 1;
			}

		},1500)

		return defer.promise;
		};

	product.prototype.hrefDetail = function(){
		$state.go('mainLayout.product', {'product': this.slug});
	};

	product.prototype.setParentDetail = function(p){
		this.parentCategory = p;
	};

	product.prototype.setChildDetail = function(p){
		this.childCategory = p;
	};

	product.prototype.getLoyaltyValue = function(){
		var lv = parseFloat(this.loyalty);
		if(this.loyaltyType == 0){
			lv = parseFloat(this.price) * parseFloat(this.loyalty)/100;
		}
		return lv.toFixed(2);
	};



	return product;

}])

.factory('cartSale', ['$log', function ($log){

	var saleObj = function (sale,detail) {

		this.setParams(sale);

		this.setSaleDetail(detail);

		this.setPrices(detail);

		this.setProductsQtyArr();

	}

	saleObj.prototype.setParams = function(sale){

		_self = this;

		angular.forEach(sale, function (value,key) {
			_self[key] = value;
		});

	};


	saleObj.prototype.setSaleDetail = function(detail){

		this.title = {
			small : detail.listingTitle,
			long : detail.detailTitle
		}

	};

	saleObj.prototype.setProductsQtyArr = function(){

		angular.forEach(this.products, function (pro) {
			
			pro.productQtyArr = new Array();

			for (i = 0; i < pro.quantity; i++) { 
				pro.productQtyArr.push(i)
			}
			
			
		});

		angular.forEach(this.action, function (pro) {

			pro.productQtyArr = new Array();

			for (i = 0; i < pro.quantity; i++) { 
				pro.productQtyArr.push(i)
			}

		});

	}

	saleObj.prototype.setPrices = function(detail){
		
		var price = 0;
		var actionProPrice = 0;

		angular.forEach(this.products, function (pro) {

			price = price + (parseFloat(pro.product.price) * pro.quantity);

		});

		angular.forEach(this.action, function (pro) {

			var tempP = parseFloat(pro.product.price) * pro.quantity;
			actionProPrice+= tempP;
			price+= tempP

		});

		strikePrice = price.toFixed(2);

		this.strikePrice = strikePrice;

		var currPrice = 0;

		if(detail.actionType == 1){

			 var qty = detail.giftQuantity;
			 currPrice = parseFloat(price) - parseFloat(actionProPrice);
			 
		}else{

			if(detail.discountType==1){

				if(detail.actionProductId.length>0){

					currPrice = price - detail.discountValue;
					//currPrice = price - currPrice;

				}else{

					currPrice = price - detail.discountValue;

				}


			}else{

				if(detail.actionProductId.length>0){

					currPrice = price - (actionProPrice * detail.discountValue / 100);

				}else{

					currPrice = price - (price * detail.discountValue / 100);

				}

			}

		}
		this.totalDiscount = (parseFloat(price) - parseFloat(currPrice)).toFixed(2);
		this.price = currPrice.toFixed(2);

		

	};

	saleObj.prototype.getPrice = function(){
		return parseFloat(this.price);
	}

	saleObj.prototype.getId = function(){
		return this._id;
	};



	return saleObj;

}]);