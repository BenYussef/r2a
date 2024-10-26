#!/bin/bash
echo "Installation veuillez patienter "
composer require laravel/telescope "^4.7.3"
php artisan telescope:install
source cache.sh
php artisan migrate
