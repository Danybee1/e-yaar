// E-Yaar - JavaScript Principal
class EYaarApp {
    constructor() {
        this.currentUser = null;
        this.cart = [];
        this.products = [];
        this.users = [];
        this.sellers = [];
        this.adminEmail = 'danielouedraogo1@gmail.com';
        this.adminPassword = 'daniel';
        this.commissionRate = 0.10; // 10%
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.displayProducts();
        this.updateCartCount();
    }

    // Gestion des données locales
    loadData() {
        this.products = JSON.parse(localStorage.getItem('eyaar_products')) || this.getDefaultProducts();
        this.users = JSON.parse(localStorage.getItem('eyaar_users')) || [];
        this.sellers = JSON.parse(localStorage.getItem('eyaar_sellers')) || [];
        this.cart = JSON.parse(localStorage.getItem('eyaar_cart')) || [];
    }

    saveData() {
        localStorage.setItem('eyaar_products', JSON.stringify(this.products));
        localStorage.setItem('eyaar_users', JSON.stringify(this.users));
        localStorage.setItem('eyaar_sellers', JSON.stringify(this.sellers));
        localStorage.setItem('eyaar_cart', JSON.stringify(this.cart));
    }

    // Produits par défaut
    getDefaultProducts() {
        return [
            {
                id: 1,
                name: "Téléphone Samsung Galaxy",
                price: 150000,
                seller: "TechStore BF",
                category: "Électronique",
                image: "https://via.placeholder.com/300x200?text=Samsung+Galaxy",
                description: "Téléphone intelligent de dernière génération"
            },
            {
                id: 2,
                name: "Sac traditionnel burkinabè",
                price: 25000,
                seller: "Artisanat Faso",
                category: "Artisanat",
                image: "https://via.placeholder.com/300x200?text=Sac+Traditionnel",
                description: "Sac artisanal fabriqué à la main"
            },
            {
                id: 3,
                name: "Huile de karité bio",
                price: 5000,
                seller: "Produits Naturels",
                category: "Beauté & Santé",
                image: "https://via.placeholder.com/300x200?text=Huile+Karite",
                description: "Huile de karité 100% naturelle"
            }
        ];
    }

    // Configuration des événements
    setupEventListeners() {
        // Formulaires de connexion/inscription
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('clientRegisterForm')?.addEventListener('submit', (e) => this.handleClientRegister(e));
        document.getElementById('sellerRegisterForm')?.addEventListener('submit', (e) => this.handleSellerRegister(e));
        document.getElementById('adminLoginForm')?.addEventListener('submit', (e) => this.handleAdminLogin(e));

        // Recherche
        document.querySelector('.search-btn')?.addEventListener('click', () => this.handleSearch());
        document.querySelector('.search-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Catégories
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByCategory(e.target.textContent));
        });
    }

    // Affichage des produits
    displayProducts(products = this.products) {
        const container = document.getElementById('products-container');
        if (!container) return;

        container.innerHTML = products.map(product => `
            <div class="col-md-4 col-lg-3">
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h5 class="product-title">${product.name}</h5>
                        <div class="product-price">${this.formatPrice(product.price)} FCFA</div>
                        <div class="product-seller">Vendeur: ${product.seller}</div>
                        <button class="add-to-cart-btn" onclick="app.addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Ajouter au panier
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Gestion de la recherche
    handleSearch() {
        const searchTerm = document.querySelector('.search-input').value.toLowerCase();
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.seller.toLowerCase().includes(searchTerm)
        );
        this.displayProducts(filteredProducts);
    }

    // Filtrage par catégorie
    filterByCategory(category) {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        if (category === 'Toutes catégories') {
            this.displayProducts();
        } else {
            const filteredProducts = this.products.filter(product => product.category === category);
            this.displayProducts(filteredProducts);
        }
    }

    // Gestion du panier
    addToCart(productId) {
        if (!this.currentUser) {
            this.showAlert('Veuillez vous connecter pour ajouter des produits au panier', 'warning');
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                productId: productId,
                product: product,
                quantity: 1
            });
        }

        this.saveData();
        this.updateCartCount();
        this.showAlert('Produit ajouté au panier', 'success');
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // Authentification
    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        // Vérifier les utilisateurs
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            this.showAlert('Connexion réussie', 'success');
            this.closeModal('loginModal');
            this.updateUI();
            return;
        }

        // Vérifier les vendeurs
        const seller = this.sellers.find(s => s.email === email && s.password === password);
        if (seller) {
            this.currentUser = { ...seller, type: 'seller' };
            this.showAlert('Connexion vendeur réussie', 'success');
            this.closeModal('loginModal');
            this.updateUI();
            return;
        }

        this.showAlert('Email ou mot de passe incorrect', 'danger');
    }

    handleClientRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        if (formData.get('password') !== formData.get('confirmPassword')) {
            this.showAlert('Les mots de passe ne correspondent pas', 'danger');
            return;
        }

        const newUser = {
            id: Date.now(),
            type: 'client',
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            createdAt: new Date().toISOString()
        };

        if (this.users.find(u => u.email === newUser.email)) {
            this.showAlert('Cet email est déjà utilisé', 'danger');
            return;
        }

        this.users.push(newUser);
        this.saveData();
        this.showAlert('Compte client créé avec succès', 'success');
        this.closeModal('registerModal');
    }

    handleSellerRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        if (formData.get('password') !== formData.get('confirmPassword')) {
            this.showAlert('Les mots de passe ne correspondent pas', 'danger');
            return;
        }

        if (!document.getElementById('contractAgreement').checked) {
            this.showAlert('Vous devez accepter le contrat de vendeur', 'danger');
            return;
        }

        const newSeller = {
            id: Date.now(),
            type: 'seller',
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            paymentNumber: formData.get('paymentNumber'),
            password: formData.get('password'),
            contractSigned: true,
            contractDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        if (this.sellers.find(s => s.email === newSeller.email)) {
            this.showAlert('Cet email est déjà utilisé', 'danger');
            return;
        }

        this.sellers.push(newSeller);
        this.saveData();
        this.showAlert('Compte vendeur créé avec succès. Vous pouvez maintenant publier des articles.', 'success');
        this.closeModal('registerModal');
    }

    handleAdminLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const password = formData.get('password');

        if (password === this.adminPassword) {
            this.currentUser = { type: 'admin', email: this.adminEmail };
            sessionStorage.setItem('eyaar_admin', 'true');
            this.showAlert('Connexion administrateur réussie', 'success');
            this.closeModal('adminLoginModal');
            window.location.href = 'admin.html';
        } else {
            this.showAlert('Mot de passe administrateur incorrect', 'danger');
        }
    }

    // Connexion sociale (simulation)
    loginWithGoogle() {
        this.showAlert('Connexion Google en cours de développement', 'info');
    }

    loginWithFacebook() {
        this.showAlert('Connexion Facebook en cours de développement', 'info');
    }

    // Gestion des paiements
    processPayment(order) {
        const totalAmount = order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const commission = totalAmount * this.commissionRate;
        const sellerAmount = totalAmount - commission;

        // Simuler l'envoi de la commission
        this.sendCommission(commission, order.seller.paymentNumber);

        return {
            success: true,
            totalAmount,
            commission,
            sellerAmount,
            paymentInstructions: `Payer ${this.formatPrice(totalAmount)} FCFA au ${order.seller.paymentNumber}`
        };
    }

    sendCommission(amount, sellerPaymentNumber) {
        // Simulation de l'envoi de commission
        console.log(`Commission de ${this.formatPrice(amount)} FCFA envoyée au vendeur ${sellerPaymentNumber}`);
        console.log(`Commission de ${this.formatPrice(amount)} FCFA reçue sur Orange Money: +226 66841181`);
    }

    // Utilitaires
    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR').format(price);
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.insertBefore(alertDiv, document.body.firstChild);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    closeModal(modalId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        if (modal) modal.hide();
    }

    updateUI() {
        if (this.currentUser) {
            const authLinks = document.querySelectorAll('.auth-link');
            authLinks.forEach(link => {
                link.textContent = `Bonjour ${this.currentUser.firstName}`;
                link.onclick = () => this.logout();
            });
        }
    }

    logout() {
        this.currentUser = null;
        this.cart = [];
        this.saveData();
        this.updateCartCount();
        this.updateUI();
        location.reload();
    }

    // Redirection vers le panneau d'administration
    openAdminPanel() {
        window.location.href = 'admin.html';
    }


}

// Fonctions globales pour les modals
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function showRegisterModal() {
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
}

function showAdminLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
    modal.show();
}

function showCart() {
    if (!app.currentUser) {
        showLoginModal();
        return;
    }
    // Implémenter l'affichage du panier
    app.showAlert('Fonctionnalité panier en cours de développement', 'info');
}

// Initialisation de l'application
const app = new EYaarApp();

// Ajouter un lien d'administration discret
document.addEventListener('DOMContentLoaded', function() {
    const adminLink = document.createElement('a');
    adminLink.href = '#';
    adminLink.textContent = 'Admin';
    adminLink.style.cssText = 'position: fixed; bottom: 10px; right: 10px; color: #ccc; text-decoration: none; font-size: 12px;';
    adminLink.onclick = (e) => {
        e.preventDefault();
        showAdminLoginModal();
    };
    document.body.appendChild(adminLink);
}); 