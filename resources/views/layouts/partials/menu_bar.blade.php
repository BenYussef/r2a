<!-- Mon code junior -->
<div class="main-menu menu-fixed menu-dark menu-accordion menu-shadow " data-scroll-to-active="true">
      <div class="main-menu-content">
        <ul class="navigation navigation-main" id="main-menu-navigation" data-menu="menu-navigation">
        </ul>
        <ul class="navigation navigation-main" id="main-menu-navigation2" data-menu="menu-navigation">
          <li class="navigation-header active">
            <span data-i18n="nav.category.layouts">Menu</span>
          </li>
          
          @if(auth()->user()->is_admin == 1)
          <li class="nav-item"><a href="#!/restit-competence" class="titre-menu"><i class="fas fa-tachometer-alt"></i><span class="menu-title">Tableau de bord</span></a></li>
          <!-- <li class="nav-item"><a href="#!/list-categorie" class="titre-menu"><i class="fas fa-book"></i><span class="menu-title">Catégories</span></a></li> -->
          <li class="nav-item"><a href="#!/list-competence" class="titre-menu"><i class="fas fa-tools"></i><span class="menu-title">Critères</span></a></li>
          <li class="nav-item"><a href="#!/list-fournisseur" class="titre-menu"><i class="fas fa-globe"></i><span class="menu-title">Fournisseurs</span></a></li>
          @endif
          <li class="nav-item"><a href="#!/list-periode" class="titre-menu"><i class="fas fa-hourglass"></i><span class="menu-title">Evaluations</span></a></li>
         
       </ul>
       
        @if(auth()->user()->is_admin == 1)
        
        <ul class="navigation navigation-main" id="main-menu-navigation2" data-menu="menu-navigation">
          <li class="navigation-header active">
            <span data-i18n="nav.category.layouts">PARAMETRES</span>
          </li>
          <li class="nav-item"><a href="#!/list-user" class="titre-menu"><i class="fas fa-users"></i><span class="menu-title">Utilisateurs</span></a></li>
          {{-- <li class="nav-item"><a href="#!/list-preference" class="titre-menu"><i class="fas fa-cog"></i><span class="menu-title">Préférences</span></a></li> --}}
          
        </ul>
        @endif
        <div class="ps-scrollbar-x-rail" style="left: 0px; bottom: 3px;"><div class="ps-scrollbar-x" tabindex="0" style="left: 0px; width: 0px;"></div></div>
        <div class="ps-scrollbar-y-rail" style="top: 0px; height: 944px; right: 3px;"><div class="ps-scrollbar-y" tabindex="0" style="top: 0px; height: 929px;"></div></div>
      </div>
    </div>

