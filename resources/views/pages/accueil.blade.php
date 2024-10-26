
<div class="content-body">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-content">
                    <div class="card-body">
                        <div class="row">
                            @if(auth()->user()->type == 0)
                            <div class="col-lg-12 col-sm-12 border-right-blue-grey border-right-lighten-5 text-center">
                                <h1>Bienvenue <span class="info">{{Auth::user()->name}}</span></h1>
                                <br>
                            @endif
                            @if(auth()->user()->type == 1)
                            <div class="col-lg-12 col-sm-12 border-right-blue-grey border-right-lighten-5">
                                <h1>Bienvenue <span class="info">{{Auth::user()->name}},</span></h1>
                                <br>
                                <p class="text-accueil">
                                    Les branches Textile et Habillement, avec l’appui de l’R2A , souhaitent connaitre la situation professionnelle de vos salariés suite à leur obtention du CQP.
                                </p>
                                <p class="text-accueil">
                                    Dans cette optique, <b>nous sollicitons votre aide pour renseigner les coordonnées mail et téléphone de vos salariés bénéficiaires du CQP.</b>
                                </p>
                                <p class="text-accueil">
                                    Vous avez <b>@{{ dataPage['dashboards'].contacts_tout }}</b> salarié(s) concerné(s) par cette collecte. <b>@{{ dataPage['dashboards'].contacts_restant }}</b> contact(s) reste(nt) à compléter.                              </p>
                                <p class="text-accueil">
                                    Pour compléter leurs coordonnées, merci de <b>cliquer sur le bouton ci-dessous ou rendez-vous directement dans l’onglet « Compléter les coordonnées » </b>
                                </p>
                                <p class="text-accueil">
                                    Nous vous remercions par avance de votre précieuse collaboration.
                                </p>
                            </div>
                            <div class="col-lg-12 col-sm-12 border-right-blue-grey border-right-lighten-5 text-center mt-2">
                                <a class="btn btn-info btn-lg" style="font-size:18px" href="#!/list-contact">Je complète les coordonnées <i class="fas fa-check-square"></i></a>
                            </div>
                            @endif
                            @if(auth()->user()->type == 2)
                            <div class="col-lg-12 col-sm-12 border-right-blue-grey border-right-lighten-5">
                                <h1>Bienvenue <span class="info">{{Auth::user()->name}},</span></h1>
                                <br>
                                <p class="text-accueil">
                                    Dans le cadre de l’enquête R2A  pour les branches Textile et Habillement, nous sollicitons votre aide pour collecter les coordonnées mail et téléphone de salariés bénéficiaires du CQP.                                </p>
                                <p class="text-accueil">
                                    1.	Rendez-vous dans l’onglet « Compléter les coordonnées » 
                                </p>
                                <p class="text-accueil">
                                    2.	Utilisez le filtre pour sélectionner l’entreprise que vous contactez 
                                </p>
                                <p class="text-accueil">
                                    3.	La liste des salariés de l’entreprise apparait 
                                </p>
                                <p class="text-accueil">
                                    4.	Renseignez les coordonnées manquantes des salariés 
                                </p>
                                <p class="text-accueil">
                                    <b><u>NB</u></b> : Il est essentiel de recueillir à minima un des 2 modes de contacts du salarié (adresse mail ou numéro de téléphone). Sa date de naissance peut aussi être complétée, mais il ne s’agit pas d’une priorité. 
                                </p>
                            </div>
                            <div class="col-lg-12 col-sm-12 border-right-blue-grey border-right-lighten-5 text-center mt-2">
                                <a class="btn btn-info btn-lg" style="font-size:18px" href="#!/list-contact">Je complète les coordonnées <i class="fas fa-check-square"></i></a>
                            </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


