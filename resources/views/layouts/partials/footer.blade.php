<footer class="footer footer-static" style="font-size:1rem;color: grey;border: none !important;">
    <p class="clearfix blue-grey lighten-2 text-sm-center mb-0 px-2">
        <span class="float-md-left d-block d-md-inline-block">Copyright © 2023 <a class="text-bold-800 grey" target="_blank">LVDC</a></span>
        <span class="float-md-right d-block d-md-inline-blockd-none d-lg-block"> <a class="text-bold-800 grey darken-2" href="https://www.lavoixduclient.fr/" target="_blank"></a></span>
    </p>
</footer>

<script src="{{asset('assets/js/sweetalert2.all.min.js')}}"></script>
<!-- Optional: include a polyfill for ES6 Promises for IE11 -->
<script src="https://cdn.jsdelivr.net/npm/promise-polyfill"></script>

<!--AngularJS-->
<script src="{{asset('assets/js/angular/angular.min.js')}}"></script>
<script src="{{asset('assets/js/angular/angular-cookies.min.js')}}"></script>
<script src="{{asset('assets/js/angular/angular-route.min.js')}}"></script>
<script src="{{asset('assets/js/angular/angular-sanitize.min.js')}}"></script>
<script src="{{asset('assets/js/angular/angular-loadscript.js')}}"></script>
<script src="{{asset('assets/js/angular/moment.min.js')}}"></script>
<script src="{{asset('assets/js/angular/angular-moment.min.js')}}"></script>
<script src="{{asset('assets/js/angular/angular-filter.min.js')}}"></script>

<script src="{{asset('assets/js/angular/ui-bootstrap-tpls-2.5.0.min.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/js/angular/dx.all.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/js/angular/angular-bootstrap-toggle.min.js')}}" type="text/javascript"></script>
{{-- <script src="https://cdnjs.cloudflare.com/ajax/libs/pickadate.js/3.5.6/picker.js" integrity="sha512-f6WsaafWFia+glfiIH85UyfdCVDyJScsVDM70lJhKr2lt2cYyptkiqtVxcxPnh/CduM/FpfL0eC4liTwZMb58g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
 --}}
<script src="{{asset('assets/js/BACKOFFICE.js?v=').(Carbon\Carbon::now()->format('h:i:s__d.m.Y'))}}"></script>


<script src="{{asset('assets/js/app-laravel.js')}}"></script>

<!-- Mon code junior -->
<script src="{{asset('assets/js/iziToast/dist/js/iziToast.min.js')}}"></script>
<!-- Quand on décommente vendors ca crée des erreurs par exemple le click sur le nom de l'utilisateur connecté ne marche plus -->
<script src="{{asset('assets/app-assets/vendors/js/vendors.min.js')}}" type="text/javascript"></script>
{{-- <script src="{{asset('assets/js/main.js?v=').(Carbon\Carbon::now()->format('h:i:s__d.m.Y'))}}"></script> --}}

<!-- Datatable -->
<script src="{{ asset('assets/app-assets/vendors/js/tables/datatable/datatables.min.js') }}" type="text/javascript"></script>
<script src="{{ asset('assets/app-assets/js/scripts/tables/datatables/datatable-basic.js') }}" type="text/javascript"></script>
<!-- Datatable -->

<script src="{{asset('assets/app-assets/vendors/js/charts/jvector/jquery-jvectormap-2.0.3.min.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/app-assets/vendors/js/charts/jvector/jquery-jvectormap-world-mill.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/app-assets/vendors/js/extensions/moment.min.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/app-assets/vendors/js/extensions/underscore-min.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/app-assets/vendors/js/extensions/clndr.min.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/app-assets/vendors/js/charts/echarts/echarts.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/app-assets/vendors/js/extensions/unslider-min.js')}}" type="text/javascript"></script>

<script src="{{asset('assets/app-assets/vendors/js/forms/icheck/icheck.min.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/app-assets/vendors/js/extensions/jquery.knob.min.js')}}" type="text/javascript"></script>

<script src="{{asset('assets/app-assets/js/core/app-menu.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/app-assets/js/core/app.js')}}" type="text/javascript"></script>
<script src="{{asset('assets/app-assets/js/scripts/customizer.js')}}" type="text/javascript"></script>

<script src="{{asset('assets/app-assets/js/scripts/pages/dashboard-fitness.js')}}" type="text/javascript"></script>
<!-- <script src="{{asset('assets/app-assets/js/scripts/pages/script-ecommerce.js')}}" type="text/javascript"></script> -->
{{-- <script src="{{ asset('assets/js/blockUI/angular-block-ui.min.js') }}"></script> --}}
<script src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/47585/slip.js"></script>
<!-- BEGIN DIAGRAMMES -->
<script src="https://www.google.com/jsapi" type="text/javascript"></script>
<!-- DIAGRAMME CIRCULAIRE-->
<script src="{{asset('assets/app-assets/js/scripts/charts/google/pie/pie.js')}}" type="text/javascript"></script>
<!-- DIAGRAMME EN BANDES-->
<script src="{{asset('assets/app-assets/js/scripts/charts/google/bar/column.js')}}" type="text/javascript"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
<script></script>
<!-- END DIAGRAMMES -->
{{-- <script>
document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('initAntidote').addEventListener('click', 
					function onclick(ev){
							window.activeAntidoteAPI_JSConnect();
							window.alert('Antidote : Boutons JS-Connect activés');
					}
				);
	document.getElementById('desinitAntidote').addEventListener('click', 
					function onclick(ev){
							window.desactiveAntidoteAPI_JSConnect();
							window.alert('Antidote : Boutons JS-Connect désactivés');
					}
				);
});
</script>
 --}}