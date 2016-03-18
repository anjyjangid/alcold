<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use MongoId;
use Storage;
use Validator;
use Image;

use AlcoholDelivery\Categories as Categories;

class CategoryController extends Controller
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
    public function store(Request $request)
    {    
        $inputs = $request->all();
               
        // validation rules
        $validator = Validator::make($request->all(), [
            'title' => 'required',            
            'thumb' => 'required|mimes:jpeg,jpg,png|max:8000',
        ]);

        // if validation fails
        if ($validator->fails()) {
            return response('There are errors in the form data', 400);
        }
        
        
       	$fileUpload = $this->uploadThumb($request);

       	$category = new Categories;

       	if($inputs['ptitle']){

	       	$parentCategories = Categories::find($inputs['ptitle']);

	       	$ancestors = $parentCategories->ancestors;

	       	if(empty($ancestors)){
	       		$ancestors = [];
	       	}
	       	
	       	array_unshift($ancestors, ["_id" => new MongoId($parentCategories->_id),'title' =>$parentCategories->cat_title]);

	       	$category->ancestors = $ancestors;

        }

       	$category->cat_title = $inputs['title'];
       	$category->cat_status = '0';
       	$category->cat_thumb = $fileUpload->original['thumb'];
       	$category->cat_lthumb = isset($fileUpload->original['lthumb'])?$fileUpload->original['lthumb']:'';
       	
       	if($category->save()){
       		return response(array("success"=>true,"message"=>"Category created successfully"));
       	}
       	
       	return response(array("success"=>false,"message"=>"Something went worng"));
    }

    public function uploadThumb(Request $request){
    	
    	$files = array();
    	                                  

        if ($request->hasFile('thumb'))
        {
            if ($request->file('thumb')->isValid()){

                $image = $request->file('thumb');
				$detail = pathinfo($request->file('thumb')->getClientOriginalName());
				$thumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();	
				$path = public_path('assets/resources/category/thumb');
				
				Image::make($image)->save($path.'/'.$thumbNewName);
                
                if (!File::exists($path.'/200')){
                    File::MakeDirectory($path.'/200',0777, true);
                }
                if (!File::exists($path.'/400')){
                    File::MakeDirectory($path.'/400/',0777, true);
                }

				Image::make($image)->resize(200, null, function ($constraint) {
		            $constraint->aspectRatio();
		        })->save($path.'/200/'.$thumbNewName);

		        Image::make($image)->resize(400, null, function ($constraint) {
		            $constraint->aspectRatio();
		        })->save($path.'/400/'.$thumbNewName);

		        $files['thumb'] = $thumbNewName;

            }
            
        }

        if ($request->hasFile('lthumb'))
        {
            if ($request->file('lthumb')->isValid()){
                
                $image = $request->file('lthumb');
				$detail = pathinfo($request->file('lthumb')->getClientOriginalName());
				$lthumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();	
				$path = public_path('assets/resources/category/lthumb');
				
				Image::make($image)->save($path.'/'.$lthumbNewName);

                if (!File::exists($path.'/400')){
                    File::MakeDirectory($path.'/400',0777, true);
                }

		        Image::make($image)->resize(400, null, function ($constraint) {
		            $constraint->aspectRatio();
		        })->save($path.'/400/'.$lthumbNewName);

		        $files['lthumb'] = $lthumbNewName;
            }
            
        }

        return response($files);

    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
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
        
        // validation rules
        $validator = Validator::make($inputs, [
            'title' => 'required',            
            //'thumb' => 'mimes:jpeg,jpg,png|max:8000',
        ]);


        // if validation fails
        if ($validator->fails()) {
            return response('There are errors in the form data', 400);
        }
        
        
        $fileUpload = $this->uploadThumb($request);
        
        $category = Categories::find($id);
        
        $category->cat_title = $inputs['title'];
        
        $category->cat_thumb = isset($fileUpload->original['thumb'])?$fileUpload->original['thumb']:$inputs['thumb'];
        $category->cat_lthumb = isset($fileUpload->original['lthumb'])?$fileUpload->original['lthumb']:$inputs['lthumb'];
        
        
        if($category->save()){
            return response(array("success"=>true,"message"=>"Category updated successfully"));
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

    public function getparentcategories($id = false){
    	
    	if($id==""){
    		$categories = Categories::whereNull('ancestors')->get();
    	       
        
        }elseif($id == 'all'){
            $categories = Categories::all()->toArray();
        }else{
    		$categories = Categories::where('ancestors.0._id','=',$id)->get();
    	}

    	return response($categories);
    }

    public function getcategories(Request $request,$id = false)
    {        
        $params = $request->all();

        $categories = new Categories;        

        $columns = array('_id',"cat_title",'cat_title','ancestors','updated_at','cat_status');
        $indexColumn = '_id';      
        $table = 'categoies';
               

            
        /* Individual column filtering */

        if($id){
            $categories = $categories->where('ancestors._id', '=', $id);
        }

        foreach($columns as $fieldKey=>$fieldTitle)
        {              

            if ( isset($params[$fieldTitle]) && $params[$fieldTitle]!="" )
            {
                   
                if($fieldTitle=='ancestors'){
                    $categories = $categories->where($fieldTitle.".0.title", 'regex', "/.*$params[$fieldTitle]/i");
                }else{
                    $categories = $categories->where($fieldTitle, 'regex', "/.*$params[$fieldTitle]/i");
                }
                            
            }
        }


        //prd($categories->toSql());

            
        /*
         * Ordering
         */        

        if ( isset( $params['order'] ) )
        {

            foreach($params['order'] as $orderKey=>$orderField){

                if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
                    
                    $categories = $categories->orderBy($columns[ intval($orderField['column']) ],($orderField['dir']==='asc' ? 'asc' : 'desc'));
                    
                }
            }

        }
        
        /* Data set length after filtering */        

        $iFilteredTotal = $categories->count();

        /*
         * Paging
         */
        if ( isset( $params['start'] ) && $params['length'] != '-1' )
        {
            $categories = $categories->skip(intval( $params['start'] ))->take(intval( $params['length'] ) );
        }

        $iTotal = $categories->count();

        $categories = $categories->get($columns);

        $categories = $categories->toArray();
                
        /*
         * Output
         */
         
        
        $records = array(
            "iTotalRecords" => $iTotal,
            "iTotalDisplayRecords" => $iFilteredTotal,
            "data" => array()
        );

             
        
        $status_list = array(            
            array("warning" => "in-Active"),
            array("success" => "Active")
          );



        $srStart = intval( $params['start'] );
        if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
            $srStart = intval($iTotal);
        }

        $i = 1;
        foreach($categories as $key=>$value) {

            $row=array();

            if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
                $row[] = $srStart--;//$row1[$aColumns[0]];
            }else{
                $row[] = ++$srStart;//$row1[$aColumns[0]];
            }

            $status = $status_list[(int)$value['cat_status']];
            $row[] = '<input type="checkbox" name="id[]" value="'.$value['_id'].'">';
                    
            $row[] = ucfirst($value['cat_title']);
            $row[] = isset($value['ancestors'][0]['title'])?ucfirst($value['ancestors'][0]['title']):'';
            $row[] = '<a href="javascript:void(0)"><span ng-click="changeStatus(\''.$value['_id'].'\')" id="'.$value['_id'].'" data-table="category" data-status="'.((int)$value['cat_status']?0:1).'" class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span></a>';
            $row[] = '<a title="View : '.$value['cat_title'].'" href="#/categories/show/'.$value['_id'].'" class="btn btn-xs default"><i class="fa fa-search"></i></a>'.
                     '<a title="Edit : '.$value['cat_title'].'" href="#/categories/edit/'.$value['_id'].'" href="#/categories/show/'.$value['_id'].'" class="btn btn-xs default"><i class="fa fa-edit"></i></a>';
            
            $records['data'][] = $row;
        }
        
        return response($records, 201);
        
    }


    public function getcategory($categoryId){
        
        $categoryObj = new Categories;

        $result = $categoryObj->getCategory(array(
                        "key"=>$categoryId,
                        "multiple"=>false
                    ));
        
        return response($result, 201);

    }

}