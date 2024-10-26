<div>
    <table class="table">
        <tr class="tr">
            <th class="whitespace-no-wrap">Désignation</th>
            <th class="whitespace-no-wrap text-center">Avec tva</th>
        </tr>

        @for ($i = 0; $i < count($data); $i++)
        <tr class="tr">
            <td class="td">{{ $data[$i]["designation"]}}</td>
            <td class="td">
                @if($data[$i]['tva_text'])
                {{ $data[$i]["tva_text"]}}
                @endif
            </td>
        </tr>
        @endfor
    </table>
</div>
