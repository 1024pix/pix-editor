
## Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

* [Git](http://git-scm.com/) (2.6.4)
* [Node.js](http://nodejs.org/) (v16.19.x) et NPM (8.19.x)
* [Docker](https://docs.docker.com/get-started/) (19.03.5) avec [Docker Compose](https://docs.docker.com/compose/install/)

> ⚠️ Les versions indiquées sont celles utilisées et préconisées par l'équipe de développement. Il est possible que l'application fonctionne avec des versions différentes.

### Airtable

Pix Editor utilise [Airtable](https://airtable.com/). 
La structure de la base peut être fournie en contactant l'équipe de développement.

Naviguer dans votre "developer hub".
Générer un access token avec les droits suivant :
```
data.records:read
data.records:write
```
Donner l'accès à la base qui contient votre schéma dupliqué.
Une fois la base dupliquée, utilisez un compte nominatif pour générer un personal access token.

## Récupérer le code source

```bash
git clone git@github.com:1024pix/pix-editor.git && cd pix-editor
```

## Initialiser la configuration (fichier `.env`)

Initialiser la configuration à partir du template :
```bash
cp api/sample.env api/.env
```

Modifier la configuration en modifiant le fichier `.env`:
- renseigner les variables obligatoires, illustrées d'un 🔴 ;
- prendre connaissance des autres et les modifier si besoin.

## Installer les dépendances

Se placer sur la bonne version de Node en utilisant nvm :
```
nvm use
```

Puis, depuis la racine du projet :
```bash
(cd api && npm ci)
(cd pix-editor && npm ci)
```

## Base de données et cache

Lancer, configurer et initialiser la base de données :
```bash
docker-compose up -d
(cd api && npm run db:reset)
```

## Lancer l'application

Dans un premier processus ou terminal, depuis le répertoire racine :
```bash
(cd api && npm start)
```

Dans un second processus ou terminal, toujours depuis le répertoire racine :
```bash
(cd pix-editor && npm start)
```

## Accéder à l'application

Récupérer l'un des 2 tokens de connexion disponibles dans [le fichier de seeds](./api/db/seeds/seed.js) :
- `defaultEditorUserApiKey` : rôle éditeur;
- `adminUserApiKey` : rôle administrateur.

Accéder à [l'IHM](http://localhost:4300).
Renseigner le token de connexion et vérifier que la page d'accueil s'affiche.

## Créer un utilisateur

```postgres-sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
INSERT INTO users (name, trigram, "apiKey", access) VALUES ('Compte de service', 'ADM',  uuid_generate_v1(), 'admin');
select "apiKey" from users where trigram = 'ADM';
```

Vous obtenez un token, ici  `b00d647e-1cb2-11ee-adb2-0242ac11003e`


## Activer les attachments (image, fichier) 

### OVH

Créer un bucket Swift sur OVH (les buckets S3 ne sont pas supportés)

Lui ajouter la métadonnée permettant d'honorer la politique CORS, en ligne de commande uniquement
https://help.ovhcloud.com/csm/fr-public-cloud-storage-pcs-cors?id=kb_article_view&sysparm_article=KB0047095

Exemple sur le bucket `lcms-attachments-swift`
```shell
swift post -H 'X-Container-Meta-Access-Control-Allow-Origin: *' lcms-attachments-swift
swift stat lcms-attachments-swift
```

Vérifier
```
Container: lcms-attachments-swift
(..)
Sync Key: Meta Access-Control-Allow-Origin: *
(..)
```

Configurer l'API via les variables d'environnement
```dotenv
STORAGE_POST=
STORAGE_TENANT=
STORAGE_USER=
STORAGE_PASSWORD=
STORAGE_AUTH=
STORAGE_BUCKET=
```
