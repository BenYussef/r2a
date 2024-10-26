<div>
    <table class="table">
        <tr class="tr">
            <th class="whitespace-no-wrap text-center">Code</th>
            <th class="whitespace-no-wrap text-center">Nom entreprise</th>
            <th class="whitespace-no-wrap text-center">Login</th>
            <th class="whitespace-no-wrap text-center">Mot de passe</th>
        </tr>

        @for ($i = 0; $i < count($data); $i++)
        <tr class="tr">
            <td class="td">{{ $data[$i]["code"] }}</td>
            <td class="td">{{ $data[$i]["designation"] }}</td>
            <td class="td">{{ $data[$i]["login"] }}</td>
            <td class="td">{{ $data[$i]["password"] }}</td>
        </tr>
        @endfor
    </table>
</div>
