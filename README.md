# e-Yaar - E-commerce Burkinabè avec Système de Vendeurs

## Description

e-Yaar est une plateforme e-commerce moderne conçue pour le marché burkinabè, avec un système d'authentification complet et une gestion des vendeurs intégrée.

## Fonctionnalités Principales

### 🔐 Système d'Authentification
- **Inscription/Connexion** : Système complet avec validation
- **Rôles utilisateurs** : Client, Vendeur, Administrateur
- **Profils personnalisés** : Gestion des informations utilisateur

### 🏪 Gestion des Vendeurs
- **Contrat électronique** : Processus de signature pour devenir vendeur
- **Espace vendeur dédié** : Interface spécialisée pour les vendeurs
- **Gestion des produits** : Ajout, modification, suppression de produits
- **Statistiques** : Suivi des ventes et revenus

### 🛒 Fonctionnalités E-commerce
- **Catalogue de produits** : Affichage avec filtres et recherche
- **Paiement mobile** : Support Orange Money, Moov Money, Telecel Money
- **Partage social** : Intégration Facebook, Instagram, Telegram, TikTok, Twitter
- **Responsive design** : Compatible mobile et desktop

## Structure des Rôles

### 👤 Client
- Peut parcourir et acheter des produits
- Peut demander à devenir vendeur via contrat
- Accès limité aux fonctionnalités de publication

### 🏪 Vendeur
- Tous les droits des clients
- Peut publier, modifier et supprimer ses produits
- Accès à l'espace vendeur avec statistiques
- Gestion de son catalogue personnel

### 👨‍💼 Administrateur
- Tous les droits des vendeurs
- Gestion des contrats vendeurs (approbation/rejet)
- Vue d'ensemble de la plateforme
- Gestion des utilisateurs

## Comptes de Test

### Administrateur
- **Email** : `admin@e-yaar.bf`
- **Mot de passe** : `admin123`

### Vendeur
- **Email** : `vendeur@e-yaar.bf`
- **Mot de passe** : `vendeur123`

### Client
- **Email** : `client@e-yaar.bf`
- **Mot de passe** : `client123`

## Processus de Devenir Vendeur

1. **Inscription** : Créer un compte client
2. **Demande** : Cliquer sur "Devenir Vendeur" dans le profil
3. **Contrat** : Remplir le formulaire de contrat électronique
4. **Validation** : L'administrateur examine et approuve le contrat
5. **Accès** : Le compte est automatiquement promu au statut vendeur

## Sécurité et Permissions

### 🔒 Restrictions de Publication
- Seuls les vendeurs approuvés peuvent publier des articles
- Vérification automatique du statut lors de l'ajout de produits
- Interface adaptée selon le rôle de l'utilisateur

### 📋 Validation des Contrats
- Processus d'approbation manuel par l'administrateur
- Possibilité de rejet avec justification
- Traçabilité complète des décisions

## Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Stockage** : LocalStorage pour la démo
- **UI/UX** : Design moderne avec animations
- **Responsive** : Mobile-first approach
- **Icons** : Font Awesome 6
- **PDF** : jsPDF pour génération de contrats

## Installation et Utilisation

1. **Télécharger** les fichiers du projet
2. **Ouvrir** `creer site web.html` dans un navigateur
3. **Se connecter** avec un des comptes de test
4. **Explorer** les différentes fonctionnalités selon le rôle

## Fonctionnalités Avancées

### 📱 Paiement Mobile
- Intégration des opérateurs burkinabè
- Interface de paiement sécurisée
- Confirmation de transaction

### 📤 Partage Social
- Partage automatique sur les réseaux sociaux
- Génération de liens personnalisés
- Support multi-plateformes

### 📊 Statistiques Vendeur
- Nombre de produits publiés
- Valeur totale du catalogue
- Historique des ventes

## Structure des Fichiers

```
e-Yaar/
├── creer site web.html      # Page principale
├── auth.js                  # Système d'authentification
├── auth-ui.js              # Interface utilisateur auth
├── auth-styles.css         # Styles d'authentification
└── README.md               # Documentation
```

## Développement Futur

- [ ] Base de données backend
- [ ] Système de notifications
- [ ] Chat entre vendeurs et clients
- [ ] Système de livraison
- [ ] Gestion des commandes
- [ ] Système de commissions
- [ ] API mobile

## Support

Pour toute question ou suggestion, contactez l'équipe de développement e-Yaar.

---

**e-Yaar** - L'E-commerce Burkinabè du Futur 🚀 