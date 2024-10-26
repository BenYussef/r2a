<div>
    <table class="table">
        <tr class="tr">
            <th class="whitespace-no-wrap text-center">Code rome</th>
            <th class="whitespace-no-wrap text-center">Métier</th>
        </tr>

        @for ($i = 0; $i < count($data); $i++)
        <tr class="tr">
            <td class="td">{{ $data[$i]["code_rome"] }}</td>
            <td class="td">{{ $data[$i]["designation"] }}</td>
        </tr>
        @endfor
    </table>
</div>
