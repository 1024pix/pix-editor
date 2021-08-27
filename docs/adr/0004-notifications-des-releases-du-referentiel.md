# 4. Notifications des releases du référentiel

Date : 2021-08-29

## État

Accepté

## Contexte

On nomme "référentiel pédagogique" l'ensemble des contenus conçus et gérés par Pix permettant l'évaluation des compétences numériques des utilisateurs, tels que les domaines de compétences, les épreuves, les acquis, les tutoriels, etc.

La gestion du référentiel de contenu pédagogique s'appuie sur un système de "versions du référentiel" (a.k.a. *releases*). Une release est une photo à un instant donné du référentiel complet. Ce mécanisme permet aux intervenants (créateurs pédagogiques, responsables support, développeurs, etc.) de gérer efficacement et en toute autonomie le référentiel : déploiement de nouvelles épreuves et items pédagogiques, rollback en cas de problèmes, etc.

La création et le déploiement d'une nouvelle version du référentiel peuvent être déclenchés manuellement (ex : en cours de journée, par un membre de l'équipe contenus, depuis Pix Admin) ou automatiquement (via [une tâche scriptée](/docs/0003-creation-de-release-quotidienne) qui s'exécute toutes les nuits).

Une difficulté que nous rencontrons actuellement est de n'être pas informés lors de la publication d'une release, qu'elle se soit bien ou mal passée. En particulier dans ce dernier cas (erreur ou échec), nous aimerions être alertés directement – immédiatement via Slack – avec un niveau d'informations qui nous permet de réagir et de communiquer de façon optimale.

## Décisions

💡 Pour satisfaire à ce besoin technico-fonctionnel, nous décidons de mettre en œuvre un mécanisme de notification automatique en cas de publication d'une nouvelle version du référentiel pédagogique.

### Comment sera faite la notification ?

💡 Nous décidons d'effectuer les notifications via Slack, car c'est l'outil le plus adapté et utilisé par Pix pour l'alerting, l'organisation et la communication en conditions opérationnelles.

### Par qui sera faite la notification ?

Dans un premier temps, nous avons pensé à Pix Bot (Run). L'avantage de cette application est qu'elle dispose déjà de tout le nécessaire (libs, code, clés, etc.) en termes d'exploitation et d'interopérabilité avec l'API / les fonctionnalités de Slack. Cependant plusieurs choses nous ont gênées :
- le fait de rendre interdépendants 2 composants très différents et jusque là isolés du SI (Pix Bot et Pix LCMS)
- l'orientation et le périmètre *fonctionnel* de Pix Bot qui est orienté "opérations techniques / SI"  

Par ailleurs, plus nous creusons le problème, plus il nous apparaît que le besoin de notification a quelque chose de très "métier". Les notifications peuvent aussi intéresser les concepteurs d'épreuves, de même que les responsables du support (dans le cas où ils gèrent un pic de signalement lié à une épreuve).

💡 Pour ces raisons, nous décidons de positionner le déclencheur / émetteur de la notification Slack dans Pix LCMS.

### Une nouvelle application Slack.

Les applications Slack existantes sont liées à Pix Bot (Build  & Run). Dans la continuité de la décision précédente, nous pensons qu'il faut conserver une séparation forte et claire entre Pix Bot et Pix LCMS aussi dans Slack.

💡 Nous décidons de créer une nouvelle application pour ce besoin métier : `Pix LCMS ChatOps` qui pourra éventuellement être étendue pour ajouter des fonctionnalités (autres notifications, commandes, informations) de gestion du référentiel dans Slack.

### Webhook (vs. commandes vs. Bolt [client Slack])

💡 Nous décidons de publier les messages via le mécanisme [`Incoming Webhooks`](https://api.slack.com/incoming-webhooks) de Slack qui reste le moyen le plus simple pour envoyer un message unique sur une chaîne particulière (plutôt que les [`Interactive Components`](https://api.slack.com/interactivity/components) / Shortcuts, un peu plus compliqués à développer et maintenir, cf. Pix Bot).

💡 Nous décidons d'utiliser Axios (lib de gestion des requêtes HTTP) plutôt que Bolt (client Slack officiel) pour la même raison de "simplicité de la mise en œuvre". En effet, l'utilisation de Bolt requiert la configuration et la gestion d'identifiants (et autres concepts plus avancés) là où un appel Axios ne nécessite qu'une URL.  

## Conséquences

- Ajout de fonctionnalités de notification Slack dans Pix LCMS API
- Ajout du module `axios` dans Pix LCMS API
- Ajout de 2 variables d'environnement (`NOTIFICATIONS_SLACK_ENABLED` et `NOTIFICATIONS_SLACK_WEBHOOK_URL`) dans Pix LCMS API
- Ajout d'une application "Pix LCMS ChatOps" dans l'espace Slack de Pix
