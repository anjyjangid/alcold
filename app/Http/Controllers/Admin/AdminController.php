<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\User as User;

class AdminController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('admin');        
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('backend');
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
        //
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
        //
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

    public function customers()
    {

        $users = User::all()->toArray();
        $status_list = array(
            array("success" => "Pending"),
            array("info" => "Closed"),
            array("danger" => "On Hold"),
            array("warning" => "Fraud")
          );
<<<<<<< HEAD

        $records = [
            "iTotalRecords" => User::count(),
            "iTotalDisplayRecords" => User::count(),
        ];
        
=======
        $sEcho = intval($_REQUEST['draw']);
>>>>>>> db4689c0a1a9029ffdee35d1ef6c3ba24e15be7a
        foreach($users as $key=>$value) {
            $status = $status_list[rand(0, 2)];
            $records["data"][] = array(
              '<input type="checkbox" name="id[]" value="'.$value['_id'].'">',
              $value['_id'],
              '12/09/2013',
              'Jhon Doe',
              'Jhon Doe',
              '450.60$',
              rand(1, 10),
              '<span class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span>',
              '<a href="javascript:;" class="btn btn-xs default"><i class="fa fa-search"></i> View</a>',
            );
        }
        $records["draw"] = $sEcho;
        $records["recordsTotal"] = count($users);
        $records["recordsFiltered"] = count($users);
       return  json_encode($records);
    }

    public function home()
    {
        return view('backend');
    }
}
