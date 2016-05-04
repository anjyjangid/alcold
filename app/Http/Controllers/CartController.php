<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Cart as Cart;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Products as Products;

class CartController extends Controller
{
	
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request)
	{
		
		$cartKey = $request->session()->get('deliverykey', 'default');
		
		$cart = Cart::find($cartKey);

		if(empty($cart)){
			return response(array("success"=>false,"message"=>"something went wrong with cart"));
		}

		$productsIdInCart = array_keys($cart->bucket);

		$productObj = new Products;

		$productsInCart = $productObj->getProducts(
									array(
										"id"=>$productsIdInCart,
										"with"=>array(
											"discounts"
										)
									)
								);
		$cart = $cart->toArray();		
		foreach($productsInCart as $product){

			$cart['bucket'][$product['_id']]['product'] = $product;

		}

		return response($cart,200);

	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function create()
	{
		//
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(Request $request)
	{

		try {

			Brand::create($inputs);

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()));

		}
		
		return response(array("success"=>true,"message"=>"Brand created successfully"));
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function show($id)
	{
		prd("i am show action");
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function edit($id)
	{
		//
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function update(Request $request, $id)
	{        

		$inputs = $request->all();

		$cart = Cart::find($id);

		if(empty($cart)){
			return response(array("success"=>false,"message"=>"There is some issue with cart"));
		}

		$productObj = new Products;
		$product = $productObj->getProducts(
									array(
										"id"=>$inputs['id'],
										"with"=>array(
											"discounts"
										)
									)
								);

		$product = $product[0];

		// Condition to check quantity is not more than available quantity
		if((int)$inputs['quantity']>(int)$product['maxQuantity']){
			return response(array("success"=>false,"errorCode"=>"100","message"=>"Product quantity is not available","data"=>$product));
		}

		$cart->bucket = array_merge($cart->bucket,array($inputs['id']=>array(
				"name"=>$product['name'],
				"price"=>$product['price'],
				"quantity"=>(int)$inputs['quantity'],
				"maxQuantity"=>(int)$product['maxQuantity']
			)));

		if($cart->save()){
			return response(array("success"=>true,"message"=>"cart updated successfully","data"=>$product));
		}
		
		return response(array("success"=>false,"message"=>"Something went worng"));
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($id)
	{
		//
	}

	public function getDeliverykey(Request $request){

		
		$arr = [];
		$deliverykey = $request->session()->get('deliverykey');

		// if(!empty($deliverykey)){
		// 	$arr['deliverykey'] = $deliverykey;
		// 	return response($arr,200);
		// }

		$user = Auth::user('user');
        
        $cart = "";

        if(isset($user->_id)){
            
            $cart = Cart::where("user","=",$user->_id);

        }

        if(!isset($cart->_id)){
            
        	$cart = new Cart;			
			$cart->bucket = array();

			try {

	            $cart->save();
	            $arr['deliverykey'] = $cart->_id;

	        } catch(\Exception $e){

	            return response(array("success"=>false,"message"=>$e->getMessage()));

	        }

        }

        $arr['deliverykey'] = $cart->_id;

        $request->session()->put('deliverykey', $arr['deliverykey']);

        return response($arr,200);

    }


    public function missingMethod($parameters = array())
	{
	    prd($parameters);
	}
}
