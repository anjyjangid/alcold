<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class GiftCategory extends Eloquent
{
    protected $primaryKey = "_id";
    protected $foreignKey = "parent";
    protected $collection = 'giftcategories';

    protected $fillable = [
		'title',
        'subTitle',
        'description',
        'parent',
        'slug',
        'coverImage',
        'type',
        'cards',
        'gift_packaging',
        'status'        
    ];    

    public function ancestor() {
        return $this->belongsTo('AlcoholDelivery\GiftCategory', 'parent');
    }

    public function categoryproduct(){
        return $this->hasMany('AlcoholDelivery\Gift','category');
    }

    public function subcategoryproduct(){
        return $this->hasMany('AlcoholDelivery\Gift','subcategory');
    }   
    
}
