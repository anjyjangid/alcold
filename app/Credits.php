<?php

namespace AlcoholDelivery;

use Moloquent;

use AlcoholDelivery\User;

use AlcoholDelivery\Setting;

use DB;

use MongoId;

use MongoDate;

class Credits extends Moloquent	
{
	public function getCredits($userId,$params = []){

		$count = DB::collection('user')->raw(function($collection) use($userId){

				return $collection->aggregate(array(
					array(
						'$match' => array(
							'_id' => $userId
						)
					),
					array(
						'$project' => array(							
							'count' => array(
								'$size' => '$creditSummary'
							)
						)
					)
				));
			});



		$offset = (int)$params['start'];

		$limit = isset($params['limit'])?(int)$params['limit']:10;

		$credits = DB::collection('user')->where('_id', $userId)->project(['creditsSummary' => array('$slice' => [$offset,$limit])]);
	
		$credits = $credits->first(['creditsSummary']);

		return [
					"count" => $count['ok'],
					"credits" => @$credits['creditsSummary']
				];

	}

	public function getCredit($value){

		$response = [
			"success"=>false,
			"message"=>"",
			"card" => []
		];

		try{

			$card = DB::collection('giftcategories')->raw(function($collection) use ($value){
					return $collection->aggregate([
								[
									'$match' => [
										'type' => 'giftcard'
									]
								],
								[
									'$unwind' => '$cards'
								],
								[
									'$match' => [
													'cards.value' => ['$eq'=>$value]
												]
								],
								[
									'$project' => [
													'_id' => 0,
													'value' => '$cards.value',
													'loyalty' => '$cards.loyalty'
												]
								]
							]);
					});

			if(!empty($card['result'])){

				$response['success'] = true;
				$response['card'] = $card['result'][0];

			}

		}catch(\Exception $e){

			$response["message"]=$e->getMessage();

		}

		return (object)$response;

	}

	// public function getCreditsDetail($values){

	// 	$response = [
	// 		"success"=>false,
	// 		"message"=>"",
	// 		"card" => []
	// 	];

	// 	try{

	// 		$card = DB::collection('giftcategories')->raw(function($collection) use ($value){
	// 				return $collection->aggregate([
	// 							[
	// 								'$match' => [
	// 									'type' => 'giftcard'
	// 								]
	// 							],
	// 							[
	// 								'$unwind' => '$cards'
	// 							],
	// 							[
	// 								'$match' => [
	// 												'cards.value' => ['$in'=>$values]
	// 											]
	// 							],
	// 							[
	// 								'$project' => [
	// 												'_id' => 0,
	// 												'value' => '$cards.value',
	// 												'loyalty' => '$cards.loyalty'
	// 											]
	// 							]
	// 						]);
	// 				});

	// 		if(!empty($card['result'])){

	// 			$response['success'] = true;
	// 			$response['card'] = $card['result'];

	// 		}

	// 	}catch(\Exception $e){

	// 		$response["message"]=$e->getMessage();

	// 	}

	// 	return (object)$response;

	// }

	public function getCreditsStatics($userId){

		$statics = DB::collection('user')->raw(function($collection) use($userId){

			return $collection->aggregate(array(
				array(
					'$match' => array(
						'_id' => new MongoId($userId)
					)
				),				
				array(
					
					'$unwind' => '$creditsSummary'

				),
				array(

					'$group' => array(

						'_id' => '$creditsSummary.type',

						'credit' => array(
							
							'$sum' => '$creditsSummary.price',

						),
						'price' => array(

							'$last'=>'$creditsSummary.price'

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

		if(isset($statics['result'][0])){
			return $statics['result'][0];
		}
		
		return $statics;

	}

	
}
