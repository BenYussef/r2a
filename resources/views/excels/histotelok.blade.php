<div>
    <table class="table">
        <tr class="tr">
            <th class="whitespace-no-wrap text-center">IDLVDC</th>
            <th class="whitespace-no-wrap text-center">ID</th>
            <th class="whitespace-no-wrap text-center">TEL</th>
            <th class="whitespace-no-wrap text-center">DATE_PREPA</th>
            <th class="whitespace-no-wrap text-center">Autorisation</th>
            <th class="whitespace-no-wrap text-center">DATE_T</th>
        </tr>

        @for ($i = 0; $i < count($data); $i++)
        <tr class="tr">
            <td class="td">{{ $data[$i]["id_lvdc"] }}</td>
            <td class="td">{{ $data[$i]["id_histo"] }}</td>
            <td class="td">{{ $data[$i]["tel_histo"] }}</td>
            <td class="td">{{ $data[$i]["date_prepa"] }}</td>
            <td class="td">{{ $data[$i]["autorisation"] }}</td>
            <td class="td">{{ $data[$i]["date_t"] }}</td>
        </tr>
        @endfor
    </table>
</div>
