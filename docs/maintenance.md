# Maintenance en condition operationnelle

Ce document decrit les processus de maintien en condition operationnelle de
Marketly : mise a jour des dependances, supervision, gestion des anomalies et
amelioration continue. Il complete `CHANGELOG.md` (journal des versions) et
`docs/architecture.md`.

## Processus de mise a jour des dependances

Le projet utilise **Dependabot** (`.github/dependabot.yml`), integre
nativement a GitHub, sur trois perimetres : `backend/`, `frontend/` et
`.github/workflows/`.

| Critere | Regle |
|---|---|
| Frequence | Hebdomadaire (lundi 6h, Europe/Paris) pour npm ; mensuelle pour les actions GitHub |
| Perimetre | Dependances de production et de developpement des deux applications, plus les actions utilisees par le pipeline CI |
| Type de mise a jour | Automatique pour la detection et l'ouverture des pull requests ; manuelle pour la fusion |

Le type de mise a jour est **automatique pour la detection** (Dependabot
scanne `package-lock.json` chaque semaine et ouvre une pull request des
qu'une nouvelle version est disponible) mais **manuel pour l'integration** :
aucune fusion automatique n'est configuree. Chaque pull request de
dependance declenche le pipeline CI complet (typecheck, tests, build Docker)
avant de pouvoir etre fusionnee, ce qui garantit qu'une mise a jour ne casse
pas l'application avant d'atteindre `main`.

Les mises a jour de patch et mineures des dependances de production sont
groupees dans une seule pull request pour limiter le bruit ; les mises a jour
majeures, plus a risque de rupture, ouvrent systematiquement une pull request
individuelle afin d'etre testees isolement.

Un audit de securite (`npm audit`) est execute manuellement avant chaque
livraison pour detecter les vulnerabilites connues non couvertes par le
cycle hebdomadaire de Dependabot.

## Systeme de supervision

### Perimetre et sondes

Deux sondes HTTP exposees par le backend permettent de superviser la
disponibilite de l'application :

| Endpoint | Sonde | Finalite |
|---|---|---|
| `GET /health` | Liveness (vivacite) | Confirme que le processus Node.js repond, sans dependance externe. Utilisee pour detecter un processus bloque ou plante. |
| `GET /health/ready` | Readiness (disponibilite) | Execute une requete `SELECT 1` sur PostgreSQL et mesure sa latence. Renvoie `200` si la base est joignable, `503` sinon. Utilisee pour detecter une degradation du service meme si le processus reste en vie. |

Cette separation liveness/readiness est une pratique standard de
supervision : un processus peut etre vivant (le port HTTP repond) tout en
etant degrade (la base de donnees est injoignable). Confondre les deux
conduirait soit a redemarrer inutilement un service sain, soit a laisser
du trafic arriver sur un service incapable de le traiter.

Exemple de reponse degradee (base injoignable) :

```json
{
  "status": "degraded",
  "service": "marketly-backend",
  "uptimeSeconds": 110,
  "timestamp": "2026-08-20T21:46:30.340Z",
  "checks": {
    "database": {
      "status": "error",
      "latencyMs": 4501,
      "error": "Can't reach database server at `localhost:5432`"
    }
  }
}
```

### Resilience au demarrage

Avant cette mise a jour, `server.ts` attendait la connexion a la base de
donnees (`await prisma.$connect()`) avant de considerer le serveur demarre :
une base indisponible au demarrage faisait planter tout le processus. Le
serveur HTTP demarre desormais independamment de l'etat de la base ; la
connexion est tentee en arriere-plan et son resultat est reflete par
`/health/ready`. Un redemarrage de la base de donnees ne provoque donc plus
de crash-loop du backend.

### Indicateurs de qualite et de performance

- **Disponibilite** : proportion de sondages `/health/ready` repondant `200`
  sur une fenetre glissante, mesuree par l'outil de supervision.
- **Latence de la sonde base de donnees** (`checks.database.latencyMs`) :
  seuil d'alerte fixe a 500 ms, une valeur largement superieure a la latence
  normale (< 20 ms en local) qui indiquerait une saturation.
- **Taux d'erreur HTTP** : suivi via les journaux `morgan` (format `combined`
  en production), qui consignent chaque requete avec son code de statut.

### Outil de supervision et alerte

Le monitoring est assure par **Uptime Kuma**, deploye comme quatrieme
service du `docker-compose.yml`. Il sonde `/health/ready` (backend) et `/`
(frontend) a intervalle regulier, affiche l'historique de disponibilite et
declenche une notification (webhook/e-mail configurable) des qu'une sonde
repasse en erreur, garantissant une surveillance de la disponibilite en
continu (voir capture en annexe).

## Processus de collecte et de consignation des anomalies

Les anomalies sont collectees via **GitHub Issues** sur le depot du projet,
outil centralise permettant la tracabilite complete (auteur, date, statut,
lien vers le commit correctif).

Chaque fiche de consignation suit une structure fixe en trois parties,
garantissant que l'information necessaire a la reproduction et a la
correction du bogue est toujours presente :

1. **Qualification** : contexte de la detection, message d'erreur ou
   symptome observe, impact (bloquant/mineur), conditions de reproduction.
2. **Analyse** : cause racine identifiee (et non seulement le symptome),
   avec reference aux fichiers ou lignes de code concernes.
3. **Correction** : modification apportee, commit associe, moyen de
   verification (tests, execution manuelle).

Exemple reel : [Issue #1](https://github.com/yassine-moutaouakel/marketly/issues/1)
« Le backend crash au demarrage en conteneur », detectee lors d'un
`docker compose up --build`, corrigee par le commit `f9a6f2e` et verifiee par
un redemarrage complet des trois conteneurs.

## Traitement d'une anomalie via le pipeline CI/CD

Le correctif d'une anomalie suit le meme protocole d'integration continue
que toute autre modification (voir `docs/architecture.md` et
`.github/workflows/ci.yml`) : le commit correctif declenche le pipeline
(typecheck, harnais de tests, build des images Docker) avant d'etre
fusionnable sur `main`. Aucun correctif n'est considere valide tant que le
pipeline n'est pas au vert, ce qui evite qu'une correction en introduise une
autre.

## Recommandations d'amelioration

Trois axes d'amelioration sont identifies, avec leur justification :

1. **Alerting proactif sur seuils de latence** : configurer une alerte
   Uptime Kuma sur `checks.database.latencyMs > 500ms` plutot que sur la
   seule disponibilite binaire, pour detecter une degradation avant qu'elle
   ne devienne une panne. Cout de mise en oeuvre faible (configuration),
   delai immediat.
2. **Renforcement du harnais de tests de resilience** : ajouter des tests
   simulant une base de donnees indisponible au demarrage (couvert
   partiellement par `health.test.ts`) et une coupure reseau en cours
   d'execution, pour fiabiliser le comportement en degrade. Delai estime :
   une iteration de sprint.
3. **Automatisation partielle des mises a jour de dependances** : autoriser
   la fusion automatique des correctifs de securite (patch) de Dependabot
   apres succes du pipeline CI, pour reduire le delai d'exposition aux
   vulnerabilites connues sans sacrifier la revue humaine sur les mises a
   jour mineures et majeures.

Ces recommandations sont realistes au regard du projet (aucune ne necessite
de changement d'architecture) et renforcent l'attractivite du logiciel en
ameliorant sa fiabilite percue et son temps de reponse aux incidents.

## Exemple de problème résolu en collaboration avec le support client

> Marketly est un projet mené en solo dans le cadre d'une certification, sans
> service support client réel. Le scénario ci-dessous est une **simulation
> pédagogique explicitement identifiée comme telle** : le contexte de remontée
> (ticket support) est reconstitué, mais le défaut, son analyse et son
> correctif sont **réels** et correspondent au commit `4bacd1a` (« fix: garde
> de concurrence sur le stock »).

### Contexte du retour client

**Ticket support (simulé) — 2026-07-23**
> « Deux de mes clients me disent avoir réussi à acheter le même article en
> stock unique au même moment. L'un des deux a été débité mais je ne peux pas
> honorer sa commande. Le site ne devrait pas laisser ça arriver. »
> — Vendeur, boutique Studio Marketly

Le support qualifie la demande comme un défaut fonctionnel critique (perte
de confiance vendeur, risque de remboursement) et la transmet à l'équipe de
développement avec les informations de reproduction fournies par le vendeur
(deux commandes passées à quelques secondes d'intervalle sur le même
produit, stock initial de un).

### Explication du problème

Le service `order.service.ts` vérifiait la disponibilité du stock **avant**
d'ouvrir la transaction d'écriture, puis décrémentait le stock **sans
condition** sur sa valeur au moment de l'écriture. Deux requêtes de checkout
concurrentes pouvaient toutes deux passer la vérification initiale avant que
l'une des deux n'ait décrémenté le stock, aboutissant à deux commandes
validées pour un seul exemplaire disponible — une condition de concurrence
(race condition) classique, invisible en usage normal et donc absente des
scénarios de tests nominaux.

### Résolution apportée

Le décrément du stock a été réécrit sous la forme d'un `updateMany` dont la
clause `WHERE` impose `stock >= quantite_demandee`, exécuté à l'intérieur de
la même transaction Prisma que la création de la commande. Si aucune ligne
ne correspond (stock devenu insuffisant entre-temps), la transaction échoue
et une erreur `409 Insufficient stock` est renvoyée : la base de données
elle-même garantit l'atomicité de la vérification et du décrément, ce
qu'aucune vérification applicative préalable ne peut garantir sous
concurrence. Un test dédié (`orders.test.ts`) simule deux checkouts
concurrents sur un stock unique pour verrouiller ce comportement.

### Contribution des différentes parties prenantes

| Partie prenante | Contribution |
|---|---|
| Vendeur (client) | Signale le symptôme observé avec le contexte de reproduction |
| Support | Qualifie l'impact, collecte les informations de reproduction, ouvre le ticket de développement |
| Développeur | Analyse la cause racine (condition de concurrence), conçoit et implémente le correctif, écrit le test de non-régression |
| Pipeline CI/CD | Valide le correctif (typecheck, tests, build) avant fusion sur `main` |

Le correctif a été vérifié par l'exécution du harnais de tests complet
(40 tests, dont le nouveau scénario de concurrence) et par un déploiement de
bout en bout via `docker compose up --build`.
