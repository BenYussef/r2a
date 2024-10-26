@extends('layouts.app')
@section('content')

 <!-- Mon code junior -->
<body class="vertical-layout vertical-menu 1-column bg-full-screen-image menu-expanded blank-page blank-page" data-open="click" data-menu="vertical-menu" data-col="1-column">
    <!-- ////////////////////////////////////////////////////////////////////////////-->
    <div class="app-content content">
      <div class="content-wrapper">
        <div class="content-header row">
        </div>
        <div class="content-body"><section class="flexbox-container">
    <div class="col-12 d-flex align-items-center justify-content-center">
        <div class="col-md-4 col-10 box-shadow-2 p-0">
            <div class="card border-grey border-lighten-3 m-0">
                <div class="card-header border-0">
                    <div class="card-title text-center">
                        <div class="p-1"><img src="{{ asset('assets/app-assets/images/logo/logo-lvdc2.png') }}"alt="branding logo"></div>
                    </div>
                    <h6 class="card-subtitle line-on-side text-muted text-center font-small-3 pt-2"><span>CODIFICATION R2A</span></h6>
                </div>
                <div class="card-content">
                    <div class="card-body">
                        <form class="form-horizontal form-simple" method="POST" action="{{ route('login') }}">
                            <fieldset class="form-group position-relative has-icon-left mb-0">
                                <input type="text" class="form-control form-control-lg input-lg {{ $errors->has('email') ? ' is-invalid' : '' }}" id="email" placeholder="Login" name="email" value="{{ old('email') }}" required autofocus autocomplete="off">
                                @if ($errors->has('email'))
                                <span class="invalid-feedback fsize-14" role="alert">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                                @endif
                                <div class="form-control-position">
                                    <i class="fas fa-user"></i>
                                </div>
                            </fieldset>
                            <fieldset class="form-group position-relative has-icon-left mt-2">
                                <input type="password" class="form-control form-control-lg input-lg {{ $errors->has('password') ? ' is-invalid' : '' }} " id="password" name="password" placeholder="Mot de passe" required autocomplete="off">
                                @if ($errors->has('password'))
                                    <span class="invalid-feedback fsize-14" role="alert">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                                @endif
                                @if($errors->has('msg'))
                                <div style="color: red;font-size: 14px">{{$errors->first('msg')}}</div>
                                @endif
                                <div class="form-control-position">
                                    <i class="fas fa-key"></i>
                                </div>
                            </fieldset>
                            <div class="form-group row">
                            </div>
                            <button type="submit" class="btn btn-mytheme btn-lg btn-block"><i class="ft-unlock"></i> Login</button>
                        </form>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="">
                        <p class="float-sm-left text-center m-0"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

        </div>
      </div>
    </div>
    <!-- ////////////////////////////////////////////////////////////////////////////-->

    <!-- BEGIN VENDOR JS-->
    <script src="app-assets/vendors/js/vendors.min.js" type="text/javascript"></script>
    <!-- BEGIN VENDOR JS-->
    <!-- BEGIN PAGE VENDOR JS-->
    <script src="app-assets/vendors/js/forms/icheck/icheck.min.js" type="text/javascript"></script>
    <script src="app-assets/vendors/js/forms/validation/jqBootstrapValidation.js" type="text/javascript"></script>
    <!-- END PAGE VENDOR JS-->
    <!-- BEGIN ROBUST JS-->
    <script src="app-assets/js/core/app-menu.js" type="text/javascript"></script>
    <script src="app-assets/js/core/app.js" type="text/javascript"></script>
    <!-- END ROBUST JS-->
    <!-- BEGIN PAGE LEVEL JS-->
    <script src="app-assets/js/scripts/forms/form-login-register.js" type="text/javascript"></script>
    <!-- END PAGE LEVEL JS-->
  </body>

@endsection


