    <html>
        <head>
            <title>
                @yield('title')
            </title>
            <style>
                .text-uppercase
                {
                    text-transform: uppercase;
                }
                .table {
                    width: 100%;
                    margin-bottom: 1rem;
                    background-color: transparent;
                }

                .table th,
                .table td {
                    padding: 0.55rem;
                    vertical-align: top;
                    border-top: 1px solid #e9ecef;
                }

                .table thead th {
                    background-color: black;
                    vertical-align: bottom;
                    border-bottom: 2px solid #e9ecef;
                    color: #d7d9f2;
                }

                .table tbody + tbody {
                    border-top: 2px solid #e9ecef;
                }

                .table .table {
                    background-color: #fff;
                }

                .table-sm th,
                .table-sm td {
                    padding: 0.3rem;
                }

                .table-bordered {
                    border: 1px solid #e9ecef;
                }

                .table-bordered th,
                .table-bordered td {
                    border: 1px solid #e9ecef;
                }

                .table-bordered thead th,
                .table-bordered thead td {
                    border-bottom-width: 2px;
                }

                .table-borderless th,
                .table-borderless td,
                .table-borderless thead th,
                .table-borderless tbody + tbody {
                    border: 0;
                }

                .table-striped tbody tr:nth-of-type(odd) {
                    background-color: rgba(0, 0, 0, 0.03);
                }
                td,
                th {
                    border: 1px solid rgb(190, 190, 190);
                    padding: 10px;
                }

                td {
                    text-align: center;
                }

                tr:nth-child(even) {

                }

                th[scope="col"] {
                    background-color: #696969;
                    color: #fff;
                }

                th[scope="row"] {
                    background-color: #d7d9f2;
                }

                table {
                    border-collapse: collapse;
                    border: 1px solid rgb(200, 200, 200);
                    letter-spacing: 1px;
                    font-family: sans-serif;
                    font-size: .8rem;
                }
            </style>
        </head>
        <body>
            <div style="text-align:center;text-transform: uppercase;">
                <strong>@yield('title')</strong>
            </div>
            <br><br>
            <div style="text-align:center">Date: {{date('d-m-Y')}}</div>
            <br><br>
            @yield('content')
        </body>
    </html>
