<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class DealerRequest extends Request
{    
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {

        $rules = [
            
            'title' => 'required|string|max:255',            
            'description' => 'required|max:500',            
            'status'=> 'integer|in:0,1',
            'address.street'=>'required',
            'address.city'=>'required',
            'address.state'=>'required',
            'address.country'=>'required',

        ];
        
        $contacts = Request::input('contacts');
        
        foreach ($contacts as $key => $contact) {

            $rules['contacts.'.$key.'.name'] = 'required';
            $rules['contacts.'.$key.'.des'] = 'required';
            $rules['contacts.'.$key.'.number'] = 'digits_between:10,10|required';

        }

        return $rules;
    }

    public function messages()
    {

        $messages = [

                'required' => 'This field is required',

        ];

        $contacts = Request::input('contacts');
        foreach ($contacts as $key => $contact) {
                
                $messages['contacts.'.$key.'.number.digits_between'] = 'Enter valid number';

            }
        
        return $messages;

    }

    // public function response(array $errors){
        
    //     return $errors;

    // }

    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
