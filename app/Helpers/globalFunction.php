<?php
		
	function prd($arr){
		
		pr($arr);
		die;

	}

	function jprd($arr){

		pr(json_encode($arr));
		die;

	}

	function jpr($arr){

		pr(json_encode($arr));

	}

	function pr($arr){
		
		echo "<pre>";
		print_r($arr);
		echo "</pre>";

	}
	
	function getUserName($user){

		if(isset($user['name'])){
			
			return $user['name'];

		}else{

			return $user['email'];
			
		}

	}

	function valueToKey($array,$key){

		$newArray = [];
		foreach($array as $value){
			
			$newArray[(string)$value[$key]] = $value;
		}

		return $newArray;

	}

?>