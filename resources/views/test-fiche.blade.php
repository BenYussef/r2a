<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <style>
        body {
            background: #ffffff;
            font-family: 'Calibri', sans-serif;
        }

        @page {
            margin: 10px;
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
        
        .cell-0 {
            float: left;
        }

        .cell-1 {
            float: right;
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
            height: 29.7cm;
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
            padding: 5px 40px;
            background: linear-gradient(190deg, rgba(255, 255, 255, 0.2), transparent);
        }

        .entete-item {
            /* margin: 6px 10px; */
            text-align: center;
           
            width: 45%;
            padding: 10px;
        }

        .entete-label {
            margin: 0px;
            padding: 0px 5px;
            font-weight: 700;
            /*  border-radius: 0px 0px 0px 0px;
        background-color: #fff;
        border-bottom: 1px solid #0A155C; */
        }

        .entete-value {
            margin: 0px;
            padding: 5px 10px;
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
            padding-bottom: 10px;
        }

        .content-row-note {
            font-weight: 900;
            color: #555a5f;
            min-width: 80px;
            text-align: center;
            vertical-align: top;
            width: 20%;
            font-size: 14px;
        }

        .content-row-note.note-red {
            color: #D61C21;
        }

        ..content-row-note.note-green {
            color: #8CBB23;
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
            background: #179393;
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
            border: 1px solid #0A155C;
            border-radius: 0px 0px 10px 10px;
        }
    </style>
</head>

<body>
    <page size="A4">
        <header>
            <table>
                <tr>
                    <td style="width: 15%;">
                        <img src="https://lvdc-files.fr/lvmskb1agfourlz.png" height="40" style="float: left" class="left-logo" alt="">
                    </td>
                    <td style="width: 60%; padding:0px 20px; text-align:center;">
                        <h1>Baromètre de satisfaction DALKIA - 2023</h1>
                    </td>
                    <td style="width: 15%;">
                        <img src="https://lvdc-files.fr/u5huctaymprxxa2.jpg"  height="40" style="float: right" class="right-logo" alt="">
                    </td>
                </tr>
            </table>

            <hr>

        </header>
        <!-- <section>
            <img src="https://lvdc-files.fr/azxeub4jjugbgek.png" class="bandeau" alt="">
         </section> -->
        <div class="entetes-block">
            <div class="entete-item cell cell-0">
                <div class="rounded-bordered">
                    <p class="entete-label" style="">Interlocuteur</span>
                    <p class="entete-value">Monsieur Didier MAUDUIT</p>
                </div>
            </div>
            <div class="entete-item cell cell-1">
                <div class="rounded-bordered">
                    <p class="entete-label">Numéro de téléphone</p>
                    <p class="entete-value">0033231620512</p>
                </div>
            </div>
            <div class="entete-item cell cell-0">
                <div class="rounded-bordered">
                    <p class="entete-label">Fonction déclarative</p>
                    <p class="entete-value">Les Deux</p>
                </div>
            </div>
            <div class="entete-item cell cell-1">
                <div class="rounded-bordered">
                    <p class="entete-label">Etablissement régional</p>
                    <p class="entete-value">NORD OUEST</p>
                </div>
            </div>
        </div>
        <div class="content-block">
            <div class="content-item">
                <h2 class="content-item-label ">
                   <img src="{{asset('assets\images\check-icon.svg')}}" class="arrow-icon" alt=""> Satisfaction globale
                </h2>
                <hr>
                <table>
                    <tr style="margin-bottom: 25px;">
                        <td class="content-row-question">Q1- Globalement en considérant l’ensemble du service fourni par
                            DALKIA,
                            quelle note de 1 à 10 donneriez-vous ?</td>
                        <td class="content-row-note note-red">5/10</td>
                    </tr>
                    <tr>
                        <td class="content-row-question">Q1- Globalement en considérant l’ensemble du service fourni par
                            DALKIA,
                            quelle note de 1 à 10 donneriez-vous ?</td>
                        <td class="content-row-note note-red">5/10</td>
                    </tr>
                    <tr>
                        <td class="content-row-question">Q1- Globalement en considérant l’ensemble du service fourni par
                            DALKIA,
                            quelle note de 1 à 10 donneriez-vous ?</td>
                        <td class="content-row-note note-red">5/10</td>
                    </tr>
                </table>

            </div>
            <div class="content-item">
                <h2 class="content-item-label ">
                   <img src="{{asset('assets\images\check-icon.svg')}}" class="arrow-icon" alt=""> Satisfaction globale
                </h2>
                <hr>
                <table>
                    <tr style="margin-bottom: 25px;">
                        <td class="content-row-question">Q1- Globalement en considérant l’ensemble du service fourni par
                            DALKIA,
                            quelle note de 1 à 10 donneriez-vous ?</td>
                        <td class="content-row-note note-red">5/10</td>
                    </tr>
                    <tr>
                        <td class="content-row-question">Q1- Globalement en considérant l’ensemble du service fourni par
                            DALKIA,
                            quelle note de 1 à 10 donneriez-vous ?</td>
                        <td class="content-row-note note-red">5/10</td>
                    </tr>
                    <tr>
                        <td class="content-row-question">Q1- Globalement en considérant l’ensemble du service fourni par
                            DALKIA,
                            quelle note de 1 à 10 donneriez-vous ?</td>
                        <td class="content-row-note note-red">5/10</td>
                    </tr>
                </table>

            </div>
        </div>
    </page>

</body>

</html>
