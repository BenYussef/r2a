<div>
    <table class="table">
        <tr class="tr">
            <th class="whitespace-no-wrap text-center">IDLVDC2</th>
            <th class="whitespace-no-wrap text-center">SEMAINE_PREPA</th>
            <th class="whitespace-no-wrap text-center">Traitement</th>
            <th class="whitespace-no-wrap text-center">Activité</th>
            <th class="whitespace-no-wrap text-center">Choix Client</th>
            <th class="whitespace-no-wrap text-center">Choix Client_REC</th>
            <th class="whitespace-no-wrap text-center">Nom du service</th>
            <th class="whitespace-no-wrap text-center">Typologie Client</th>
            <th class="whitespace-no-wrap text-center">Codification Appel</th>
        </tr>

        @for ($i = 0; $i < count($data); $i++)
        <tr class="tr">
            <td class="td">{{ $data[$i]["id_lvdc_restit"] }}</td>
            <td class="td">{{ $data[$i]["semaine_prepa"] }}</td>
            <td class="td">{{ $data[$i]["traitement"] }}</td>
            <td class="td">{{ $data[$i]["activite"] }}</td>
            <td class="td">{{ $data[$i]["choix_client"] }}</td>
            <td class="td">{{ $data[$i]["choix_client_rec"] }}</td>
            <td class="td">{{ $data[$i]["nom_service"] }}</td>
            <td class="td">{{ $data[$i]["typologie_client"] }}</td>
            <td class="td">{{ $data[$i]["codification_appel"] }}</td>
        </tr>
        @endfor
    </table>
</div>
