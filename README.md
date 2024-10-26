# R2A

Remarques 
    
Après renommage d'un controller, il faut réexecuter la commande
    composer dumpautoload

# Paramètres à modifier lors du deploiement sur le serveur

php.ini
display_errors = On

__Les prérequis à faire avant le déploiement de l'app sur un hôte quelconque__


###__Install__

    NB: avec yum pas besoin de remplacer php par phpVersion
    sudo apt-get install {php}-mbstring {php}-xml {php}-zip {php}-gd -y

###Et dans le /etc/php/'php_version'/cli/php.ini, il faudra set les paramètrs suivants

Pour avoir la localisation du fichier php.ini, il faut faire un
__php -i | grep 'Configuration File'__

    max_execution_time=-1 // Pour le mettre à ilimité
    max_input_time=-1
    memory_limit=-1
    post_max_size = 2048M
    upload_max_filesize = 2048M

# Pour donner les droits sur le dossiers au niveau de l'application
# Il faut aussi voir le paramètre APP_URL dans le fichier d'environnement

NB: Réecrire les links avec 
.env
public/index.php
public/assets/js/BACKOFFICE.js

sudo chmod -R 777 *

####Sur un serveur, il faut remplacer le premier paramètre par l'utilisateur
sudo chown -R www-data:www-data storage
sudo chown -R www-data:www-data bootstrap/cache

composer dump-autoload
composer install
php artisan cache:clear
php artisan clear-compiled
php artisan config:cache


#### Quelques autres commandes necessaires

1 - Méthode 1

╰─ scp root@185.98.128.38:/etc/nginx/sites-available/default .

╰─ wget -O ./redis-server https://gist.github.com/lsbardel/257298/raw/d48b84d89289df39eaddc53f1e9a918f776b3074/redis-server-for-init.d-startup

╰─ cp redis-server /etc/init.d/redis-server 

2 - Méthode 2
Source: https://tableplus.com/blog/2018/10/how-to-start-stop-restart-redis.html

sudo systemctl start redis

sudo systemctl enable redis

sudo systemctl restart redis

sudo systemctl stop redis


#### Pour supprimer une base de données utilisée par d'autres utilisateurs

    En deux commandes: 
        ps -ef | grep postgres
        sudo kill -9 PID
        
    En un seule commande:
        sudo kill -9 $(ps -ef | grep postgres)
        
    pg_ctl -D /usr/local/var/postgres start


#### **Pour sauvegarder la base de données sur du serveur remote**

    pg_dump -U postgres -h localhost mikado > /root/mikado.back;


#### **Restauration de la base de données à partir d'une sauvegarde de la base de données**

    psql -U postgres -h localhost -W -d mikado_test -f /root/mikado.back


#### **Pour la génération du fichier pdf** 
    Erreur:
        curl_exec(): Unable to create temporary file, Check permissions in temporary files directory.
    
    Ouvrir le fichier nginx.service 
        sudo nano /etc/systemd/system/multi-user.target.wants/nginx.service 
     Ajouter la ligne
        PrivateTmp=true
        
        
    Sources:
     https://www.nginx.com/resources/wiki/start/topics/examples/systemd/
     https://muras.eu/2017/12/06/apache-ubuntu-systemd-privatetmp/
     https://www.maxoberberger.net/blog/2017/10/debian-9-private-tmp.html


#### **Commande SCP**

    https://linuxize.com/post/how-to-use-scp-command-to-securely-transfer-files/

scp root@108.61.171.0:/root/script.back .

#Crontab
* * * * * php /var/www/html/jadci_tmp_test/artisan schedule:run >> /dev/null 2>&1

Infos serveur 

108.61.171.0
_sL4YJ[65ygKw{uB
41
