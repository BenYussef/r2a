#!/bin/bash
echo "Installation veuillez patienter "
source init.sh
composer install
source cache.sh
php artisan config:clear
php artisan db:create
php artisan migrate --seed
source refresh.sh
echo "Installation terminé"