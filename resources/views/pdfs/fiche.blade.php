<!DOCTYPE html>
<html>

<head>
    
    <style>
        

        body {
            background: #ffffff;
            font-family: 'calibri', sans-serif;
        }

        @page {
            margin: /* 80px  */10px;
            /* header: page-header;
            footer: page-footer; */
        }
        div{
            page-break-inside: avoid;
        }

        body {
            margin: 30px;
        }

        .cell {
            text-align: center;
            width: 40%;
            overflow: hidden;
        }
        .arrow-icon{
            height: 20px;
            vertical-align: middle;
        }
        
        .cell {
            float: left;
        }

        
        .cell-center-first{
            float: right !important;

        }
        
        p {
            font-weight: normal;
        }

        table {
            width: 100%;
        }

        table tr td {
            /* text-align: center; */
        }

        page {
            background: #FFF;
            display: block;
            margin: 0 auto;
            margin-bottom: 0.5cm;
            box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);


        }

        page[size="A4"] {
            width: 21cm;
           
        }

        header {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 0px 20px;
            justify-content: space-between;

        }

        header .left-logo,
        header .right-logo {
            height: 50px;
            object-fit: cover;
            padding: 10px 10px;
        }

        h1 {
            padding: 0px 10px;
            text-align: center;
            margin: 0px;
            font-size: 20px;
            color: #0A155C;
        }

        .bandeau {
            width: 100%;
            background-color: #d5e7b6;
        }

        .entetes-block {
            /*  display: flex;
            flex-wrap: wrap;
            justify-content: space-evenly; */
            /* background: #a6b2c4; */
            padding: 0px 0px 20px 0px;
            /* background: linear-gradient(190deg, rgba(255, 255, 255, 0.2), transparent); */
            border: 1px solid #a6b2c4;
            border-radius: 12px;
            width: 692px;
            margin: auto !important;
           
        }
        .entetes-block h2{
            margin-top: 0px;
            border-radius:  10px 10px 0px 0px;
            
        }
        .entete-item {
            /* margin: 6px 10px; */
            text-align: center;
           
            width:33.33333%;
            padding: 0px;
            margin-bottom: 10px;
        }

        .entete-label {
            margin: 0px;
            padding: 0px ;
            font-weight: 700;
            /*  border-radius: 0px 0px 0px 0px;
                background-color: #fff;
                border-bottom: 1px solid #0A155C; */
        }

        .entete-value {
            margin: 0px;
            padding: 5px;
            color: #0A155C;
            font-weight: 700;
        }

        .content-block {
            padding: 10px 40px;
        }

        .content-row {
            display: flex;
            justify-content: space-between;
        }

        .content-row-question {
            color: #0A155C;
            font-weight: 700;
            font-size: 14px;
            text-align: left;
            width: 80%;
            padding: 10px;
        }

        .content-row-note {
            font-weight: bold;
            color: #555a5f;
            min-width: 80px;
            text-align: center;
            vertical-align: top;
            width: 20%;
            font-size: 14px;
            padding-top:10px;
        }

        .content-row-note.note-red {
            color: #D61C21;
        }

        .content-row-note.note-green {
            color: #8CBB23;
        }
        .content-row-note.note-black {
            color: #000000;
        }

        .content-item {
            background-color: #FFFFFF;
            border: 1px solid #000000;
            border-radius: 5px;
            padding: 5px 10px;
            margin-bottom: 20px;
        }

        .content-item-label {
            margin: 0px;
            color: #ffffff;
            text-transform: capitalize;
            font-size: 18px;
            background: #212A72;
            padding: 2px 4px;
            border-radius: 3px;
            margin-top: 5px;
        }
        .entetes-block-label {
            margin: 0px;
            color: #000000;
            /* text-transform: capitalize; */
            font-size: 18px;
            background: #c8dbfa;
            padding: 2px 4px;
            border-radius: 3px;
            margin-top: 5px;
        }
        .arrow-icon-container{
            padding: 5px;
            border-radius: 3px;
            height: 3px;

        }
        .content-item-label i {
            font-size: 16px;
        }

        .arrow {
            position: absolute;
            top: 25px;
            width: 90%;
            height: 10px;
            background-color: #fff;
            box-shadow: 0 3px 5px rgba(0, 0, 0, .2);
            animation: arrow 700ms linear infinite;
        }

        .arrow::after,
        .arrow::before {
            content: '';
            position: absolute;
            width: 60%;
            height: 10px;
            right: -8px;
            background-color: #fff;
        }

        .arrow::after {
            top: -12px;
            transform: rotate(45deg);
        }

        .arrow::before {
            top: 12px;
            box-shadow: 0 3px 5px rgba(0, 0, 0, .2);
            transform: rotate(-45deg);
        }
        .rounded-bordered{
            /* s */
            /* border-radius: 3px; */
            
            
        }
        .content-row-open{
            color: #000000;
            padding: 5px 10px;
            font-size: 14px;
            width: 100%;
            /* background-color: #c7d9f5; */
            border-radius: 10px;
            /* border: 1px solid #000000;
            border-top-color: #FFFFFF; */
        }
        .open-content{
           
            padding: 5px 15px;
            font-style: italic;
            width: 98.8%;
            
            border-radius: 15px 0px 0px 0px;
        }
        .underline{
            /* text-decoration: underline; */
        }
        .content-table tr:nth-child(odd) {
            background-color: #e6ecf5;
        }
        .bg-color-1{
            /* background: #e6ecf5; */
        }
        .bg-color-2{
            /* background: #eae6f5; */
        }
    </style>
</head>

<body>
    <page size="A4">
            <header>
                <table>
                    <tr>
                        <td style="width: 15%;">
                            <img src="{{$meta_data['logo_lvdc']}}" height="40" style="float: left" class="left-logo" alt="">
                        </td>
                        <td style="width: 60%; padding:0px 20px; text-align:center;">
                            <h1>{{$meta_data['titre']}}</h1>
                        </td>
                        <td style="width: 15%;">
                            <img src="{{$meta_data['logo_client']}}"  height="40" style="float: right" class="right-logo" alt="">
                        </td>
                    </tr>
                </table>
    
                <hr>
    
            </header>
       
        <section class="entetes-block">
            <h2 class="entetes-block-label ">
                <img src="{{asset('assets\images\check-icon.svg')}}" class="arrow-icon" alt=""> Informations du contact 
            </h2>
            @php
                $color = 1;
                $width = '33.33333%';

                if(count($entetes_data) == 4 || count($entetes_data) == 2){
                    $width = '50%';
                }
                $i = 1;
            @endphp
            @foreach ($entetes_data as $key => $item)
                @php
                    if($key%3 == 0){
                        $color = ($color == 1 ) ? 2 : 1;
                    }
                    if(count($entetes_data) == 7 && $key>5){
                        $width = '100%';
                    }
                    if(count($entetes_data) == 8 && $key>5){
                        //$width = '50%';
                    }
                    if(count($entetes_data) == 1){
                        $width = '100%';
                    }
                   
                @endphp
                <div class="entete-item bg-color-{{$color}}  cell {{(count($entetes_data) - $key == 1 &&  count($entetes_data)%2 == 1) ? 'cell-center-first' : ''}} " style="width:{{$width}}">
                    <div class="rounded-bordered ">
                        <p class="entete-label" style="padding:0px; margin:0px;">{{$item['label']}}</span>
                        <p class="entete-value" style="padding:0px; margin:0px;">{{$item['value']}}</p>
                    </div>
                </div>
                @php
                    $i++;
                    if($i>4){
                        $i=1;
                    }
                @endphp
                
                
            @endforeach
        </section>
        <section class="content-block">
            @foreach ($conteus_data as $item)
               
                <div class="content-item">
                    <h2 class="content-item-label ">
                    <img src="{{asset('assets\images\check-icon.svg')}}" class="arrow-icon" alt=""> {{$item["theme"]}}
                    </h2>
                   
                    <table class="content-table">
                        @foreach ($item["questions"] as $subItem)
                        @if($subItem["type"] == 'numeric' || $subItem["valeur"] == 'N/R' || strlen($subItem["valeur"]) <15)
                            <tr style="margin-bottom: 25px;">
                                <td class="content-row-question underline">{{$subItem["libelle"]}}</td>
                                <td class="content-row-note note-{{$subItem["color"]}}">
                                    <div>
                                            {{$subItem["valeur"]}}                                        
                                    </div>
                                </td>
                            </tr>
                        @else
                        <tr style="margin-bottom: 25px;">
                            <td class="content-row-question underline" colspan="2">
                                {{$subItem["libelle"]}}
                                <div class="content-row-open" colspan="2">
                                    <p class="open-content">"{{$subItem["valeur"]}}"</p>
                                </div>
                            </td>
                        </tr>
                        @endif
                        
                        @endforeach
                    </table>
                </div>
                
            @endforeach
            
        </section>
    </page>

</body>

</html>
