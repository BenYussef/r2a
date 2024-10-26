
<head>

    <!--<link href="{{ asset('css/pdf.css') }}" rel="stylesheet">-->

    <style>
        #entete {
            margin: 50px 30px;
        }

        .table {
            border-collapse: collapse;
            border: 1px  solid black;
            letter-spacing: 1px;
            font-size: 0.6rem;
            width: 100%;
        }

        .td, .th {
            border: 0.6px solid black; 
            padding: 5px 5px;
        
        }
        .td.vide {
            /* border: 0.6px solid black; */
            border: 0.6px solid black; 
            border-bottom: 0px !important; 
            border-top: 0px !important;            
            padding: 5px 5px;
            height: 9px;
        }

        .th {
            background-color: rgb(235,235,235);
            text-transform: uppercase;
            padding: 10px 5px;
        }

        .text-uppercase
        {
            text-transform: uppercase;
        }

        .td {
            text-align: center;
            
        }

       

        .fbold {
            font-weight: bolder;
        }

        .text-center {
            text-align: center;
        }

        .text-left {
            text-align: left!important;
        }

        .text-right {
            
            text-align: right!important;
        }

        .titre {
            font-size: 14px;
            font-weight: bolder;
            line-height: 20px;
        }

        .titre-text {
            font-weight: initial;
            font-size: 14px;

            /* text-align:left; */

            /* margin-left: 15px; */
        }

        .titre-bon {
            font-family:  Verdana, Geneva, Tahoma, sans-serif;
            font-size: 20px;
            text-transform: uppercase;
            font-weight: bolder;
            text-decoration: underline;
            line-height: 35px;
            text-align: center;
            color: #ed750c;
        }

        .ml20 {
            margin-left: 20px;
        }

        .mt-15 {
            margin-top: 15px;
        }

        .mb90 {
            
            padding: 0px;
            
            margin-bottom: 10px;

        }

        .lh25 {
            line-height: 25px;
        }

        .fs13 {
            font-size: 13px!important;
        }

        .fs15 {
            font-size: 15px!important;
        }


        .wd30 {
            width: 30%!important;
        }

        .wd40 {
            width: 40%!important;
        }

        .wd60 {
            width: 60%!important;
        }

        .wd70 {
            width: 70%!important;
        }

        .wd100 {
            width: 100%!important;
        }

        .hpx-40 {
            height: 70px!important;
        }

        .hpx-70 {
            height: 70px!important;
        } 

        .hpx-90 {
            height: 90px!important;
            padding-left: 15px;
        }
        .hpx-120 {
            height: 120px!important;
        }

        .ph20 {
            padding: 20px 0px;
        }

        .p-4 {
            padding-top: 4px;
            padding-bottom: 4px;
        }

        /**
            Set the margins of the page to 0, so the footer and the header
            can be of the full height and width !
         **/
        @page {
            margin: 50px 30px;
        }

        /** Define now the real margins of every page in the PDF **/
        body {
            margin-top: 3cm;
            margin-left: 1.5cm;
            margin-right: 1.5cm;
            margin-bottom: 2cm;
            /*font-size: 1.2em;*/
            font: 12pt/1.5 'Raleway','Cambria', sans-serif;
            font-weight: 350;
            background:  #fff;
            color: black;
/*
            -webkit-print-color-adjust:  exact;
*/
        }

        .end-page
        {
            position:fixed;
            bottom: 0cm !important;
            left: 1cm;
            right: 1cm;
            height:1cm;
        }

        /** Define the header rules **/
        .header {
            position: fixed;
            top: 0.5cm;
            left: 1cm;
            right: 2cm;
            height: 4cm;
            
        }

        /** Define the footer rules **/
        .footer {
            position: fixed;
            bottom: 0cm;
            left: 1cm;
            right: 1cm;
            height: 3cm;
        }

        .pagenum:before {
            content: counter(page);
        }

        .table-head {
            /* text-align: center; */
             line-height:2.5cm;
        }
       

        .p-absolute {
            position:absolute;
        }

        .p-absolute-right {
            position:absolute;
            right: 0;
        }

        #break {
          display:inline;
       }
      #break:after {
        content:"\a";
         white-space: pre;
       }
       .table-proforma {

			/* width: 90% !important;
            margin: 0 auto; */
			border-spacing: 0px !important;
			font-size: 0.85em;
		}

		tr{
			width: 100% !important;
		}

        #messge-before-table-left{
            /* padding-left: 18px !important;  */
            text-align: justify;
            font-family: Tahoma;
        }
		
		#table-left {
            /* margin-left: 10% !important;  */
            /* width: 80% !important; */
			border: 0.7px solid black;
            width: 100% !important;
		}
		#table-left td {
			padding: 5px;
			font-weight: bold;
            
			border-collapse: collapse;
			border-spacing: 0px;
			border-bottom: 0.5px dotted black;
			border-top: 0px;
            /* width: 120% !important; */
            
		}

		#titre {
			text-align: center;
			color: red;
			
		}
		#signature {
            font-weight: Thin !important;
			font-style: italic;
			/* position: relative;  */
			/* bottom: -18px; */
			/* border-bottom: 0px; */
            /* text-align: bottom; */
            height: 80px;
            line-height: 80px !important;
            padding-bottom: 0px !important; 
		}
		.montant td {
			text-align: left;
			height: 15px;
			font-weight: bold;
            
		}
		#table-right {
            margin-top: -70px;
            height: 270px !important;
			
		}

		#table-right td {
			border: 0px !important;
		}
		.gras {
			font-weight: bold;
		}

        .libelle-montant {
            width: 70% !important;
            padding-left: 35%;
            padding-bottom: 7px;
            /* margin-top: -20px !important; */
        }
        .valeur-montant{
            margin-top: -20px !important;
            text-align: right !important;
            padding-bottom: 7px;
        }
        #apres-montant {
            padding-top: 40px !important;
            padding-left: 2px;
            padding-bottom: 5px;
            /* height: 30px */
        }

        #apres-apres-montant {
            /* height: 80px !important; */
            padding-top: 10px !important;
            padding-left: 10px;

        }

        .montand td {
            padding: 5px;
        }

        .fin-montant {
           line-height: 60px;
           background-color: red;
           height: 30px !important;
           padding-top: -30px !important;
        }
      

    </style>

      

</head>
