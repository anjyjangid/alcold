<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use AlcoholDelivery\User as User;

use AlcoholDelivery\Setting as Setting;

use DB;

use MongoId;

use MongoDate;

class Loyalty extends Model
{
	public function getLoyalty($userId,$params = []){

		$offset = (int)$params['start'];

		$limit = isset($params['limit'])?(int)$params['limit']:10;

		$loyalty = DB::collection('user')->where('_id', $userId)->project(['loyalty' => array('$slice' => [$offset,$limit])]);
	
		$loyalty = $loyalty->first(['loyalty']);		

		return $loyalty['loyalty'];

	}

	public function getLoyaltyStatics($userId){

		$statics = DB::collection('user')->raw(function($collection) use($userId){

			return $collection->aggregate(array(
				array(
					'$match' => array(
						'_id' => new MongoId($userId)
					)
				),				
				array(
					
					'$unwind' => '$loyalty'

				),
				array(

					'$group' => array(

						'_id' => '$loyalty.type',

						'credit' => array(
							
							'$sum' => '$loyalty.points',

						),
						'points' => array(

							'$last'=>'$loyalty.points'

						),
						'count' => array(

							'$sum'=>1

						)

					)

				),
				// array(
				// 		'$sort' => array('loyalty.on'=>-1)
				// ),
				// array(
				// 		'$skip' => 0
				// ),				
				// array(
				// 		'$limit' => 1
				// )
			));
		});

		if(isset($statics['result'])){
			return $statics['result'][0];
		}
		
		return $statics;

	}

	public function setUserLoyalty($userId,$params){

		$isAlreadyGet = $this->isLoyaltyAlreadyGet($userId,$params);

		if(!empty($isAlreadyGet)){
			return (object)["success"=>false,'message'=>"Points already given"];
		}
		
		$append = [];

		$points = Setting::where("_id","loyalty")->first(['settings.order_sharing.value','settings.site_sharing.value']);

		switch($params['type']){

			case 'order':

				$pointsEarned = $points['settings']['order_sharing']['value'];
				
				$append = [

						"type"=>"credit",
						"points"=>(float)$pointsEarned,
						"reason"=>[
							"type"=>"order",
							"action"=> $params['for'],
							"actionOn"=> $params['on'],
							"key" => $params['key'],
							"comment"=> "You have earned this points by sharing your order on social network"
						],
						"on"=>new MongoDate(strtotime(date("Y-m-d H:i:s")))
					];

			break;

			case 'general':

			break;
		}

		try{


			$isUpdated = User::where('_id', $userId)->increment('loyaltyPoints', (float)$pointsEarned);
			$isUpdated = User::where('_id', $userId)->push('loyalty', $append);

			return (object)["success"=>true];

		} catch(\Exception $e){

			return (object)["success"=>false,"message"=>$e->getMessage()];

		}

	}

	public function isLoyaltyAlreadyGet($userId,$params){

		$isExist = [];

		switch($params['type']){

			case 'order':
				$isExist = User::where("_id",$userId)->where("loyalty.type","credit")
				                                     ->where("loyalty.reason.type","order")
	                                                 ->where("loyalty.reason.action",$params['for'])
	                                                 ->where("loyalty.reason.actionOn",$params['on'])
				                                     ->where("loyalty.reason.key",$params['key'])
				                                     ->first();
			break;

			case 'general':

			break;
		}
		
		return $isExist;

	}
	
}