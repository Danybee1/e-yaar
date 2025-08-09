// E-Yaar - Administration JavaScript
class EYaarAdmin {
    constructor() {
        this.currentSection = 'dashboard';
        this.users = [];
        this.sellers = [];
        this.products = [];
        this.orders = [];
        this.commissionRate = 0.10; // 10%
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDashboard();
        this.checkAuth();
    }

    // Vérification de l'authentification
    checkAuth() {
        const isAdmin = sessionStorage.getItem('eyaar_admin');
        if (!isAdmin) {
            // Rediriger vers la page de connexion admin
            window.location.href = 'index.html';
        }
    }

    // Gestion des données
    loadData() {
        this.users = JSON.parse(localStorage.getItem('eyaar_users')) || [];
        this.sellers = JSON.parse(localStorage.getItem('eyaar_sellers')) || [];
        this.products = JSON.parse(localStorage.getItem('eyaar_products')) || [];
        this.orders = JSON.parse(localStorage.getItem('eyaar_orders')) || [];
    }

    saveData() {
        localStorage.setItem('eyaar_users', JSON.stringify(this.users));
        localStorage.setItem('eyaar_sellers', JSON.stringify(this.sellers));
        localStorage.setItem('eyaar_products', JSON.stringify(this.products));
        localStorage.setItem('eyaar_orders', JSON.stringify(this.orders));
    }

    // Configuration des événements
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Formulaire de changement de mot de passe
        document.getElementById('adminSettingsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.changeAdminPassword();
        });

        // Formulaire d'ajout de produit
        document.getElementById('addProductForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });
    }

    // Navigation entre sections
    showSection(section) {
        // Masquer toutes les sections
        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.remove('active');
        });

        // Désactiver tous les liens
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Afficher la section demandée
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Activer le lien correspondant
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Mettre à jour le titre
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = this.getSectionTitle(section);
        }

        this.currentSection = section;
        this.loadSectionData(section);
    }

    getSectionTitle(section) {
        const titles = {
            'dashboard': 'Tableau de bord',
            'users': 'Gestion des utilisateurs',
            'sellers': 'Gestion des vendeurs',
            'products': 'Gestion des produits',
            'orders': 'Gestion des commandes',
            'commissions': 'Gestion des commissions',
            'settings': 'Paramètres'
        };
        return titles[section] || 'Administration';
    }

    // Charger les données de la section
    loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'sellers':
                this.loadSellers();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'commissions':
                this.loadCommissions();
                break;
        }
    }

    // Tableau de bord
    updateDashboard() {
        // Statistiques
        document.getElementById('totalUsers').textContent = this.users.length;
        document.getElementById('totalSellers').textContent = this.sellers.length;
        document.getElementById('totalProducts').textContent = this.products.length;
        
        // Calculer les revenus (simulation)
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.commission, 0);
        document.getElementById('totalRevenue').textContent = this.formatPrice(totalRevenue) + ' FCFA';

        // Derniers utilisateurs
        this.loadRecentUsers();
        
        // Derniers vendeurs
        this.loadRecentSellers();
    }

    loadRecentUsers() {
        const recentUsers = this.users.slice(-5).reverse();
        const container = document.getElementById('recentUsers');
        
        if (container) {
            container.innerHTML = recentUsers.map(user => `
                <div class="recent-item">
                    <div class="recent-item-avatar">
                        ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                    </div>
                    <div class="recent-item-info">
                        <h6>${user.firstName} ${user.lastName}</h6>
                        <p>${user.email} • ${new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    loadRecentSellers() {
        const recentSellers = this.sellers.slice(-5).reverse();
        const container = document.getElementById('recentSellers');
        
        if (container) {
            container.innerHTML = recentSellers.map(seller => `
                <div class="recent-item">
                    <div class="recent-item-avatar">
                        ${seller.firstName.charAt(0)}${seller.lastName.charAt(0)}
                    </div>
                    <div class="recent-item-info">
                        <h6>${seller.firstName} ${seller.lastName}</h6>
                        <p>${seller.email} • ${seller.contractSigned ? 'Contrat signé' : 'En attente'}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    // Gestion des utilisateurs
    loadUsers() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    deleteUser(userId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            this.users = this.users.filter(user => user.id !== userId);
            this.saveData();
            this.loadUsers();
            this.updateDashboard();
            this.showAlert('Utilisateur supprimé avec succès', 'success');
        }
    }

    // Gestion des vendeurs
    loadSellers() {
        const tbody = document.getElementById('sellersTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.sellers.map(seller => `
            <tr>
                <td>${seller.id}</td>
                <td>${seller.firstName} ${seller.lastName}</td>
                <td>${seller.email}</td>
                <td>${seller.phone}</td>
                <td>${seller.paymentNumber}</td>
                <td>
                    <span class="badge ${seller.contractSigned ? 'badge-success' : 'badge-warning'}">
                        ${seller.contractSigned ? 'Oui' : 'Non'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="admin.toggleSellerStatus(${seller.id})">
                        <i class="fas fa-toggle-on"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteSeller(${seller.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    toggleSellerStatus(sellerId) {
        const seller = this.sellers.find(s => s.id === sellerId);
        if (seller) {
            seller.contractSigned = !seller.contractSigned;
            this.saveData();
            this.loadSellers();
            this.showAlert(`Statut du vendeur ${seller.contractSigned ? 'activé' : 'désactivé'}`, 'success');
        }
    }

    deleteSeller(sellerId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ?')) {
            this.sellers = this.sellers.filter(seller => seller.id !== sellerId);
            this.saveData();
            this.loadSellers();
            this.updateDashboard();
            this.showAlert('Vendeur supprimé avec succès', 'success');
        }
    }

    // Gestion des produits
    loadProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>
                    <img src="${product.image}" alt="${product.name}" class="product-image-small">
                </td>
                <td>${product.name}</td>
                <td>${this.formatPrice(product.price)} FCFA</td>
                <td>${product.seller}</td>
                <td>${product.category}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="admin.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Mettre à jour la liste des vendeurs dans le modal
        this.updateSellerSelect();
    }

    updateSellerSelect() {
        const select = document.querySelector('select[name="seller"]');
        if (select) {
            select.innerHTML = '<option value="">Sélectionner un vendeur</option>' +
                this.sellers.map(seller => 
                    `<option value="${seller.firstName} ${seller.lastName}">${seller.firstName} ${seller.lastName}</option>`
                ).join('');
        }
    }

    addProduct() {
        const form = document.getElementById('addProductForm');
        const formData = new FormData(form);
        
        const newProduct = {
            id: Date.now(),
            name: formData.get('name'),
            price: parseInt(formData.get('price')),
            seller: formData.get('seller'),
            category: formData.get('category'),
            description: formData.get('description'),
            image: formData.get('image') || 'https://via.placeholder.com/300x200?text=Produit',
            createdAt: new Date().toISOString()
        };

        this.products.push(newProduct);
        this.saveData();
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        if (modal) modal.hide();
        
        // Réinitialiser le formulaire
        form.reset();
        
        // Recharger les produits
        this.loadProducts();
        this.updateDashboard();
        
        this.showAlert('Produit ajouté avec succès', 'success');
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // Implémenter l'édition de produit
            this.showAlert('Fonctionnalité d\'édition en cours de développement', 'info');
        }
    }

    deleteProduct(productId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            this.products = this.products.filter(product => product.id !== productId);
            this.saveData();
            this.loadProducts();
            this.updateDashboard();
            this.showAlert('Produit supprimé avec succès', 'success');
        }
    }

    // Gestion des commandes
    loadOrders() {
        const container = document.getElementById('ordersContent');
        if (!container) return;

        if (this.orders.length === 0) {
            container.innerHTML = '<p>Aucune commande pour le moment</p>';
        } else {
            container.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Client</th>
                                <th>Produits</th>
                                <th>Total</th>
                                <th>Commission</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.orders.map(order => `
                                <tr>
                                    <td>${order.id}</td>
                                    <td>${order.customerName}</td>
                                    <td>${order.items.length} produit(s)</td>
                                    <td>${this.formatPrice(order.total)} FCFA</td>
                                    <td>${this.formatPrice(order.commission)} FCFA</td>
                                    <td>${new Date(order.date).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    // Gestion des commissions
    loadCommissions() {
        const totalCommissions = this.orders.reduce((sum, order) => sum + order.commission, 0);
        
        // Afficher les informations de commission
        const container = document.querySelector('#commissions .admin-card');
        if (container) {
            const commissionInfo = container.querySelector('.commission-info');
            if (commissionInfo) {
                commissionInfo.innerHTML += `
                    <div class="mt-3">
                        <h6>Statistiques des commissions</h6>
                        <p><strong>Total des commissions:</strong> ${this.formatPrice(totalCommissions)} FCFA</p>
                        <p><strong>Nombre de transactions:</strong> ${this.orders.length}</p>
                        <p><strong>Commission moyenne:</strong> ${this.orders.length > 0 ? this.formatPrice(totalCommissions / this.orders.length) : '0'} FCFA</p>
                    </div>
                `;
            }
        }
    }

    changeCommissionRate() {
        const newRate = prompt('Nouveau taux de commission (en pourcentage):', this.commissionRate * 100);
        if (newRate !== null && !isNaN(newRate)) {
            this.commissionRate = parseFloat(newRate) / 100;
            this.showAlert(`Taux de commission mis à jour: ${newRate}%`, 'success');
        }
    }

    // Paramètres administrateur
    changeAdminPassword() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            this.showAlert('Les mots de passe ne correspondent pas', 'danger');
            return;
        }

        if (newPassword.length < 6) {
            this.showAlert('Le mot de passe doit contenir au moins 6 caractères', 'danger');
            return;
        }

        // Simuler le changement de mot de passe
        localStorage.setItem('eyaar_admin_password', newPassword);
        
        // Réinitialiser le formulaire
        document.getElementById('adminSettingsForm').reset();
        
        this.showAlert('Mot de passe administrateur modifié avec succès', 'success');
    }

    // Export des données
    exportUsers() {
        const csv = this.convertToCSV(this.users, ['id', 'firstName', 'lastName', 'email', 'phone', 'createdAt']);
        this.downloadCSV(csv, 'utilisateurs_eyaar.csv');
    }

    exportSellers() {
        const csv = this.convertToCSV(this.sellers, ['id', 'firstName', 'lastName', 'email', 'phone', 'paymentNumber', 'contractSigned']);
        this.downloadCSV(csv, 'vendeurs_eyaar.csv');
    }

    convertToCSV(data, fields) {
        const headers = fields.join(',');
        const rows = data.map(item => 
            fields.map(field => {
                const value = item[field];
                return typeof value === 'string' ? `"${value}"` : value;
            }).join(',')
        );
        return [headers, ...rows].join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        
        const container = document.querySelector('.admin-content');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        }
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Fonctions globales
function addProduct() {
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
}

function changeCommissionRate() {
    admin.changeCommissionRate();
}

function exportUsers() {
    admin.exportUsers();
}

function exportSellers() {
    admin.exportSellers();
}

function logout() {
    sessionStorage.removeItem('eyaar_admin');
    window.location.href = 'index.html';
}

// Initialisation
const admin = new EYaarAdmin(); 