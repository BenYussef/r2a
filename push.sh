Copy code
#!/bin/bash

# Affiche un message et sort du script en cas d'erreur
function check_error {
    if [ $? -ne 0 ]; then
        echo "Une erreur est survenue. Sortie du script."
        read -p "Appuyez sur Entrée pour quitter le script."
    fi
}

# Ajoute tous les fichiers modifiés au répertoire de travail
git add .

# Demande un message de commit à l'utilisateur
echo "Entrez le message de commit :"
read commit_message

# Effectue un commit avec le message saisi
git commit -m "$commit_message"
check_error

# Récupère les derniers modifs 
git pull
check_error

# Pousse les modifications vers le dépôt distant
git push
check_error

echo "Les modifications ont été ajoutées, committées et poussées avec succès."
source init.sh
# Attente de l'entrée utilisateur pour garder la fenêtre ouverte
read -p "Appuyez sur Entrée pour quitter le script."