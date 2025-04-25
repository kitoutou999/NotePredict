# NotePredict

NotePredict est une application web qui aide les étudiants à calculer et prédire leurs moyennes universitaires. Elle permet de gérer les Unités d'Enseignement (UE), les matières et les évaluations, avec des fonctionnalités avancées de prédiction de réussite.

## Fonctionnalités

- **Gestion des UE et matières**
  - Ajout et modification d'Unités d'Enseignement
  - Gestion des coefficients
  - Ajout de matières avec leurs évaluations
  - Support des notes uniques et des intervalles de notes

- **Calculs de moyennes**
  - Moyenne minimale et maximale possible
  - Prédiction de la probabilité de réussite
  - Deux modes de calcul :
    - Probabilité d'avoir la moyenne sur l'année (en prenant en compte le semestre précédent)
    - Probabilité d'avoir la moyenne sur le semestre actuel uniquement

- **Mode Extrême**
  - Simulation du pire cas en remplaçant les notes minimales par 0
  - Permet d'évaluer les chances de réussite dans le scénario le plus défavorable

- **Interface utilisateur**
  - Design moderne et responsive
  - Mode sombre/clair
  - Édition directe des notes et coefficients
  - Tooltips informatifs

- **Fonctionnalités supplémentaires**
  - Sauvegarde automatique des données (cookies)
  - Partage des données via code
  - Import/export des configurations

## Technologies utilisées

- HTML5
- CSS3 (avec variables CSS pour le thème)
- JavaScript (ES6+)
- Bootstrap 5
- Bootstrap Icons

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/NotePredict.git
```

2. Ouvrez le fichier `index.html` dans votre navigateur

## Utilisation

1. Entrez votre moyenne du semestre précédent
2. Ajoutez vos UE et matières avec leurs coefficients
3. Saisissez vos notes (uniques ou intervalles)
4. Consultez les prédictions de moyenne et de réussite
5. Utilisez le mode extrême pour simuler le pire cas
6. Basculez entre le calcul de probabilité annuelle et semestrielle avec le switch

## Exemple

```plaintext
Moyenne du semestre précédent : 12/20

UE1 (Coeff 6)
- Mathématiques (Coeff 2)
  - DS1 : 8-12
  - DS2 : 10-14
- Physique (Coeff 1)
  - TP : 14
  - DS : 12-16

Résultats :
- Moyenne minimale possible : 11.5
- Moyenne maximale possible : 13.5
- Probabilité de réussite : 100%
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Auteur

- David Tom - [@kitoutou999](https://github.com/kitoutou999)

