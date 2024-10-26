<div>
    <table class="table">
        <tr class="tr">
            @foreach ($data[0] as $key => $item)
            <th class="whitespace-no-wrap text-center">{{ $key }}</th>  
            @endforeach
        </tr>
        @for ($i = 0; $i < count($data); $i++)
        <tr class="tr">
            @foreach ($data[$i] as $key => $item)
            <td class="td">{{ $item }}</td>
            @endforeach
        </tr>
        @endfor
    </table>
</div>
