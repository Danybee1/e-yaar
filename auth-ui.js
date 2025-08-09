// Interface utilisateur pour l'authentification e-Yaar
class AuthUI {
    constructor() {
        this.currentView = 'login';
        this.init();
    }

    init() {
        this.updateHeader();
        
        // Écouter les changements d'état d'authentification
        document.addEventListener('authStateChanged', (event) => {
            this.handleAuthStateChange(event.detail);
        });
        
        // Afficher le formulaire approprié selon l'état de connexion
        if (auth.isLoggedIn()) {
            this.showMainContent();
        } else {
            this.showLoginForm();
        }
    }

    // Gérer les changements d'état d'authentification
    handleAuthStateChange(detail) {
        this.updateHeader();
        
        if (detail.type === 'login') {
            this.showMainContent();
        } else if (detail.type === 'logout') {
            this.showLoginForm();
        }
    }

    // Mettre à jour l'en-tête selon le statut de connexion
    updateHeader() {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        if (auth.isLoggedIn()) {
            const user = auth.getCurrentUser();
            navLinks.innerHTML = `
                <li><a href="#home"><i class="fas fa-home"></i> Accueil</a></li>
                <li><a href="#products"><i class="fas fa-store"></i> Produits</a></li>
                ${auth.isMerchant() ? '<li><a href="#merchant"><i class="fas fa-store-alt"></i> Espace Vendeur</a></li>' : ''}
                ${auth.isAdmin() ? '<li><a href="#admin"><i class="fas fa-cog"></i> Administration</a></li>' : ''}
                <li><a href="#" onclick="authUI.showProfile()"><i class="fas fa-user"></i> ${user.name}</a></li>
                <li><a href="#" onclick="auth.logout()" class="btn btn-primary">Déconnexion</a></li>
            `;
        } else {
            navLinks.innerHTML = `
                <li><a href="#home"><i class="fas fa-home"></i> Accueil</a></li>
                <li><a href="#products"><i class="fas fa-store"></i> Produits</a></li>
                <li><a href="#" onclick="authUI.showLoginForm()">Connexion</a></li>
                <li><a href="#" onclick="authUI.showRegisterForm()" class="btn btn-primary">Inscription</a></li>
            `;
        }
    }

    // Afficher le formulaire de connexion
    showLoginForm() {
        // Vérifier si l'utilisateur est déjà connecté
        if (auth.isLoggedIn()) {
            this.showMainContent();
            return;
        }

        const mainContainer = document.querySelector('.main-container');
        mainContainer.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h2><i class="fas fa-sign-in-alt"></i> Connexion</h2>
                        <p>Connectez-vous à votre compte e-Yaar</p>
                    </div>
                    
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="loginPassword">Mot de passe</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-full">
                            <i class="fas fa-sign-in-alt"></i> Se connecter
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Pas encore de compte ? <a href="#" onclick="authUI.showRegisterForm()">S'inscrire</a></p>
                    </div>
                    
                    <div id="loginMessage" class="message"></div>
                </div>
            </div>
        `;

        this.setupLoginForm();
    }

    // Afficher le formulaire d'inscription
    showRegisterForm() {
        // Vérifier si l'utilisateur est déjà connecté
        if (auth.isLoggedIn()) {
            this.showMainContent();
            return;
        }

        const mainContainer = document.querySelector('.main-container');
        mainContainer.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h2><i class="fas fa-user-plus"></i> Inscription</h2>
                        <p>Créez votre compte e-Yaar</p>
                    </div>
                    
                    <form id="registerForm" class="auth-form">
                        <div class="form-group">
                            <label for="registerName">Nom complet</label>
                            <input type="text" id="registerName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="registerEmail">Email</label>
                            <input type="email" id="registerEmail" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="registerPhone">Téléphone</label>
                            <input type="tel" id="registerPhone" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="registerPassword">Mot de passe</label>
                            <input type="password" id="registerPassword" required minlength="6">
                        </div>
                        
                        <div class="form-group">
                            <label for="registerPasswordConfirm">Confirmer le mot de passe</label>
                            <input type="password" id="registerPasswordConfirm" required minlength="6">
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-full">
                            <i class="fas fa-user-plus"></i> S'inscrire
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Déjà un compte ? <a href="#" onclick="authUI.showLoginForm()">Se connecter</a></p>
                    </div>
                    
                    <div id="registerMessage" class="message"></div>
                </div>
            </div>
        `;

        this.setupRegisterForm();
    }

    // Afficher le profil utilisateur
    showProfile() {
        if (!auth.isLoggedIn()) {
            this.showLoginForm();
            return;
        }

        const user = auth.getCurrentUser();
        const contract = auth.getCurrentUserContract();
        
        const mainContainer = document.querySelector('.main-container');
        mainContainer.innerHTML = `
            <div class="profile-container">
                <div class="profile-card">
                    <div class="profile-header">
                        <h2><i class="fas fa-user"></i> Mon Profil</h2>
                    </div>
                    
                    <div class="profile-info">
                        <div class="info-group">
                            <label>Nom complet:</label>
                            <span>${user.name}</span>
                        </div>
                        
                        <div class="info-group">
                            <label>Email:</label>
                            <span>${user.email}</span>
                        </div>
                        
                        <div class="info-group">
                            <label>Téléphone:</label>
                            <span>${user.phone}</span>
                        </div>
                        
                        <div class="info-group">
                            <label>Rôle:</label>
                            <span class="role-badge role-${user.role}">
                                ${this.getRoleLabel(user.role)}
                            </span>
                        </div>
                        
                        <div class="info-group">
                            <label>Membre depuis:</label>
                            <span>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                    
                    ${user.role === 'client' ? `
                        <div class="merchant-section">
                            <h3><i class="fas fa-store"></i> Devenir Vendeur</h3>
                            <p>Pour publier des articles, vous devez devenir vendeur en signant un contrat.</p>
                            <button class="btn btn-primary" onclick="authUI.showMerchantContract()">
                                <i class="fas fa-file-contract"></i> Signer le Contrat Vendeur
                            </button>
                        </div>
                    ` : ''}
                    
                    ${user.role === 'merchant' ? `
                        <div class="merchant-section">
                            <h3><i class="fas fa-store-alt"></i> Statut Vendeur</h3>
                            ${contract ? `
                                <div class="contract-status">
                                    <p><strong>Statut du contrat:</strong> 
                                        <span class="status-badge status-${contract.status}">
                                            ${this.getContractStatusLabel(contract.status)}
                                        </span>
                                    </p>
                                    <p><strong>Soumis le:</strong> ${new Date(contract.submittedAt).toLocaleDateString('fr-FR')}</p>
                                    ${contract.status === 'approved' ? `
                                        <p><strong>Approuvé le:</strong> ${new Date(contract.approvedAt).toLocaleDateString('fr-FR')}</p>
                                    ` : ''}
                                    ${contract.status === 'rejected' ? `
                                        <p><strong>Rejeté le:</strong> ${new Date(contract.rejectedAt).toLocaleDateString('fr-FR')}</p>
                                        <p><strong>Raison:</strong> ${contract.rejectionReason}</p>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    <div class="profile-actions">
                        <button class="btn btn-secondary" onclick="authUI.showMainContent()">
                            <i class="fas fa-home"></i> Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Afficher le formulaire de contrat vendeur
    showMerchantContract() {
        if (!auth.isLoggedIn()) {
            this.showLoginForm();
            return;
        }

        const user = auth.getCurrentUser();
        if (user.role !== 'client') {
            this.showProfile();
            return;
        }

        const mainContainer = document.querySelector('.main-container');
        mainContainer.innerHTML = `
            <div class="contract-container">
                <div class="contract-card">
                    <div class="contract-header">
                        <h2><i class="fas fa-file-contract"></i> Contrat Vendeur</h2>
                        <p>Remplissez ce formulaire pour devenir vendeur sur e-Yaar</p>
                    </div>
                    
                    <form id="merchantContractForm" class="contract-form">
                        <div class="form-group">
                            <label for="merchantName">Nom et Prénom *</label>
                            <input type="text" id="merchantName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="merchantEmail">Email *</label>
                            <input type="email" id="merchantEmail" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="merchantPhone">Téléphone *</label>
                            <input type="tel" id="merchantPhone" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="merchantAddress">Adresse complète *</label>
                            <textarea id="merchantAddress" rows="3" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="companyName">Nom de l'entreprise</label>
                            <input type="text" id="companyName">
                        </div>
                        
                        <div class="form-group">
                            <label for="businessType">Type d'activité *</label>
                            <select id="businessType" required>
                                <option value="">Sélectionnez...</option>
                                <option value="Vêtements">Vêtements</option>
                                <option value="Électronique">Électronique</option>
                                <option value="Alimentation">Alimentation</option>
                                <option value="Artisanat">Artisanat</option>
                                <option value="Beauté">Beauté</option>
                                <option value="Loisirs">Loisirs</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="taxId">Numéro d'identification fiscale</label>
                            <input type="text" id="taxId">
                        </div>
                        
                        <div class="form-group">
                            <label for="bankAccount">Compte bancaire</label>
                            <input type="text" id="bankAccount">
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-full">
                            <i class="fas fa-file-pdf"></i> Soumettre le Contrat
                        </button>
                    </form>
                    
                    <div class="contract-footer">
                        <button class="btn btn-secondary" onclick="authUI.showProfile()">
                            <i class="fas fa-arrow-left"></i> Retour au profil
                        </button>
                    </div>
                    
                    <div id="contractMessage" class="message"></div>
                </div>
            </div>
        `;

        this.setupMerchantContractForm();
    }

    // Afficher l'espace vendeur
    showMerchantSpace() {
        if (!auth.isLoggedIn()) {
            this.showLoginForm();
            return;
        }

        if (!auth.isMerchant()) {
            this.showMessage('general', 'Accès réservé aux vendeurs', 'error');
            return;
        }

        const mainContainer = document.querySelector('.main-container');
        mainContainer.innerHTML = `
            <div class="merchant-container">
                <div class="merchant-header">
                    <h2><i class="fas fa-store-alt"></i> Espace Vendeur</h2>
                    <p>Gérez vos produits et vos ventes</p>
                </div>
                
                <div class="merchant-stats">
                    <div class="stat-card">
                        <i class="fas fa-box"></i>
                        <h3>Mes Produits</h3>
                        <p>0 produits publiés</p>
                    </div>
                    
                    <div class="stat-card">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Ventes</h3>
                        <p>0 ventes réalisées</p>
                    </div>
                    
                    <div class="stat-card">
                        <i class="fas fa-money-bill-wave"></i>
                        <h3>Revenus</h3>
                        <p>0 FCFA gagnés</p>
                    </div>
                </div>
                
                <div class="merchant-actions">
                    <button class="btn btn-primary" onclick="authUI.showAddProductForm()">
                        <i class="fas fa-plus"></i> Ajouter un Produit
                    </button>
                    
                    <button class="btn btn-secondary" onclick="authUI.showMyProducts()">
                        <i class="fas fa-list"></i> Mes Produits
                    </button>
                </div>
                
                <div class="merchant-footer">
                    <button class="btn btn-secondary" onclick="authUI.showMainContent()">
                        <i class="fas fa-home"></i> Retour à l'accueil
                    </button>
                </div>
            </div>
        `;
    }

    // Afficher l'administration
    showAdmin() {
        if (!auth.isLoggedIn()) {
            this.showLoginForm();
            return;
        }

        if (!auth.isAdmin()) {
            this.showMessage('general', 'Accès non autorisé', 'error');
            return;
        }

        const contracts = auth.getAllContracts();
        const merchants = auth.getAllMerchants();

        const mainContainer = document.querySelector('.main-container');
        mainContainer.innerHTML = `
            <div class="admin-container">
                <div class="admin-header">
                    <h2><i class="fas fa-cog"></i> Administration</h2>
                    <p>Gérez les utilisateurs et les contrats</p>
                </div>
                
                <div class="admin-stats">
                    <div class="stat-card">
                        <i class="fas fa-users"></i>
                        <h3>Utilisateurs</h3>
                        <p>${auth.users.length} utilisateurs</p>
                    </div>
                    
                    <div class="stat-card">
                        <i class="fas fa-store"></i>
                        <h3>Vendeurs</h3>
                        <p>${merchants.length} vendeurs</p>
                    </div>
                    
                    <div class="stat-card">
                        <i class="fas fa-file-contract"></i>
                        <h3>Contrats</h3>
                        <p>${contracts.length} contrats</p>
                    </div>
                </div>
                
                <div class="admin-sections">
                    <div class="admin-section">
                        <h3><i class="fas fa-file-contract"></i> Contrats en Attente</h3>
                        <div class="contracts-list">
                            ${contracts.filter(c => c.status === 'pending').map(contract => `
                                <div class="contract-item">
                                    <div class="contract-info">
                                        <h4>${contract.merchantName}</h4>
                                        <p>${contract.merchantEmail} - ${contract.businessType}</p>
                                        <p>Soumis le: ${new Date(contract.submittedAt).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <div class="contract-actions">
                                        <button class="btn btn-success btn-small" onclick="authUI.approveContract('${contract.id}')">
                                            <i class="fas fa-check"></i> Approuver
                                        </button>
                                        <button class="btn btn-danger btn-small" onclick="authUI.rejectContract('${contract.id}')">
                                            <i class="fas fa-times"></i> Rejeter
                                        </button>
                                    </div>
                                </div>
                            `).join('') || '<p>Aucun contrat en attente</p>'}
                        </div>
                    </div>
                </div>
                
                <div class="admin-footer">
                    <button class="btn btn-secondary" onclick="authUI.showMainContent()">
                        <i class="fas fa-home"></i> Retour à l'accueil
                    </button>
                </div>
            </div>
        `;
    }

    // Afficher le contenu principal
    showMainContent() {
        if (!auth.isLoggedIn()) {
            this.showLoginForm();
            return;
        }

        // Au lieu de recharger la page, on affiche le contenu principal
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            // Vérifier si le contenu principal est déjà affiché
            if (mainContainer.querySelector('.hero-section')) {
                return; // Le contenu principal est déjà affiché
            }
            
            // Afficher le contenu principal
            mainContainer.innerHTML = `
                <!-- Section Héro -->
                <section class="hero-section" id="home">
                    <h1 class="hero-title">e-Yaar</h1>
                    <p class="hero-subtitle">L'E-commerce Burkinabè du Futur</p>
                    <p>Découvrez les meilleurs produits locaux et internationaux</p>
                </section>

                <!-- Section Contrat Électronique -->
                <section class="card" id="contract">
                    <h2><i class="fas fa-file-contract"></i> Contrat Électronique Vendeur</h2>
                    <p>Pour publier vos articles, veuillez remplir ce contrat électronique. Une copie PDF sera envoyée sur Telegram.</p>
                    
                    <form id="contractForm" class="contract-form">
                        <div class="form-group">
                            <label for="merchantName">Nom et Prénom *</label>
                            <input type="text" id="merchantName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="merchantEmail">Email *</label>
                            <input type="email" id="merchantEmail" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="merchantPhone">Téléphone *</label>
                            <input type="tel" id="merchantPhone" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="merchantAddress">Adresse complète *</label>
                            <textarea id="merchantAddress" rows="3" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="companyName">Nom de l'entreprise</label>
                            <input type="text" id="companyName">
                        </div>
                        
                        <div class="form-group">
                            <label for="businessType">Type d'activité *</label>
                            <select id="businessType" required>
                                <option value="">Sélectionnez...</option>
                                <option value="Vêtements">Vêtements</option>
                                <option value="Électronique">Électronique</option>
                                <option value="Alimentation">Alimentation</option>
                                <option value="Artisanat">Artisanat</option>
                                <option value="Beauté">Beauté</option>
                                <option value="Loisirs">Loisirs</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="taxId">Numéro d'identification fiscale</label>
                            <input type="text" id="taxId">
                        </div>
                        
                        <div class="form-group">
                            <label for="bankAccount">Compte bancaire</label>
                            <input type="text" id="bankAccount">
                        </div>
                    </form>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="generateContract()">
                            <i class="fas fa-file-pdf"></i> Générer et Envoyer le Contrat
                        </button>
                    </div>
                    
                    <div id="contractMessage" class="message"></div>
                </section>

                <!-- Section Ajout de Produits -->
                <section class="card" id="products">
                    <h2><i class="fas fa-plus-circle"></i> Publier un Article</h2>
                    <form id="addProductForm" class="contract-form">
                        <div class="form-group">
                            <label for="productTitle">Nom de l'article *</label>
                            <input type="text" id="productTitle" required maxlength="100">
                        </div>
                        
                        <div class="form-group">
                            <label for="productPrice">Prix (FCFA) *</label>
                            <input type="number" id="productPrice" required min="100" max="1000000">
                        </div>
                        
                        <div class="form-group">
                            <label for="productImage">Image de l'article *</label>
                            <div style="position: relative;">
                                <input type="file" id="productImage" accept="image/*" required style="display: none;">
                                <div id="imageUploadArea" style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.3s ease; background: var(--background-color);">
                                    <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                                    <p style="color: var(--text-light); margin-bottom: 0.5rem;">Cliquez pour sélectionner une image</p>
                                    <p style="font-size: 0.8rem; color: var(--text-light);">ou glissez-déposez votre image ici</p>
                                </div>
                                <div id="imagePreview" style="display: none; margin-top: 1rem;">
                                    <img id="previewImg" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid var(--border-color);">
                                    <button type="button" onclick="removeImage()" class="remove-image-btn">
                                        <i class="fas fa-trash"></i> Supprimer l'image
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="productDescription">Description</label>
                            <textarea id="productDescription" rows="3"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="productCategory">Catégorie *</label>
                            <select id="productCategory" required>
                                <option value="">Sélectionnez...</option>
                                <option value="Vêtements">Vêtements</option>
                                <option value="Électronique">Électronique</option>
                                <option value="Alimentation">Alimentation</option>
                                <option value="Artisanat">Artisanat</option>
                                <option value="Beauté">Beauté</option>
                                <option value="Loisirs">Loisirs</option>
                            </select>
                        </div>
                    </form>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="addProduct()">
                            <i class="fas fa-upload"></i> Publier l'Article
                        </button>
                    </div>
                    
                    <div id="productMessage" class="message"></div>
                </section>

                <!-- Section Produits -->
                <section class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2><i class="fas fa-store"></i> Articles Disponibles</h2>
                        <span id="productCount" style="color: var(--text-light); font-size: 0.9rem;"></span>
                    </div>
                    
                    <!-- Barre de recherche et filtres -->
                    <div class="search-filters">
                        <div class="search-box">
                            <input type="text" id="searchInput" placeholder="Rechercher un produit..." class="search-input">
                            <button class="search-btn" onclick="searchProducts()">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                        <div class="filters">
                            <select id="categoryFilter" onchange="filterProducts()">
                                <option value="">Toutes les catégories</option>
                                <option value="Vêtements">Vêtements</option>
                                <option value="Électronique">Électronique</option>
                                <option value="Alimentation">Alimentation</option>
                                <option value="Artisanat">Artisanat</option>
                                <option value="Beauté">Beauté</option>
                                <option value="Loisirs">Loisirs</option>
                            </select>
                            <select id="priceFilter" onchange="filterProducts()">
                                <option value="">Tous les prix</option>
                                <option value="0-5000">Moins de 5000 FCFA</option>
                                <option value="5000-15000">5000 - 15000 FCFA</option>
                                <option value="15000-50000">15000 - 50000 FCFA</option>
                                <option value="50000+">Plus de 50000 FCFA</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="loading" id="loading">
                        <div class="spinner"></div>
                        <p>Chargement des produits...</p>
                    </div>
                    <div class="products-grid" id="productsList">
                        <!-- Les produits seront affichés ici -->
                    </div>
                </section>
            `;
            
            // Initialiser les fonctionnalités après l'affichage
            // Ces fonctions sont définies dans le fichier principal
            setTimeout(() => {
                if (typeof renderProducts === 'function') {
                    renderProducts();
                }
                if (typeof setupEventListeners === 'function') {
                    setupEventListeners();
                }
                if (typeof checkUserPermissions === 'function') {
                    checkUserPermissions();
                }
            }, 100);
        }
    }

    // Configuration des formulaires
    setupLoginForm() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    setupRegisterForm() {
        const form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    setupMerchantContractForm() {
        const form = document.getElementById('merchantContractForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMerchantContract();
            });
        }
    }

    // Gestion de la connexion
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            auth.login(email, password);
            // L'événement authStateChanged sera déclenché automatiquement
        } catch (error) {
            this.showMessage('loginMessage', error.message, 'error');
        }
    }

    // Gestion de l'inscription
    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        if (password !== passwordConfirm) {
            this.showMessage('registerMessage', 'Les mots de passe ne correspondent pas', 'error');
            return;
        }

        try {
            auth.register({ name, email, phone, password });
            this.showMessage('registerMessage', 'Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
            setTimeout(() => this.showLoginForm(), 2000);
        } catch (error) {
            this.showMessage('registerMessage', error.message, 'error');
        }
    }

    // Gestion du contrat vendeur
    handleMerchantContract() {
        const contractData = {
            merchantName: document.getElementById('merchantName').value,
            merchantEmail: document.getElementById('merchantEmail').value,
            merchantPhone: document.getElementById('merchantPhone').value,
            merchantAddress: document.getElementById('merchantAddress').value,
            companyName: document.getElementById('companyName').value,
            businessType: document.getElementById('businessType').value,
            taxId: document.getElementById('taxId').value,
            bankAccount: document.getElementById('bankAccount').value
        };

        try {
            auth.submitMerchantContract(contractData);
            this.showMessage('contractMessage', 'Contrat soumis avec succès ! Il sera examiné par l\'administration.', 'success');
            setTimeout(() => this.showProfile(), 2000);
        } catch (error) {
            this.showMessage('contractMessage', error.message, 'error');
        }
    }

    // Approuver un contrat (admin)
    approveContract(contractId) {
        try {
            auth.approveMerchantContract(contractId, auth.getCurrentUser().id);
            this.showAdmin(); // Recharger la vue admin
        } catch (error) {
            this.showMessage('general', error.message, 'error');
        }
    }

    // Rejeter un contrat (admin)
    rejectContract(contractId) {
        const reason = prompt('Raison du rejet:');
        if (reason) {
            try {
                auth.rejectMerchantContract(contractId, auth.getCurrentUser().id, reason);
                this.showAdmin(); // Recharger la vue admin
            } catch (error) {
                this.showMessage('general', error.message, 'error');
            }
        }
    }

    // Afficher un message
    showMessage(elementId, message, type = 'success') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = `message ${type}`;
            element.style.display = 'block';
            
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }

    // Obtenir le libellé du rôle
    getRoleLabel(role) {
        const labels = {
            'client': 'Client',
            'merchant': 'Vendeur',
            'admin': 'Administrateur'
        };
        return labels[role] || role;
    }

    // Obtenir le libellé du statut de contrat
    getContractStatusLabel(status) {
        const labels = {
            'pending': 'En attente',
            'approved': 'Approuvé',
            'rejected': 'Rejeté'
        };
        return labels[status] || status;
    }
}

// Instance globale
const authUI = new AuthUI(); 