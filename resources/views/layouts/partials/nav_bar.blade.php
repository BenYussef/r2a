<!-- Mon code junior -->
<nav class="header-navbar navbar-expand-md navbar navbar-with-menu fixed-top navbar-dark navbar-shadow">
      <div class="navbar-wrapper">
        <div class="navbar-header">
          <ul class="nav navbar-nav flex-row">
            <li class="nav-item mobile-menu d-md-none mr-auto"><a class="nav-link nav-menu-main menu-toggle hidden-xs" href="javascript::void()"><i class="ft-menu font-large-1"></i></a></li>
            <li class="nav-item"><a class="navbar-brand" href="./">
                <h3 class="brand-text">R2A </h3></a></li>
            <li class="nav-item d-md-none"><a class="nav-link open-navbar-container" data-toggle="collapse" data-target="#navbar-mobile"><i class="fas fa-ellipsis-v"></i></a></li>
          </ul>
        </div>
        <div class="navbar-container content">
          <div class="collapse navbar-collapse" id="navbar-mobile">
            <ul class="nav navbar-nav mr-auto float-left">
              <!-- Pour menu afr2ar, cacher et menu mobile -->
              <li class="nav-item d-none d-md-block"><a class="nav-link nav-menu-main menu-toggle hidden-xs" href="javascript::void()"><i class="ft-menu"></i></a></li>
            </ul>
            
            <ul class="nav navbar-nav float-right">         
              <li class="dropdown dropdown-user nav-item"><a class="dropdown-toggle nav-link dropdown-user-link" href="javascript::void()" data-toggle="dropdown"><span class="avatar avatar-online"><img src="{{asset('assets/app-assets/images/portrait/small/logo-lvdc-blanc2.png')}}" alt="avatar"><i></i></span><span class="user-name">{{Auth::user()->name}}</span></a>
                <div class="dropdown-menu dropdown-menu-right">
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" href="{{ route('logout') }}" onclick="event.preventDefault();document.getElementById('logout-form').submit();"><i class="ft-power"></i> Déconnexion</a>
                <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                    @csrf
                </form>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>


