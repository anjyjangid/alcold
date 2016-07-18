MetronicApp.service('alcoholCart',['$http', '$q', 'alcoholCartProduct', 'alcoholCartPackage',function($http, $q, alcoholCartProduct, alcoholCartPackage){

	this.init = function(){

		this.$cart = {

			products : {},
			packages : [],			
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

	this.addProduct = function (id, quantity, serveAs) {

		var defer = $q.defer();

		var inCart = this.getProductById(id);
		var _self = this;
		var deliveryKey = _self.getCartKey();

		$http.put("/cart/"+deliveryKey, {
				"id":id,
				"quantity":quantity,
				"chilled":serveAs,
				"type":"product",
			},{

		}).error(function(data, status, headers) {

			defer.reject(data);

		}).success(function(response) {

			if(response.success){

				var resProduct = response.product;

				if(inCart){				

					if(resProduct.quantity==0){

						_self.removeItemById(id);

					}else{

						inCart.setRQuantity(resProduct.chilled.quantity,resProduct.nonchilled.quantity);
						inCart.setTQuantity(resProduct.quantity);
						inCart.setPrice(resProduct);

						inCart.setRMaxQuantity(resProduct);

					}									

				}else{				
					
		    		var newItem = new alcoholCartProduct(id, resProduct);
					_self.$cart.products[id] = newItem;
					
				}
				
			}

			defer.resolve(response);

		});

		return defer.promise
	};

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

	this.getProducts = function(){
		return this.getCart().products;
	};

	this.getPackages = function(){
		return this.getCart().packages;
	};

	this.getPromotions = function(){
		return this.getCart().promotions;
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

	this.$restore = function(storedCart){
		console.log(angular.copy(storedCart));
			var _self = this;

			_self.init();					

			if(typeof storedCart.products !== 'undefined'){

				angular.forEach(storedCart.products, function (item,key) {

					var newItem = new alcoholCartProduct(key, item);
					_self.$cart.products[key] = newItem;
					
				});

				delete storedCart.products;

			}

			// angular.forEach(packages, function (package,key) {

			// 	var newPackage = new alcoholCartPackage(package._id,package._unique,package);
			// 	_self.$cart.packages.push(newPackage);
				
			// });

			_self.$cart._id = storedCart._id;
			
		};

}])


.factory('alcoholCartProduct', ['$rootScope', '$log', function ($rootScope, $log){
		
		var product = function (id, data) {		

			this.setId(id);
			this.setRQuantity(data.chilled.quantity,data.nonchilled.quantity);			

			this.setRChilledStatus(data.chilled.status,data.nonchilled.status);
			this.setTQuantity(data.quantity);
			this.setPrice(data);			
			this.setLastServedAs(data.lastServedChilled);
			this.setProduct(data);

			this.setRMaxQuantity(data.product);

		};

		product.prototype.setId = function(id){
			if (id)  this._id = id;
			else {
				$log.error('An ID must be provided');
			}
		};

		product.prototype.getId = function(){
			return this._id;
		};

		product.prototype.setLastServedAs = function(servedAs){
			return this.servedAs = servedAs;
		}

		product.prototype.getLastServedAs = function(){
			return this.servedAs;
		}

		product.prototype.setName = function(name){
			if (name)  this._name = name;
			else {
				$log.error('A name must be provided');
			}
		};
		product.prototype.getName = function(){
			return this._name;
		};

		product.prototype.setPrice = function(product){

			var original = product.product;

			var originalPrice = parseFloat(original.price);

			var unitPrice = originalPrice;

			var quantity = this.getQuantity();

			var advancePricing = original.regular_express_delivery;
			
			if(advancePricing.type==1){

				unitPrice +=  parseFloat(originalPrice * advancePricing.value/100);

			}else{

				unitPrice += parseFloat(advancePricing.value);
				
			}

			price = unitPrice;
			price = parseFloat(price.toFixed(2));

			this.unitPrice = price;

			var bulkArr = original.express_delivery_bulk.bulk;

			for(i=0;i<bulkArr.length;i++){

				var bulk = bulkArr[i];

				if(quantity >= bulk.from_qty && quantity<=bulk.to_qty){

					if(bulk.type==1){

						price = quantity * (originalPrice + (originalPrice * bulk.value/100));

					}else{

						price = quantity * (originalPrice + bulk.value);

					}
					
					price = parseFloat(price.toFixed(2));
				}

			}

			this.discountedUnitPrice = price/quantity;
			
			return this.price = price;
			
		};

		product.prototype.getPrice = function(){
			return parseFloat(this.price);
		};

		product.prototype.setRQuantity = function(cQuantity,ncQuantity){
			this.qChilled = cQuantity;
			this.qNChilled = ncQuantity
		}

		product.prototype.setRMaxQuantity = function(product){

			if(product.quantity==0 && product.outOfStockType==2){
				product.quantity = product.maxQuantity;
			}
			
			this.qChilledMax = product.maxQuantity - this.qNChilled;
			this.qNChilledMax = product.maxQuantity - this.qChilled;

		}

		product.prototype.setRChilledStatus = function(cLastStatus,ncLastStatus){

			var status = {
					"chilled":true,
					"nonchilled":false
				}

			this.qChilledStatus = status[cLastStatus];
			this.qNChilledStatus = status[ncLastStatus];		

		}

		product.prototype.getRQuantity = function(type){

			if(type=='chilled'){
				return this.qChilled;
			}

			return this.qNChilled;
		}

		product.prototype.setTQuantity = function(quantity){

			var quantityInt = parseInt(quantity);
			return this.quantity = quantityInt;

		};

		product.prototype.getQuantity = function(){
			return this.quantity;
		};

		product.prototype.setProduct = function(data){

			this.onlyForAdvance = false;
			if(data.product.quantity==0 && data.product.outOfStockType==2){

				this.onlyForAdvance = true;
			}		

			if (data.product) this.product = data.product;
		};

		product.prototype.setNonAvailability = function(status){
			return this.isNotAvailable = Boolean(status);
		}

		product.prototype.getData = function(){
			if (this.product) return this.product;
			else $log.info('This product has no product detail');
		};

		product.prototype.getTotal = function(){
			return +parseFloat(this.getPrice()).toFixed(2);
		};

		product.prototype.toObject = function() {
			return {
				id: this.getId(),
				name: this.getName(),
				price: this.getPrice(),
				quantity: this.getQuantity(),
				data: this.getData(),
				total: this.getTotal()
			}
		};

		return product;

	}])

.factory('alcoholCartPackage', ['$rootScope', '$log', function ($rootScope, $log){

		var package = function (id, uniqueId, data) {

			this.setId(id);		
			this.setUniqueId(uniqueId);
			this.setName(data.title);
			this.setQuantity(data.packageQuantity);
			this.setPrice(data.packagePrice);
			this.setOriginal(data);

		};

		package.prototype.setId = function(id){
			if (id)  this._id = id;
			else {
				$log.error('An ID must be provided');
			}
		};

		package.prototype.getId = function(){
			return this._id;
		};

		package.prototype.setUniqueId = function(uniqueId){
			if (uniqueId){
				this._uniqueId = uniqueId;				
			}
			else {
				$log.error('An Unique Id must be provided');
			}
		};

		package.prototype.getUniqueId = function(){
			return this._uniqueId;
		};
		
		package.prototype.setName = function(name){
			if (name)  this._name = name;
			else {
				$log.error('A name must be provided');
			}
		};
		package.prototype.getName = function(){
			return this._name;
		};		
		
		package.prototype.setOriginal = function(data){
			if (data) {
				this.original = data;
				this.original.unique = this.getUniqueId();
			}
		};

		package.prototype.getOriginal = function(){
			if (this.original) return this.original;
			else $log.info('This package has no original detail');
		};
		
		package.prototype.setQuantity = function(quantity){
			this._maxquantity = 100;
			if (quantity) this._quantity = parseInt(quantity);

		};

		package.prototype.getQuantity = function(){
			if (this._quantity) return parseInt(this._quantity);
			else $log.info('This package quantity has some issue');
		};

		package.prototype.setPrice = function(price){

			var unitPrice = parseFloat(price);

			var quantity = this.getQuantity();
							
			price = quantity * unitPrice;
			price = parseFloat(price.toFixed(2));
					
			return this._price = price;	
			
		};

		package.prototype.getPrice = function(){
			return parseFloat(this._price);
		};

		package.prototype.getTotal = function(){
			return +parseFloat(this.getPrice()).toFixed(2);
		};

		return package;

	}])

.service('alcoholStore', ['$http', 'alcoholCart', '$q', 'sweetAlert', function ($http, alcoholCart, $q, sweetAlert) {

	return {

		init : function (){

			return $q(function(resolve,reject){

				$http.get("/adminapi/order").success(function(response){

					if(!response.isUnprocessed){

						alcoholCart.$restore(response.cart);
						resolve();

					}else{

						sweetAlert.swal({

							title: "There is a un-processed cart ?",
							text: "Do want to continue with them!",
							type: "warning",
							showCancelButton: true,   
							confirmButtonColor: "#DD6B55",   
							confirmButtonText: "Yes, i want to continue !",
							closeOnConfirm: false,
							closeOnCancel: false

						}).then(

							function(isConfirm) {

								if (isConfirm) {

									alcoholCart.$restore(response.cart);
									resolve();

								} else {

									$http.get("/adminapi/order/newcart").success(function(newCartRes){
										alcoholCart.$restore(newCartRes.cart);
										resolve();
									})

								}
							}
						);

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

		$http.get("/super/category").success(function(response){
						
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
		
		var originalPrice = parseFloat(product.price);

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
		console.log(proPrice);
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

		alcoholCart.addProduct(this._id,this.qChilled,true);
		alcoholCart.addProduct(this._id,this.qNChilled,false);

	}

	return product;

}]);