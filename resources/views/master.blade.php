<!DOCTYPE html>
<html ng-app="myApp">
<head>
    <title>Alcohol Delivery</title>
    <link rel="stylesheet" type="text/css" href="{{ asset('css/bootstrap-lumen.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('bower_components/dropzone/dist/dropzone.css') }}">
    <link rel="stylesheet" href="{{ asset('bower_components/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.css') }}">
    <link rel="stylesheet" href="{{asset('bower_components/angular-loading-bar/build/loading-bar.min.css')}}">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/app.css') }}">
    <script>
        var baseUrl = "{{ url('/admin') }}/";
        var csrfToken = "{{ csrf_token() }}";
    </script>
</head>
<body>
    <div class="container" ng-controller="globalController">                
        <?php 
            var_dump(Session::all());
            var_dump(Auth::guest('user'));

            /*Auth::logout('user');*/
        ?>
        <br/>
        ADMIN : {{  Auth::user('admin') }}
        <br/>
        USER : {{  Auth::user('user') }}
        <!-- {{  Auth::user('user') }}
        {{ Auth::user('admin') }} -->
        
        <!-- @if(Auth::guest())
            Hello Guest
        @else           
            {{ Auth::user() }}                
        @endif -->
        
        <div ng-view></div>
    </div>
    <script type="text/javascript" src="{{asset('bower_components/jquery/dist/jquery.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/dropzone/dist/dropzone.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/bootstrap/dist/js/bootstrap.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/angular/angular.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/angular-route/angular-route.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/angular-cookies/angular-cookies.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/angular-loading-bar/build/loading-bar.min.js')}}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-bootstrap/ui-bootstrap.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.js') }}"></script>
    <script type="text/javascript" src="{{url(elixir('js/app.js'))}}"></script>
    <script type="text/javascript" src="{{url(elixir('js/models.js'))}}"></script>
    <script type="text/javascript" src="{{url(elixir('js/controllers.js'))}}"></script>
</body>
</html>
