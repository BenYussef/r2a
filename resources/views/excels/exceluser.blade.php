<div>
    <table class="table">
        <tr class="tr">
            <th class="whitespace-no-wrap text-center">ID LVDC</th>
            <th class="whitespace-no-wrap text-center">NOM</th>
            <th class="whitespace-no-wrap text-center">PRENOM</th>
            <th class="whitespace-no-wrap text-center">EMAIL</th>
            <th class="whitespace-no-wrap text-center">TEL</th>
            <th class="whitespace-no-wrap text-center">LOGIN</th>
            <th class="whitespace-no-wrap text-center">MOT DE PASSE</th>
        </tr>

        @for ($i = 0; $i < count($data); $i++)
        <tr class="tr">
            <td class="td">{{ $data[$i]["id_lvdc"] }}</td>
            <td class="td">{{ $data[$i]["nom"] }}</td>
            <td class="td">{{ $data[$i]["prenom"] }}</td>
            <td class="td">{{ $data[$i]["email2"] }}</td>
            <td class="td">{{ $data[$i]["tel"] }}</td>
            <td class="td">{{ $data[$i]["email"] }}</td>
            <td class="td">{{ $data[$i]["password_seen"] }}</td>
        </tr>
        @endfor
    </table>
</div>
