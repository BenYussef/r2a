<div>
    <table class="table">
        <tr class="tr">
            <th class="whitespace-no-wrap text-center">ID LVDC</th>
            <th class="whitespace-no-wrap text-center">NOM</th>
            <th class="whitespace-no-wrap text-center">PRENOM</th>
            <th class="whitespace-no-wrap text-center">TYPE</th>
            <th class="whitespace-no-wrap text-center">TEL</th>
            <th class="whitespace-no-wrap text-center">EMAIL</th>
            <th class="whitespace-no-wrap text-center">DATE RV</th>
            <th class="whitespace-no-wrap text-center">HEURE DEBUT RV</th>
            <th class="whitespace-no-wrap text-center">HEURE FIN RV</th>
            <th class="whitespace-no-wrap text-center">CREE LE</th>
        </tr>

        @for ($i = 0; $i < count($data); $i++)
        <tr class="tr">
            <td class="td">{{ $data[$i]["id_lvdc"] }}</td>
            <td class="td">{{ $data[$i]["user"]["nom"] }}</td>
            <td class="td">{{ $data[$i]["user"]["prenom"] }}</td>
            <td class="td">{{ $data[$i]["user"]["info1"] }}</td>
            <td class="td">{{ $data[$i]["tel"] }}</td>
            <td class="td">{{ $data[$i]["email"] }}</td>
            <td class="td">{{ $data[$i]["date_fr"] }}</td>
            <td class="td">{{ $data[$i]["heure_debut"] }}</td>
            <td class="td">{{ $data[$i]["heure_fin"] }}</td>
            <td class="td">{{ $data[$i]["created_at_fr"] }}</td>
        </tr>
        @endfor
    </table>
</div>
