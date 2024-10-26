<!DOCTYPE html>
<html>
    <head>
        <title>QR Code Menu</title>
    </head>
    <body>
        <div class="visible-print text-center">
            <h1>QR code pour menu</h1>
            
            {!! QrCode::size(250)->generate($qrcode); !!}
            
        </div>
    </body>
</html>