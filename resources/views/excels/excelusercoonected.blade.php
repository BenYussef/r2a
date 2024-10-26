<div>
    <table class="table">
        <tr class="tr">
            <th class="whitespace-no-wrap text-center">ID LVDC</th>
            <th class="whitespace-no-wrap text-center">NOM</th>
            <th class="whitespace-no-wrap text-center">PRENOM</th>
            <th class="whitespace-no-wrap text-center">TYPE</th>
            <th class="whitespace-no-wrap text-center">CONNECTE LE</th>
            <th class="whitespace-no-wrap text-center">DATE RV</th>
            <th class="whitespace-no-wrap text-center">HEURE DEBUT RV</th>
            <th class="whitespace-no-wrap text-center">HEURE FIN RV</th>
            <th class="whitespace-no-wrap text-center">TEL RV</th>
            <th class="whitespace-no-wrap text-center">EMAIL RV</th>
        </tr>

        @for ($i = 0; $i < count($data); $i++)
        <tr class="tr">
            <td class="td">{{ $data[$i]["id_lvdc"] }}</td>
            <td class="td">{{ $data[$i]["nom"] }}</td>
            <td class="td">{{ $data[$i]["prenom"] }}</td>
            <td class="td">{{ $data[$i]["info1"] }}</td>
            <td class="td">{{ $data[$i]["last_login"] }}</td>
            <td class="td">{{ isset($data[$i]["rvs"][0]) ? $data[$i]["rvs"][0]["date_fr"] : "" }}</td>
            <td class="td">{{ isset($data[$i]["rvs"][0]) ? $data[$i]["rvs"][0]["heure_debut"] : "" }}</td>
            <td class="td">{{ isset($data[$i]["rvs"][0]) ? $data[$i]["rvs"][0]["heure_fin"] : "" }}</td>
            <td class="td">{{ isset($data[$i]["rvs"][0]) ? $data[$i]["rvs"][0]["tel"] : "" }}</td>
            <td class="td">{{ isset($data[$i]["rvs"][0]) ? $data[$i]["rvs"][0]["email"] : "" }}</td>
        </tr>
        @endfor
    </table>
</div>
