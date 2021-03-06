<?php

use Illuminate\Database\Seeder;

class Setting extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        
        /*AlcoholDelivery\Setting::create([
            '_id' => 'timeslot',
            'settings' => [
                0 => [
                    [
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ]
                ],
                1 => [
                    [
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ]
                ],
                2 => [
                    [
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ]
                ],
                3 => [
                    [
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ]
                ],
                4 => [
                    [
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ]
                ],
                5 => [
                    [
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ]
                ],
                6 => [
                    [
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ],[
                        'from' => 0,
                        'to' => 30,
                        'orderlimit' => 10,
                        'status' => 1
                    ]
                ],
            ]
        ]);*/

        /*AlcoholDelivery\Setting::create([
            '_id' => 'pricing',            
            'settings' => [
                'express_delivery_bulk' => [
                    'label' => 'Bulk purchase (Regular express delivery)',
                    'bulk' => [
                        [
                            'from_qty' => 2,
                            'to_qty' => 5,
                            'value' => 0.15,
                            'type' => 1
                        ],
                        [
                            'from_qty' => 1,
                            'to_qty' => 10,
                            'value' => 0.12,
                            'type' => 1
                        ],
                        [
                            'from_qty' => 11,
                            'to_qty' => 99999,
                            'value' => 0.1,
                            'type' => 1
                        ]
                    ],
                    'category' => 'bulk_pricing'
                ],
                'express_delivery' => [
                    'label' => 'Express delivery (Order within 30mins)',
                    'value' => 50,
                    'type' => 0,
                    'category' => 'service'
                ],
                'cigratte_services' => [
                    'label' => 'Cigratte service',
                    'value' => 5,
                    'type' => 1,
                    'category' => 'service'
                ],
                'non_chilled_delivery' => [
                    'label' => 'Non-chilled delivery',
                    'value' => 1,
                    'type' => 0,
                    'category' => 'discount'
                ],
                'minimum_cart_value' => [
                    'label' => 'Minimum cart value',
                    'value' => 4000,
                    'category' => 'delivery'
                ],
                'non_free_delivery' => [
                    'label' => 'Delivery charge(If cart value is below minimum cart value)',
                    'value' => 10,
                    'category' => 'delivery'
                ],
                'regular_express_delivery' => [
                    'label' => 'Regular express delivery',
                    'value' => 0.5,
                    'type' => 1,
                    'category' => 'pricing'
                ]
                ,
                'gift_packaging' => [
                    'label' => 'Gift Packaging',
                    'value' => 0.5,
                    'type' => 1,
                    'category' => 'pricing'
                ]
            ],
        ]);
        */
        AlcoholDelivery\Setting::create([
            "_id" => "general",
            "settings" => [
                "site_name" => [
                    "title" => "Site Name",
                    "value" => "Alcohol Delivery"
                ],
                "site_title" => [
                    "title" => "Site Title",
                    "value" => "Alcoholdelivery - Online Alcohol Delivery - Buy Beer, Wine & Champagne in Singapore"
                ],
                "currency" => [
                    "title" => "Site Currency",
                    "value" => "$"
                ],
                "language" => [
                    "title" => "Default Language",
                    "value" => "eng"
                ],
                "meta_desc" => [
                    "title" => "Meta Description",
                    "value" => "Alcohol delivery online - Buy Alcohol, Liquor, Spirits, Whiskey, Scotch, Brandy, Beer, Wine Tequila, Gin & Rum online. Get free 1 hour delivery in Singapore."
                ],
                "meta_keyword" => [
                    "title" => "Meta Keyword",
                    "value" => "Alcohol delivery, alcohol delivery Singapore, buy spirits, alcohol   online, buy vodka, beer online, spirits online, buy beer, buy alcohol"
                ],
                "mode" => [
                    "title" => "Site Mode",
                    "value" => "test"
                ]
            ]   
        ]);

        /*AlcoholDelivery\Setting::create([
            '_id' => 'loyalty',
            'settings' => [
                'order_sharing' => [
                    'title' => 'Order Sharing',
                    'value' => '10.50'
                ],
                'site_sharing' => [
                    'title' => 'General website sharing',
                    'value' => '10'
                ],
                'point_value' => [
                    'title' => 'Loyalty Points Value',
                    'point' => 2,
                    'value' => '0.5'
                ]
            ],
        ]);*/


    }
}
