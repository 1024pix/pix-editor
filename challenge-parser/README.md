## Propositions d'un QCU / QCM

Le format attendu pour les propositions d'un QCU / QCM est une liste utilisant la syntaxe des listes non ordonnées markdown. 

Exemple :

```md
 - Proposition 1
 - Proposition 2
 - Proposition 3
 - Proposition 4
```

Les autres syntaxes markdown (notamment les syntaxes en ligne comme la mise en italique ou en gras) ne sont pas autorisées.

## Solution d'un QCU

Le format attendu pour la solution d'un QCU est un nombre entier désignant la bonne proposition, 1 désignant la première proposition et ainsi de suite.

## Solution d'un QCM

Le format attendu pour la solution d'un QCM est une liste de nombres entiers séparés par des virgules désignants les bonnes propositions, 1 désignant la première proposition et ainsi de suite.

Exemple :

```
2,4
```

La présence de caractères d'espacement est tolérée entre les différents éléments :

```
 1, 2 , 3
```

## Propositions d'un QROC / QROCM

Le format attendu pour les propositions d'un QROC / QROCM est du markdown étendu avec des syntaxes non standard permettant de d'insérer des champs de formulaire.

Dans le cas d'un QROC, un et un seul champ de formulaire peut et doit être défini.

Il existe des syntaxes pour différents types de champs :

 - Champ de saisie
 - Champ de sélection

### Champ de saisie

La syntaxe de base pour un champ de saisie définit le label du champ et le nom de variable associé au champ :

```md
Label du champ ${variableFoo}
```

Il est possible de spécifier un placeholder à afficher lorsque le champ est vide :

```md
Label du champ ${variableFoo#Placeholder du champ}
```

Il est possible de définir un aria-label afin d'améliorer l'accessibilité si le label ne décrit pas le contenu du champ de manière assez précise :

```md
Label du champ ${variableFoo§aria-label du champ}
```

Il est possible de définir une valeur par défaut pour le champ :

```md
Label du champ ${variableFoo value="valeur par défaut"}
```

Les différentes syntaxes peuvent être combinées comme suit :

```md
Label du champ ${variableFoo#Placeholder du champ§aria-label du champ value="valeur par défaut"}
```

### Champ de sélection

La syntaxe de base pour un champ de sélection définit le label du champ, le nom de variable associé au champ et les options disponibles :

```md
Label du champ ${variableFoo options=["1ère option", "2ème option", "3ème option"]}
```

Il est possible de spécifier un placeholder à afficher lorsque le champ est vide :

```md
Label du champ ${variableFoo#Placeholder du champ options=["1ère option", "2ème option", "3ème option"]}
```

Il est possible de définir un aria-label afin d'améliorer l'accessibilité si le label ne décrit pas le contenu du champ de manière assez précise :

```md
Label du champ ${variableFoo§aria-label du champ options=["1ère option", "2ème option", "3ème option"]}
```

Les différentes syntaxes peuvent être combinées comme suit :

```md
Label du champ ${variableFoo#Placeholder du champ§aria-label du champ options=["1ère option", "2ème option", "3ème option"]}
```

## Solution d'un QROC

FIXME

## Solution d'un QROCM indépendant

FIXME

## Solution d'un QROCM dépendant

FIXME
