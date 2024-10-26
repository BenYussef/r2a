<div>
    <table class="table">
        <tr class="tr">
            <th>Code</th>
            <th>Nom/Raison sociale</th>
            <th>Type de client</th>
            <th>Email</th>
            <th>Civilité (Mr, Mme, Mlle)</th>
            <th>Affiliation (Un client) </th>
            <th>Téléphone par défaut </th>
            <th>RCC </th>
            <th>Dette client </th>
            <th>Remise autorisée (0 ou 1) </th>
            <th>Valeur de la remise(en %) </th>
            <th>Plafond crédit autorisé(0 ou 1) </th>
            <th>Valeur du plafond  </th>
            <th>Exonoré TVA (0 ou 1)  </th>
            <th>Notes client  </th>
            <th>Adresses client  </th>
            <th>Contacts client  </th>
            <th>Comptes sage point de vente  </th>
        </tr>


        @for ($i = 0; $i < count($data); $i++)
        <tr class="tr">
            <td class="td">{{ $data[$i]["code"]}}</td>
            <td class="td">{{ $data[$i]["raison_sociale"]}}</td>
            <td class="td">{{ $data[$i]["type_client"]["designation"]}}</td>
            <td class="td">{{ $data[$i]["email"]}}</td>
            <td class="td">{{ $data[$i]["civilite"]}}</td>
            <td class="td">{{ $data[$i]["affilier"]["raison_sociale"]}}</td>
            <td class="td">{{ $data[$i]["telephone"]}}</td>
            <td class="td">{{ $data[$i]["rcc"]}}</td>
            <td class="td">{{ $data[$i]["dette_client"]}}</td>
            <td class="td">{{ $data[$i]["remise_autorise"]}}</td>
            <td class="td">{{ $data[$i]["remise_value"]}}</td>
            <td class="td">{{ $data[$i]["plafond_credit_autorise"]}}</td>
            <td class="td">{{ $data[$i]["plafond_value"]}}</td>
            <td class="td">{{ $data[$i]["exonorer_tva"]}}</td>
            <td class="td">{{ $data[$i]["notes"]}}</td>
            <td class="td"></td>
            <td class="td"></td>
            <td class="td"></td>

        </tr>
        @endfor
    </table>
</div>
