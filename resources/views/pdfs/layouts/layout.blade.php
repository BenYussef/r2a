<!DOCTYPE html>
<html>
    @include('pdfs.layouts.partials.header')
    <body>
        <div class="header">
            {{--@if(isset($addToData['entete']) && $addToData['entete']==2 || $addToData['entete']==3)
                @if(!isset($addToData['type']))
                   <img class="wd100 hpx-90" src="{{ asset('app-assets/images/entete2.png') }}" alt="">
                @endif
            @else
                @if(!isset($addToData['type']))
                    <img class="wd100 hpx-90" src="{{ asset('app-assets/images/entete1.png') }}" alt="">
                @endif
            @endif--}}
        </div>

        @yield('content')
        @include('pdfs.layouts.partials.footer')
    </body>
</html>
