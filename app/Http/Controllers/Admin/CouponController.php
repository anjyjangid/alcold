<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\CouponRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use MongoId;
use Storage;
use Validator;

use AlcoholDelivery\Coupon as Coupon;
use AlcoholDelivery\Products as Products;

class CouponController extends Controller
{

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		
	}
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{
		
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
	public function store(CouponRequest $request)
	{

		$inputs = $request->formatCols(['code', 'name', 'type', 'discount', 'total', 'coupon_uses', 'customer_uses', 'start_date', 'end_date', 'status', 'products', 'categories', 'discount_status']);

		try {

			$inputs['used_count'] = 0;
			$inputs['used_list'] = [];
			
			Coupon::create($inputs);

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()),400);

		}
		
		return response(array("success"=>true,"message"=>"Coupon created successfully"),200);
		
		
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function show($id)
	{

		$result = Coupon::where("_id",$id)->first();

		return response($result, 201);

	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function getDetail($id)
	{

		$result = Coupon::raw()->aggregate([
			[
				'$match' => [ '_id' => new MongoId($id) ]
			], [
				'$unwind' => [
					'path' => '$products',
					'preserveNullAndEmptyArrays' => true
				]
			], [
				'$lookup' => [
					'from'=>'products',
					'localField'=>'products',
					'foreignField'=>'_id',
					'as'=>'saleProductDetail'
				]
			], [
				'$unwind' => [
					'path' => '$saleProductDetail',
					'preserveNullAndEmptyArrays' => true
				]
			], [
				'$group' => [
					'_id' => '$_id',
					'code' => ['$first' => '$code'],
					'name' => ['$first' => '$name'],
					'type' => ['$first' => '$type'],
					'discount' => ['$first' => '$discount'],
					'discount_status' => ['$first' => '$discount_status'],
					'total' => ['$first' => '$total'],
					'coupon_uses' => ['$first' => '$coupon_uses'],
					'customer_uses' => ['$first' => '$customer_uses'],
					'start_date' => ['$first' => '$start_date'],
					'end_date' => ['$first' => '$end_date'],
					'status' => ['$first' => '$status'],
					'csvImport' => ['$first' => '$csvImport'],
					'categories' => ['$first' => '$categories'],
					'saleProductDetail' => [
						'$push' => [
							'_id' => '$saleProductDetail._id',
							'name' => '$saleProductDetail.name',
							'imageFiles' => '$saleProductDetail.imageFiles',
						]
					]
				]
			], [
				'$unwind' => [
					'path' => '$categories',
					'preserveNullAndEmptyArrays' => true
				]
			], [
				'$lookup' => [
					'from'=>'categories',
					'localField'=>'categories',
					'foreignField'=>'_id',
					'as'=>'saleCategoryDetail'
				]
			], [
				'$unwind' => [
					'path' => '$saleCategoryDetail',
					'preserveNullAndEmptyArrays' => true
				]
			], [
				'$group' => [
					'_id' => '$_id',
					'code' => ['$first' => '$code'],
					'name' => ['$first' => '$name'],
					'type' => ['$first' => '$type'],
					'discount' => ['$first' => '$discount'],
					'discount_status' => ['$first' => '$discount_status'],
					'total' => ['$first' => '$total'],
					'coupon_uses' => ['$first' => '$coupon_uses'],
					'customer_uses' => ['$first' => '$customer_uses'],
					'start_date' => ['$first' => '$start_date'],
					'end_date' => ['$first' => '$end_date'],
					'status' => ['$first' => '$status'],
					'csvImport' => ['$first' => '$csvImport'],
					'saleProductDetail' => ['$first' => '$saleProductDetail'],
					'saleCategoryDetail' => [
						'$push' => [
							'_id' => '$saleCategoryDetail._id',
							'cat_title' => '$saleCategoryDetail.cat_title',
							'ancestors' => '$saleCategoryDetail.ancestors',
						]
					]
				]
			],
			[
				'$lookup' => [
					'from' => "orders",
					'localField' => 'code',
					'foreignField' => 'coupon.code',
					'as' => 'orders'
				]
			],
			[
				'$project' => [
					'_id' => 1,
					'code' => 1,
					'name' => 1,
					'type' => 1,
					'discount' => 1,
					'discount_status' => 1,
					'total' => 1,
					'coupon_uses' => 1,
					'customer_uses' => 1,
					'start_date' => 1,
					'end_date' => 1,
					'status' => 1,
					'csvImport' => 1,
					'saleProductDetail' => 1,
					'saleCategoryDetail' => 1,
					'orders' => [
						'_id'=> 1,
						'reference'=> 1,
						'totalDiscount' => '$orders.coupon.totalDiscount',
						'date' => '$created_at'
					]
				]
			]
		]);

        if($result['ok'] != 1 || !isset($result['result'][0]))
        	return response('Coupon not found', 422);

        $result = $result['result'][0];

        if(count($result['saleProductDetail'])==1 && empty($result['saleProductDetail'][0]))
        	unset($result['saleProductDetail']);
        if(count($result['saleCategoryDetail'])==1 && empty($result['saleCategoryDetail'][0]))
        	unset($result['saleCategoryDetail']);

		if(!empty($result['saleCategoryDetail']))
			foreach ($result['saleCategoryDetail'] as &$category) {
				$category['name'] = $category['cat_title'];
				if(isset($category['ancestors'])){
					$category['name'] = $category['ancestors'][0]['title'].' > '.$category['cat_title'];
				}

				unset($category['ancestors']);
				unset($category['cat_title']);
			}
		// $coupon = new coupon;
		// $result = $coupon->getCoupon($id);

		return response($result, 201);

	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function update(CouponRequest $request, $id)
	{   

		$coupon = Coupon::find($id);

		if(is_null($coupon)){

			return response(array("success"=>false,"message"=>"Invalid Request :: Record you want to update does not exist"));

		}

		$inputs = $request->formatCols(['code', 'name', 'type', 'discount', 'total', 'coupon_uses', 'customer_uses', 'start_date', 'end_date', 'status', 'products', 'categories', 'discount_status']);

		foreach ($inputs as $col => $value) {
			$coupon[$col] = $value;
		}

		try {

			$coupon->save();

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()),400);

		}
		
		return response(array("success"=>true,"message"=>"Coupon Updated successfully"));

	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($ids)
	{
		$keys = explode(",", $ids);
		
		try {

			$coupons = Coupon::whereIn('_id', $keys)->delete();

		} catch(\Illuminate\Database\QueryException $e){

			return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));

		}

		return response(array($coupons,"success"=>true,"message"=>"Record(s) Removed Successfully"));
	}

	public function postImport(Request $request){
		$params = $request->all();

		try {

			$handle = fopen($params['csv']->getRealPath(), "r");

			$skipLines = 2;

			if ($handle) {
				$inputs = [];
				$coupons = [];
				$i = 0;
				while (($line = fgets($handle)) !== false) {
					$i++;
					if($skipLines){
						$skipLines--;
						continue;
					}

					$line = explode(',', $line);

					$line[0] = strtoupper($line[0]);

					$input = [
						'code'=>$line[0],
						'name'=>$line[1],
						'type'=>$line[2]=='$'?1:0,
						'discount'=>(float)$line[3],
						'total'=>(int)$line[4],
						'customer_uses'=>(int)$line[5],
						'coupon_uses'=>(int)$line[6],
						'start_date'=>$line[7],
						'end_date'=>$line[8],
						'status'=>$line[9]=='0'?0:1,
						'discount_status'=>$line[10]=='0'?0:1,
						'csvImport'=>true,
						'used_count' => 0
					];

					$coupons[] = $line[0];

					$req = new CouponRequest($input);

					$validator = Validator::make($req->all(), $req->rules(), $req->messages());

					if ($validator->fails()){
						$err = ['err' => $validator->errors()->all()];
						$err['row_number'] = $i;
						$err['data'] = $input;
						return response($err, 422);
					}

					$inputs[] = $req->formatCols();
				}

				if(count($coupons) != count(array_unique($coupons)))
					return response("There are multiple entries with same coupon code in the CSV file!", 400);

				try {
					$resp =  \DB::collection('coupons')->insert($inputs);

					if($resp)
						return response("Coupons imported successfully", 200);
					else
						return response("Error saving data!", 400);

				} catch(\Exception $e){
					return response($e->getMessage(),400);
				}

				fclose($handle);
			} else {
				return response("Error reading file!", 400);
			}
		
		} catch(\Exception $e){
			return response("Error reading file. Please upload a csv file.", 400);
		}	

	}

	public function postListing(Request $request,$id = false)
	{
		$params = $request->all();

        extract($params);

        $columns = ['_id','_id','smallTitle','discount','type','used_count','status'];

        $project = ['image'=>1,'code'=>1,'discount'=>1,'type'=>1,'used_count'=>1,'status'=>1,'updated_at' => 1];

        $project['smallTitle'] = ['$toLower' => '$code'];

        $query = [];
        
        $query[]['$project'] = $project;

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;        

        $model = Coupon::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Coupon::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
        ];

        return response($response,200);		
		
	}


}
