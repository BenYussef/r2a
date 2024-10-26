@if(!isset($addToData['hidefooter']) || !$addToData['hidefooter'] )

@if(isset($addToData['footer']) && $addToData['footer'] == 'bl')
<div class="" style="margin-top: 0px; height: 20%;">

    <table class="table" style="margin-top:0px; position: absolute; bottom: 145px">
        <tr class="tr">
            <th class="th wd70">
                <center style="color: red; font-weight:bold; text-decoration: underline;">Client</center>
            </th>
            <th class="text-signature pl-1" rowspan="4">
                <center><i>Signature et Tampon</i></center>
            </th>
        </tr>
        <tr class="tr">
            <td class="td text-left fbold">Nom et prenom : </td>
        </tr>
        <tr class="tr">
            <td class="td text-left fbold">Poste dans l'entreprise :</td>
        </tr>
        <tr class="tr">
            <td class="td text-left fbold">Contact : </td>
        </tr>

    </table>


</div>
@elseif(isset($addToData['footer']) && $addToData['footer'] == 'facture')
<div class=" wd100" style="height: 20%;">
    <div style=" position: absolute; bottom: 110px">
        <div class=" wd60" style="float: left; ">
            <span class="titre-text">Arrèter la présente facture proforma à la somme de </span>
            <div style="display:block; width:90%!important; margin-top:10px;">
                <span style="font-weight:bold; text-transform:uppercase; font-size:0.7em;">{{$sommeEnLettre}}</span>
            </div>

        </div>
        <div class="wd40" style="float: right; ">
            <div class="fbold" style="display: flex;">
                <div class="" style="text-align: left!important;  font-size: 15px;"> Montant Total HT : </div>
                <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire($total)}}</div>
            </div>

            <div class="fbold" style="display: flex;">
                <div class="" style="text-align: left!important; font-size: 15px;">
                @if($tva != null)
                Montant TVA ({{$pourcentTva}}%) :
                @else
                TVA ({{$pourcentTva}}%) Non facturé :
                @endif
                </div>
                @if($tva != null)
                <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire($montantTva)}}</div>
                @else
                <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire((intval($total) * intval($pourcentTva)) / 100)}}</div>
                @endif
            </div>

            <div class="fbold" style="display: flex;">
                <div class="" style="text-align: left!important; font-size: 15px;">Montant AIRSI :</div>
                @if($airsi != null)
                <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire($montantAirsi)}}</div>
                @else
                <div class="" style="text-align: right!important; font-size: 15px;">0.00</div>
                @endif
            </div>

            <div class="fbold" style="display: flex;">
                <div class="" style="text-align: left!important; font-size: 15px;">Montant Net a payer :</div>
                <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire($totalttc)}}</div>
            </div>
        </div>
    </div>

</div>

@endif
@if(isset($addToData['footer']) && $addToData['footer'] == 'proformas')
<div class=" wd100" style="position: absolute; bottom: -20px; height: 38.5%; margin: 0px auto !important; padding-top: 0px !important;">
    <!-- //A Commenter<div style=" position: absolute; bottom: 0px">
    <div>
        <div class="ph20">
            //A Commenter<div class="wd100" style="margin-bottom:40px;">
                <div class="wd100" style="margin-bottom:0px;">
                <div class="wd60" style="float: left;margin-top: -15px !important ">
                    <span class="titre-text" style="">Arrèter la présente facture proforma à la somme de</span>
                    <div style="display:block; width:90%!important; margin-top:10px;">
                        <span style="font-weight:bold; text-transform:uppercase; font-size:0.8em;">{{$sommeEnLettre}}</span>
                    </div>

                </div>
                <div class="wd40" style="float: right;">
                    <div class="fbold" style="display: flex; margin: 0px !important; padding: 0px !important">
                        <div class="" style="text-align: left!important; font-size: 15px;"> Montant Total HT : </div>
                        <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire($total)}}</div>
                    </div>

                    <div class="fbold" style="display: flex;">
                        <div class="" style="text-align: left!important; font-size: 15px;">Montant TVA :</div>
                        @if($tva != null)
                        <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire($montantTva)}}</div>
                        @else
                        <div class="" style="text-align: right!important; font-size: 15px;">0.00</div>
                        @endif
                    </div>

                    <div class="fbold" style="display: flex;">
                        <div class="" style="text-align: left!important; font-size: 15px;">Montant AIRSI :</div>
                        @if($airsi != null)
                        <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire($montantAirsi)}}</div>
                        @else
                        <div class="" style="text-align: right!important; font-size: 15px;">0.00</div>
                        @endif
                    </div>

                    <div class="fbold" style="display: flex;">
                        <div class="" style="text-align: left!important; font-size: 15px">Montant Net a payer :</div>
                        <div class="" style="text-align: right!important; font-size: 15px">{{Prix_en_monetaire($totalNet)}}</div>
                    </div>
                </div>
            </div>


        </div>
        //A Commenter<div class="ph20" style="clear:both;">
        <div class="ph20" style="position: absolute; top: 40px "> 
            <table class="wd100" id="table-proforma" style="margin-top:0px; margin-bottom:0px;">
                <tr class="tr">
                    <th class="th wd60 validation" id="validation-text">Validation / Bon pour accord</th>
                    <th class="text-signature text-left" rowspan="5">
                        <div class="ml20 fs13">La presence proforma est valide un (01) mois a partir de sa date d'emission mentionnee</div>
                        <div class="mt-15 ml20 fs15">Tèrmes de paiement : <span class="ml20 fbold"> {{$modalitePaiement["libelle"]}}</span></div>
                    </th>
                </tr>
                <tr class="tr" style="border: 1px solid black">
                    <td class="td text-left fbold validation">Nom et prénoms : </td>
                </tr>
                <tr class="tr">
                    <td class="td text-left fbold validation">Poste dans l'entreprise :</td>
                </tr>
                <tr class="tr">
                    <td class="td text-left fbold validation">Contact : </td>
                </tr>
                <tr class="tr">
                    <td id="signature" class="td hpx-40">
                        <i>Signature et Tampon</i>
                    </td>
                </tr>
            </table>
        </div>
    </div> -->

    <table class="table-proforma" > 
		<tr>
            <td rowspan="2" style="padding: 0px; border: 0px; width: 60%">
                <?php $doc = new DOMdocument();?>
                <p id="messge-before-table-left" style="font-size: 1em !important;">Arrêter la présente facture proforma la somme de <?php 
                libxml_use_internal_errors(true);
                echo $sommeEnLettre;?></p>
				
				<table id="table-left" class="">
					<tr>
						<td id="titre" style="color: rgb(202, 10, 56)">VALIDATION / BON POUR ACCORD</td>
					</tr>
					<tr>
						<td>Nom et Prénom :</td>
					</tr>
					<tr>
						<td>Poste dans l'entreprise :</td>
					</tr>
					<tr>
						<td>Contact :</td>
					</tr>
					<tr style="height: 70px">
						<td id="signature"><i>Signature et Tampon</i></td>
					</tr>
				</table>
			</td>

		</tr>
		<tr>
			<td style="padding: 0px; border: 0px">
				<table style="" id="table-right" class="table-proforma">
					<tr class="montant">
						<td class="libelle-montant">Montant Total HT :</td>
						<td class="valeur-montant">{{Prix_en_monetaire($total)}}</td>
					</tr>
					<tr class="montant">
                        <td  class="libelle-montant"> Montant TVA :</td>
                        @if(Prix_en_monetaire($montantTva) != "0")
                            <td class="valeur-montant">{{Prix_en_monetaire($montantTva)}}</td>
                        @else
                            <td class="valeur-montant">0.00</td>
                        @endif
					</tr>
					<tr class="montant">
                        <td  class="libelle-montant">Montant AIRSI :</td>
                        @if(Prix_en_monetaire($montantAirsi) != "0")
                            <td class="valeur-montant">{{Prix_en_monetaire($montantAirsi)}}</td>
                        @else 
                            <td class="valeur-montant">0.00</td>
                        @endif
					</tr>
					<tr class="montant"> 
						<td  class="libelle-montant">Net   payer :</td>
						<td class="valeur-montant" style="color: rgb(2, 12, 126)">{{Prix_en_monetaire($totalNet)}}</td>
                    </tr>
                    
					<tr class="gras" >
						<td colspan="2" id="apres-montant">La présente proforma est valide un (01) mois   partir de sa date d'emission mentionnée.</td>
					</tr>
					<tr >
						<td colspan="2" id="apres-apres-montant"><span style="text-decoration: underline;"><b>TERMES DE PAIMENT :</b></span> <br/><br/>
                        {{$modalitePaiement["libelle"]}}</td>
					</tr>
				</table>
			</td>
			
		</tr>


	</table>


</div>
@endif
@if(!isset($addToData['type']))

<div id="footer" class="footer" >
    <img style="margin-top: 30px !important" class="wd100 hpx-90" src="{{ asset('app-assets/images/pied-page.png') }}" alt="">
</div>
@endif

@if(isset($addToData['footer']) && $addToData['footer'] == 'transfert_client')
<div class="wd40" style="float: right; ">
    <div class="fbold" style="display: flex;">
        <div class="" style="text-align: left!important; font-size: 15px;"> Montant Total : </div>
        <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire($total)}} </div>
    </div>    
</div>
@endif

@if(isset($addToData['footer']) && $addToData['footer'] == 'factureachats')
{{-- <div class="wd40" style="float: right;position: absolute; bottom: -20px; height: 18.5%; margin: 0px auto !important; padding-top: 0px !important;">
    <div class="fbold" style="display: flex;">
        <div class="" style="text-align: left!important; font-size: 15px;"> Montant Total : </div>
        <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire($total)}} </div>
    </div>    
</div> --}}
@endif

@if(isset($addToData['footer']) && $addToData['footer'] == 'commandes')
{{-- <div class="wd40"  style="float: right;position: absolute; bottom: -20px; height: 18.5%; margin: 0px auto !important; padding-top: 0px !important;">
    <div class="fbold" style="display: flex;">
        <div class="" style="text-align: left!important; font-size: 15px;"> Montant Total : </div>
        <div class="" style="text-align: right!important; font-size: 15px;">{{Prix_en_monetaire($total)}} </div>
    </div>    
</div> --}}
@endif
@if(isset($addToData['footer']) && $addToData['footer'] == 'demandeprix')

@endif
@else
<p class="end-page text-right">
    Page <span class="pagenum"></span>
</p>
@endif

