// Système d'authentification pour e-Yaar
class Auth {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('eYaarUsers')) || [];
        this.contracts = JSON.parse(localStorage.getItem('eYaarContracts')) || [];
        this.loadCurrentUser();
        this.initializeTestData();
    }

    // Charger l'utilisateur connecté
    loadCurrentUser() {
        const userId = localStorage.getItem('eYaarCurrentUser');
        if (userId) {
            this.currentUser = this.users.find(user => user.id === userId);
            // Vérifier si l'utilisateur existe toujours
            if (!this.currentUser) {
                this.logout();
            }
        }
    }

    // Enregistrer un nouvel utilisateur
    register(userData) {
        // Vérifier si l'email existe déjà
        if (this.users.find(user => user.email === userData.email)) {
            throw new Error('Cet email est déjà utilisé');
        }

        const newUser = {
            id: Date.now().toString(),
            email: userData.email,
            password: userData.password, // En production, utiliser bcrypt
            name: userData.name,
            phone: userData.phone,
            role: 'client', // Par défaut, les nouveaux utilisateurs sont des clients
            createdAt: new Date().toISOString(),
            isVerified: false,
            merchantContract: null
        };

        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    }

    // Connexion avec vérification de connexion existante
    login(email, password) {
        // Vérifier si l'utilisateur est déjà connecté
        if (this.isLoggedIn()) {
            throw new Error('Vous êtes déjà connecté');
        }

        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Email ou mot de passe incorrect');
        }

        this.currentUser = user;
        localStorage.setItem('eYaarCurrentUser', user.id);
        
        // Déclencher un événement personnalisé pour notifier les changements
        this.dispatchAuthEvent('login', user);
        
        return user;
    }

    // Déconnexion
    logout() {
        if (this.currentUser) {
            const user = this.currentUser;
            this.currentUser = null;
            localStorage.removeItem('eYaarCurrentUser');
            
            // Déclencher un événement personnalisé pour notifier les changements
            this.dispatchAuthEvent('logout', user);
        }
    }

    // Vérifier si l'utilisateur est connecté
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Vérifier si l'utilisateur est un vendeur
    isMerchant() {
        return this.currentUser && this.currentUser.role === 'merchant';
    }

    // Vérifier si l'utilisateur est un admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Obtenir l'utilisateur actuel
    getCurrentUser() {
        return this.currentUser;
    }

    // Déclencher un événement d'authentification
    dispatchAuthEvent(type, user) {
        const event = new CustomEvent('authStateChanged', {
            detail: { type, user }
        });
        document.dispatchEvent(event);
    }

    // Soumettre un contrat de vendeur
    submitMerchantContract(contractData) {
        if (!this.currentUser) {
            throw new Error('Vous devez être connecté pour soumettre un contrat');
        }

        // Vérifier si l'utilisateur a déjà un contrat
        if (this.currentUser.merchantContract) {
            throw new Error('Vous avez déjà soumis un contrat');
        }

        const contract = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            merchantName: contractData.merchantName,
            merchantEmail: contractData.merchantEmail,
            merchantPhone: contractData.merchantPhone,
            merchantAddress: contractData.merchantAddress,
            companyName: contractData.companyName,
            businessType: contractData.businessType,
            taxId: contractData.taxId,
            bankAccount: contractData.bankAccount,
            status: 'pending', // pending, approved, rejected
            submittedAt: new Date().toISOString(),
            approvedAt: null,
            approvedBy: null
        };

        this.contracts.push(contract);
        this.saveContracts();

        // Mettre à jour le statut de l'utilisateur
        this.currentUser.merchantContract = contract.id;
        this.saveUsers();

        return contract;
    }

    // Approuver un contrat de vendeur (admin seulement)
    approveMerchantContract(contractId, adminId) {
        if (!this.isAdmin()) {
            throw new Error('Accès non autorisé');
        }

        const contract = this.contracts.find(c => c.id === contractId);
        if (!contract) {
            throw new Error('Contrat non trouvé');
        }

        contract.status = 'approved';
        contract.approvedAt = new Date().toISOString();
        contract.approvedBy = adminId;

        // Mettre à jour le rôle de l'utilisateur
        const user = this.users.find(u => u.id === contract.userId);
        if (user) {
            user.role = 'merchant';
            user.isVerified = true;
            
            // Mettre à jour l'utilisateur actuel si c'est lui
            if (this.currentUser && this.currentUser.id === user.id) {
                this.currentUser.role = 'merchant';
                this.currentUser.isVerified = true;
            }
        }

        this.saveContracts();
        this.saveUsers();

        return contract;
    }

    // Rejeter un contrat de vendeur (admin seulement)
    rejectMerchantContract(contractId, adminId, reason) {
        if (!this.isAdmin()) {
            throw new Error('Accès non autorisé');
        }

        const contract = this.contracts.find(c => c.id === contractId);
        if (!contract) {
            throw new Error('Contrat non trouvé');
        }

        contract.status = 'rejected';
        contract.rejectedAt = new Date().toISOString();
        contract.rejectedBy = adminId;
        contract.rejectionReason = reason;

        this.saveContracts();
        return contract;
    }

    // Obtenir le contrat de vendeur de l'utilisateur actuel
    getCurrentUserContract() {
        if (!this.currentUser || !this.currentUser.merchantContract) {
            return null;
        }
        return this.contracts.find(c => c.id === this.currentUser.merchantContract);
    }

    // Obtenir tous les contrats (admin seulement)
    getAllContracts() {
        if (!this.isAdmin()) {
            throw new Error('Accès non autorisé');
        }
        return this.contracts;
    }

    // Obtenir tous les vendeurs
    getAllMerchants() {
        return this.users.filter(user => user.role === 'merchant');
    }

    // Sauvegarder les utilisateurs
    saveUsers() {
        localStorage.setItem('eYaarUsers', JSON.stringify(this.users));
    }

    // Sauvegarder les contrats
    saveContracts() {
        localStorage.setItem('eYaarContracts', JSON.stringify(this.contracts));
    }

    // Initialiser les données de test
    initializeTestData() {
        if (this.users.length === 0) {
            // Créer un admin de test
            const admin = {
                id: 'admin1',
                email: 'admin@e-yaar.bf',
                password: 'admin123',
                name: 'Administrateur e-Yaar',
                phone: '+226 70 00 00 00',
                role: 'admin',
                createdAt: new Date().toISOString(),
                isVerified: true,
                merchantContract: null
            };

            // Créer un vendeur de test
            const merchant = {
                id: 'merchant1',
                email: 'vendeur@e-yaar.bf',
                password: 'vendeur123',
                name: 'Vendeur Test',
                phone: '+226 70 00 00 01',
                role: 'merchant',
                createdAt: new Date().toISOString(),
                isVerified: true,
                merchantContract: 'contract1'
            };

            // Créer un client de test
            const client = {
                id: 'client1',
                email: 'client@e-yaar.bf',
                password: 'client123',
                name: 'Client Test',
                phone: '+226 70 00 00 02',
                role: 'client',
                createdAt: new Date().toISOString(),
                isVerified: false,
                merchantContract: null
            };

            this.users = [admin, merchant, client];

            // Créer un contrat de test pour le vendeur
            const contract = {
                id: 'contract1',
                userId: 'merchant1',
                merchantName: 'Vendeur Test',
                merchantEmail: 'vendeur@e-yaar.bf',
                merchantPhone: '+226 70 00 00 01',
                merchantAddress: 'Ouagadougou, Burkina Faso',
                companyName: 'Boutique Test',
                businessType: 'Vêtements',
                taxId: 'NIF123456',
                bankAccount: 'BF123456789',
                status: 'approved',
                submittedAt: new Date().toISOString(),
                approvedAt: new Date().toISOString(),
                approvedBy: 'admin1'
            };

            this.contracts = [contract];
            this.saveUsers();
            this.saveContracts();
        }
    }
}

// Instance globale
const auth = new Auth(); 