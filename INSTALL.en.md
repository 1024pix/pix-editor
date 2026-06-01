
## Prerequisites

You must have the following software correctly installed beforehand:

* [Git](http://git-scm.com/) (2.6.4)
* [Node.js](http://nodejs.org/) and npm, in a version compatible with the `engine` node specification in the [package.json](./api/package.json) file
* [Docker](https://docs.docker.com/get-started/) (19.03.5) with [Docker Compose](https://docs.docker.com/compose/install/)

> ⚠️ The versions listed are those used and recommended by the development team. The application may work with different versions.

## Get the source code

```bash
git clone git@github.com:1024pix/pix-editor.git && cd pix-editor
```

## Initialize the configuration (`.env` file)

Initialize the configuration from the template:
```bash
cp api/sample.env api/.env
```

Edit the configuration by modifying the `.env` file:
- fill in the required variables, marked with 🔴;
- review the others and modify them as needed.

## Install dependencies

Switch to the correct Node version using nvm:
```
nvm use
```

Then, from the project root:
```bash
(cd api && npm ci)
(cd pix-editor && npm ci)
```

## Database and cache

Start, configure and initialize the database:
```bash
docker-compose up -d
(cd api && npm run db:reset)
```

## Start the application

In a first process or terminal, from the root directory:
```bash
(cd api && npm start)
```

In a second process or terminal, still from the root directory:
```bash
(cd pix-editor && npm start)
```

## Access the application

Retrieve one of the 2 login tokens available in [the seed file](./api/db/seeds/seed.js):
- `defaultEditorUserApiKey`: editor role;
- `adminUserApiKey`: administrator role.

Go to [the UI](http://localhost:4300).
Enter the login token and verify that the home page is displayed.

## Create a user

```postgres-sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
INSERT INTO users (name, trigram, "apiKey", access) VALUES ('Service account', 'ADM',  uuid_generate_v1(), 'admin');
select "apiKey" from users where trigram = 'ADM';
```

You will get a token, e.g. `b00d647e-1cb2-11ee-adb2-0242ac11003e`


## Enable attachments (image, file)

### OVH

Create a Swift bucket on OVH (S3 buckets are not supported)

Add the metadata to honor the CORS policy, via command line only:
https://help.ovhcloud.com/csm/fr-public-cloud-storage-pcs-cors?id=kb_article_view&sysparm_article=KB0047095

Example on the `lcms-attachments-swift` bucket:
```shell
swift post -H 'X-Container-Meta-Access-Control-Allow-Origin: *' lcms-attachments-swift
swift stat lcms-attachments-swift
```

Verify:
```
Container: lcms-attachments-swift
(..)
Sync Key: Meta Access-Control-Allow-Origin: *
(..)
```

Configure the API via environment variables:
```dotenv
STORAGE_POST=
STORAGE_TENANT=
STORAGE_USER=
STORAGE_PASSWORD=
STORAGE_AUTH=
STORAGE_BUCKET=
```
