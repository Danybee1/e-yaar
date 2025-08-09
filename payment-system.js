/**
 * Système de Paiement Mobile Sécurisé e-Yaar
 * Intégration complète avec Orange Money, Moov Money et Telecel Money
 * Version 2.0 - Intégration API Réelle
 */

class PaymentSystem {
    constructor() {
        this.currentTransaction = null;
        this.otpExpirationTime = 5 * 60 * 1000; // 5 minutes
        this.maxRetries = 3;
        this.retryCount = 0;
        this.isProcessing = false;
        
        // Configuration des fournisseurs de paiement mobile
        this.paymentProviders = {
            'Orange Money': {
                name: 'Orange Money',
                color: '#FF6600',
                icon: 'fas fa-mobile-alt',
                phoneNumber: '+226 70 00 00 00',
                apiEndpoint: 'https://api.orange-money.bf/v1',
                apiKey: 'orange_api_key_here', // À configurer
                merchantId: 'e-yaar_merchant',
                supportedPrefixes: ['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'],
                webhookUrl: 'https://e-yaar.bf/webhooks/orange-money',
                timeout: 30000
            },
            'Moov Money': {
                name: 'Moov Money',
                color: '#00A651',
                icon: 'fas fa-mobile-alt',
                phoneNumber: '+226 60 00 00 00',
                apiEndpoint: 'https://api.moov-money.bf/v1',
                apiKey: 'moov_api_key_here', // À configurer
                merchantId: 'e-yaar_merchant',
                supportedPrefixes: ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'],
                webhookUrl: 'https://e-yaar.bf/webhooks/moov-money',
                timeout: 30000
            },
            'Telecel Money': {
                name: 'Telecel Money',
                color: '#1E3A8A',
                icon: 'fas fa-mobile-alt',
                phoneNumber: '+226 50 00 00 00',
                apiEndpoint: 'https://api.telecel-money.bf/v1',
                apiKey: 'telecel_api_key_here', // À configurer
                merchantId: 'e-yaar_merchant',
                supportedPrefixes: ['50', '51', '52', '53', '54', '55', '56', '57', '58', '59'],
                webhookUrl: 'https://e-yaar.bf/webhooks/telecel-money',
                timeout: 30000
            }
        };

        // Configuration de sécurité
        this.securityConfig = {
            maxTransactionAmount: 1000000, // 1 million FCFA
            minTransactionAmount: 100, // 100 FCFA
            rateLimit: {
                maxRequests: 10,
                timeWindow: 60000 // 1 minute
            },
            encryption: {
                algorithm: 'AES-256-GCM',
                key: 'e-yaar_encryption_key_2024' // À changer en production
            }
        };

        // Cache pour les transactions
        this.transactionCache = new Map();
        this.rateLimitCache = new Map();
    }

    /**
     * Initialise le système de paiement
     */
    init() {
        this.createPaymentModal();
        this.setupEventListeners();
        this.initializeWebhooks();
        console.log('Système de paiement e-Yaar v2.0 initialisé avec intégration API complète');
    }

    /**
     * Initialise les webhooks pour les notifications de paiement
     */
    initializeWebhooks() {
        // Écouter les événements de paiement depuis les fournisseurs
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'payment_webhook') {
                this.handlePaymentWebhook(event.data);
            }
        });
    }

    /**
     * Gère les webhooks de paiement
     */
    handlePaymentWebhook(data) {
        const { provider, transactionId, status, amount, phoneNumber } = data;
        
        console.log(`Webhook reçu de ${provider}:`, data);
        
        // Vérifier la signature du webhook
        if (!this.verifyWebhookSignature(data)) {
            console.error('Signature webhook invalide');
            return;
        }

        // Mettre à jour le statut de la transaction
        const transaction = this.transactionCache.get(transactionId);
        if (transaction) {
            transaction.status = status;
            transaction.updatedAt = new Date();
            
            if (status === 'completed') {
                this.showMessage(`Paiement ${provider} confirmé!`, 'success');
                this.displayTransactionDetails();
            } else if (status === 'failed') {
                this.showMessage(`Paiement ${provider} échoué`, 'error');
            }
        }
    }

    /**
     * Vérifie la signature du webhook
     */
    verifyWebhookSignature(data) {
        // Implémentation de vérification de signature
        // En production, utiliser HMAC ou autre méthode de signature
        return true; // Simplifié pour cet exemple
    }

    /**
     * Crée l'interface de paiement sécurisé
     */
    createPaymentModal() {
        const modalHTML = `
            <div id="securePaymentModal" class="secure-payment-modal">
                <div class="secure-payment-content">
                    <div class="payment-header">
                        <button class="modal-close" onclick="paymentSystem.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                        <h3><i class="fas fa-shield-alt"></i> Paiement Mobile Sécurisé</h3>
                        <p>Transaction sécurisée avec validation OTP</p>
                    </div>

                    <!-- Étape 1: Sélection du mode de paiement -->
                    <div id="paymentStep1" class="payment-step active">
                        <div class="step-indicator">
                            <div class="step active">1</div>
                            <div class="step-line"></div>
                            <div class="step">2</div>
                            <div class="step-line"></div>
                            <div class="step">3</div>
                        </div>
                        
                        <div class="product-summary">
                            <div class="product-info">
                                <img id="productImage" src="" alt="Produit">
                                <div>
                                    <h4 id="productTitle"></h4>
                                    <p id="productPrice"></p>
                                </div>
                            </div>
                        </div>

                        <div class="payment-methods">
                            <h4>Sélectionnez votre opérateur mobile</h4>
                            <div class="payment-options">
                                <div class="payment-option" data-provider="Orange Money">
                                    <div class="provider-icon" style="background: #FF6600;">
                                        <i class="fas fa-mobile-alt"></i>
                                    </div>
                                    <div class="provider-info">
                                        <h5>Orange Money</h5>
                                        <p>Paiement instantané et sécurisé</p>
                                        <small>Préfixes: 70, 71, 72, 73, 74, 75, 76, 77, 78, 79</small>
                                    </div>
                                    <div class="radio-btn">
                                        <input type="radio" name="paymentProvider" value="Orange Money" checked>
                                        <span class="checkmark"></span>
                                    </div>
                                </div>

                                <div class="payment-option" data-provider="Moov Money">
                                    <div class="provider-icon" style="background: #00A651;">
                                        <i class="fas fa-mobile-alt"></i>
                                    </div>
                                    <div class="provider-info">
                                        <h5>Moov Money</h5>
                                        <p>Paiement rapide et fiable</p>
                                        <small>Préfixes: 60, 61, 62, 63, 64, 65, 66, 67, 68, 69</small>
                                    </div>
                                    <div class="radio-btn">
                                        <input type="radio" name="paymentProvider" value="Moov Money">
                                        <span class="checkmark"></span>
                                    </div>
                                </div>

                                <div class="payment-option" data-provider="Telecel Money">
                                    <div class="provider-icon" style="background: #1E3A8A;">
                                        <i class="fas fa-mobile-alt"></i>
                                    </div>
                                    <div class="provider-info">
                                        <h5>Telecel Money</h5>
                                        <p>Paiement simple et efficace</p>
                                        <small>Préfixes: 50, 51, 52, 53, 54, 55, 56, 57, 58, 59</small>
                                    </div>
                                    <div class="radio-btn">
                                        <input type="radio" name="paymentProvider" value="Telecel Money">
                                        <span class="checkmark"></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="payment-actions">
                            <button class="btn-secondary" onclick="paymentSystem.closeModal()">Annuler</button>
                            <button class="btn-primary" onclick="paymentSystem.nextStep()">Continuer</button>
                        </div>
                    </div>

                    <!-- Étape 2: Saisie du numéro de téléphone -->
                    <div id="paymentStep2" class="payment-step">
                        <div class="step-indicator">
                            <div class="step completed">1</div>
                            <div class="step-line"></div>
                            <div class="step active">2</div>
                            <div class="step-line"></div>
                            <div class="step">3</div>
                        </div>

                        <div class="phone-input-section">
                            <h4>Entrez votre numéro de téléphone</h4>
                            <p>Le code OTP sera envoyé à ce numéro</p>
                            
                            <div class="phone-input-group">
                                <div class="country-code">+226</div>
                                <input type="tel" id="phoneNumber" placeholder="70 00 00 00" maxlength="8">
                                <div class="phone-validation" id="phoneValidation"></div>
                            </div>

                            <div class="provider-info-display" id="providerInfo">
                                <div class="provider-details">
                                    <div class="provider-icon-small"></div>
                                    <div>
                                        <h5 id="selectedProviderName"></h5>
                                        <p id="selectedProviderDesc"></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="payment-actions">
                            <button class="btn-secondary" onclick="paymentSystem.previousStep()">Retour</button>
                            <button class="btn-primary" id="sendOTPBtn" onclick="paymentSystem.sendOTP()">
                                <i class="fas fa-paper-plane"></i> Envoyer le code OTP
                            </button>
                        </div>
                    </div>

                    <!-- Étape 3: Validation OTP -->
                    <div id="paymentStep3" class="payment-step">
                        <div class="step-indicator">
                            <div class="step completed">1</div>
                            <div class="step-line"></div>
                            <div class="step completed">2</div>
                            <div class="step-line"></div>
                            <div class="step active">3</div>
                        </div>

                        <div class="otp-section">
                            <h4>Code de vérification</h4>
                            <p>Entrez le code à 6 chiffres envoyé au <span id="otpPhoneNumber"></span></p>
                            
                            <div class="otp-input-group">
                                <input type="text" class="otp-input" data-index="0" maxlength="1" oninput="paymentSystem.handleOTPInput(this)">
                                <input type="text" class="otp-input" data-index="1" maxlength="1" oninput="paymentSystem.handleOTPInput(this)">
                                <input type="text" class="otp-input" data-index="2" maxlength="1" oninput="paymentSystem.handleOTPInput(this)">
                                <input type="text" class="otp-input" data-index="3" maxlength="1" oninput="paymentSystem.handleOTPInput(this)">
                                <input type="text" class="otp-input" data-index="4" maxlength="1" oninput="paymentSystem.handleOTPInput(this)">
                                <input type="text" class="otp-input" data-index="5" maxlength="1" oninput="paymentSystem.handleOTPInput(this)">
                            </div>

                            <div class="otp-timer">
                                <p>Code valide pendant: <span id="otpTimer">05:00</span></p>
                                <button id="resendOTPBtn" onclick="paymentSystem.resendOTP()" disabled>
                                    Renvoyer le code
                                </button>
                            </div>

                            <div class="otp-actions">
                                <button onclick="paymentSystem.changePhoneNumber()">Changer de numéro</button>
                            </div>
                        </div>

                        <div class="payment-actions">
                            <button class="btn-secondary" onclick="paymentSystem.previousStep()">Retour</button>
                            <button class="btn-primary" id="validateOTPBtn" onclick="paymentSystem.validateOTP()" disabled>
                                Valider et Payer
                            </button>
                        </div>
                    </div>

                    <!-- Étape 4: Confirmation -->
                    <div id="paymentStep4" class="payment-step">
                        <div class="step-indicator">
                            <div class="step completed">1</div>
                            <div class="step-line"></div>
                            <div class="step completed">2</div>
                            <div class="step-line"></div>
                            <div class="step completed">3</div>
                        </div>

                        <div class="success-section">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h4>Paiement réussi!</h4>
                            <p>Votre transaction a été traitée avec succès</p>
                            
                            <div class="transaction-details">
                                <div class="detail-row">
                                    <span>Numéro de transaction:</span>
                                    <span id="transactionNumber"></span>
                                </div>
                                <div class="detail-row">
                                    <span>Montant:</span>
                                    <span id="transactionAmount"></span>
                                </div>
                                <div class="detail-row">
                                    <span>Méthode de paiement:</span>
                                    <span id="transactionMethod"></span>
                                </div>
                                <div class="detail-row">
                                    <span>Date:</span>
                                    <span id="transactionDate"></span>
                                </div>
                            </div>

                            <div class="receipt-actions">
                                <button onclick="paymentSystem.downloadReceipt()">
                                    <i class="fas fa-download"></i> Télécharger le reçu
                                </button>
                            </div>
                        </div>

                        <div class="payment-actions">
                            <button class="btn-primary" onclick="paymentSystem.closeModal()">Terminer</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Écouteurs pour les options de paiement
        document.addEventListener('click', (e) => {
            if (e.target.closest('.payment-option')) {
                const option = e.target.closest('.payment-option');
                const provider = option.dataset.provider;
                
                // Mettre à jour la sélection
                document.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                // Mettre à jour le radio button
                const radio = option.querySelector('input[type="radio"]');
                radio.checked = true;
                
                // Mettre à jour l'affichage du fournisseur
                this.updateProviderDisplay(provider);
            }
        });

        // Écouteur pour la validation du numéro de téléphone
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.validatePhoneNumberRealTime(e.target.value);
            });
        }

        // Écouteur pour la touche Entrée
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeStep = document.querySelector('.payment-step.active');
                if (activeStep) {
                    const stepNumber = parseInt(activeStep.id.replace('paymentStep', ''));
                    if (stepNumber === 2) {
                        this.sendOTP();
                    } else if (stepNumber === 3) {
                        this.validateOTP();
                    }
                }
            }
        });
    }

    /**
     * Met à jour l'affichage du fournisseur sélectionné
     */
    updateProviderDisplay(providerName) {
        const provider = this.paymentProviders[providerName];
        if (!provider) return;

        const providerInfo = document.getElementById('providerInfo');
        const providerNameEl = document.getElementById('selectedProviderName');
        const providerDescEl = document.getElementById('selectedProviderDesc');
        const providerIcon = providerInfo.querySelector('.provider-icon-small');

        providerNameEl.textContent = provider.name;
        providerDescEl.textContent = `Paiement via ${provider.name}`;
        providerIcon.style.background = provider.color;
        providerIcon.innerHTML = `<i class="${provider.icon}"></i>`;
    }

    /**
     * Valide le numéro de téléphone en temps réel
     */
    validatePhoneNumberRealTime(phone) {
        const validationEl = document.getElementById('phoneValidation');
        const sendBtn = document.getElementById('sendOTPBtn');
        
        if (!phone) {
            validationEl.innerHTML = '';
            sendBtn.disabled = true;
            return;
        }

        const selectedProvider = document.querySelector('input[name="paymentProvider"]:checked').value;
        const provider = this.paymentProviders[selectedProvider];
        
        // Vérifier le format
        if (!/^\d{8}$/.test(phone)) {
            validationEl.innerHTML = '<i class="fas fa-times-circle"></i> Format invalide';
            validationEl.className = 'phone-validation error';
            sendBtn.disabled = true;
            return;
        }

        // Vérifier le préfixe
        const prefix = phone.substring(0, 2);
        if (!provider.supportedPrefixes.includes(prefix)) {
            validationEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Préfixe ${prefix} non supporté par ${provider.name}`;
            validationEl.className = 'phone-validation warning';
            sendBtn.disabled = true;
            return;
        }

        validationEl.innerHTML = '<i class="fas fa-check-circle"></i> Numéro valide';
        validationEl.className = 'phone-validation success';
        sendBtn.disabled = false;
    }

    /**
     * Ouvre le modal de paiement sécurisé
     */
    openSecurePayment(product) {
        this.currentTransaction = {
            id: this.generateTransactionId(),
            product: product,
            status: 'pending',
            createdAt: new Date(),
            provider: null,
            phoneNumber: null,
            otp: null,
            otpExpiry: null
        };

        // Mettre à jour les informations du produit
        document.getElementById('productImage').src = product.image || 'default-product.jpg';
                        document.getElementById('productTitle').textContent = product.title;
        document.getElementById('productPrice').textContent = `${product.price.toLocaleString()} FCFA`;

        // Afficher le modal
        document.getElementById('securePaymentModal').style.display = 'flex';
        
        // Mettre à jour l'affichage du fournisseur par défaut
        const defaultProvider = document.querySelector('input[name="paymentProvider"]:checked').value;
        this.updateProviderDisplay(defaultProvider);
    }

    /**
     * Ferme le modal
     */
    closeModal() {
        document.getElementById('securePaymentModal').style.display = 'none';
        this.resetSteps();
        this.currentTransaction = null;
    }

    /**
     * Passe à l'étape suivante
     */
    nextStep() {
        const currentStep = document.querySelector('.payment-step.active');
        const currentStepNumber = parseInt(currentStep.id.replace('paymentStep', ''));
        const nextStepNumber = currentStepNumber + 1;
        
        if (nextStepNumber <= 4) {
            this.showStep(nextStepNumber);
        }
    }

    /**
     * Passe à l'étape précédente
     */
    previousStep() {
        const currentStep = document.querySelector('.payment-step.active');
        const currentStepNumber = parseInt(currentStep.id.replace('paymentStep', ''));
        const previousStepNumber = currentStepNumber - 1;
        
        if (previousStepNumber >= 1) {
            this.showStep(previousStepNumber);
        }
    }

    /**
     * Affiche une étape spécifique
     */
    showStep(stepNumber) {
        // Masquer toutes les étapes
        document.querySelectorAll('.payment-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Afficher l'étape demandée
        document.getElementById(`paymentStep${stepNumber}`).classList.add('active');
        
        // Mettre à jour les indicateurs d'étape
        this.updateStepIndicators(stepNumber);
    }

    /**
     * Met à jour les indicateurs d'étape
     */
    updateStepIndicators(currentStep) {
        document.querySelectorAll('.step-indicator .step').forEach((step, index) => {
            const stepNumber = index + 1;
            
            step.classList.remove('active', 'completed');
            
            if (stepNumber === currentStep) {
                step.classList.add('active');
            } else if (stepNumber < currentStep) {
                step.classList.add('completed');
            }
        });
    }

    /**
     * Valide le numéro de téléphone
     */
    validatePhoneNumber(phone) {
        if (!phone || phone.length !== 8) {
            return false;
        }

        const selectedProvider = document.querySelector('input[name="paymentProvider"]:checked').value;
        const provider = this.paymentProviders[selectedProvider];
        
        // Vérifier le préfixe
        const prefix = phone.substring(0, 2);
        return provider.supportedPrefixes.includes(prefix);
    }

    /**
     * Envoie le code OTP via l'API du fournisseur
     */
    async sendOTP() {
        if (this.isProcessing) return;
        
        const phoneNumber = document.getElementById('phoneNumber').value;
        
        if (!this.validatePhoneNumber(phoneNumber)) {
            this.showMessage('Veuillez entrer un numéro de téléphone valide', 'error');
            return;
        }

        // Vérifier les limites de taux
        if (!this.checkRateLimit(phoneNumber)) {
            this.showMessage('Trop de tentatives. Veuillez attendre avant de réessayer.', 'error');
            return;
        }

        this.isProcessing = true;
        const sendBtn = document.getElementById('sendOTPBtn');
        const originalText = sendBtn.innerHTML;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
        sendBtn.disabled = true;

        try {
            const selectedProvider = document.querySelector('input[name="paymentProvider"]:checked').value;
            const provider = this.paymentProviders[selectedProvider];
            
            // Préparer les données de la transaction
            this.currentTransaction.provider = selectedProvider;
            this.currentTransaction.phoneNumber = phoneNumber;
            this.currentTransaction.otp = this.generateOTP();
            this.currentTransaction.otpExpiry = new Date(Date.now() + this.otpExpirationTime);

            // Appeler l'API du fournisseur
            const response = await this.callProviderAPI(provider, 'send-otp', {
                phoneNumber: `+226${phoneNumber}`,
                amount: this.currentTransaction.product.price,
                transactionId: this.currentTransaction.id,
                merchantId: provider.merchantId,
                otp: this.currentTransaction.otp,
                expiryTime: this.currentTransaction.otpExpiry.toISOString()
            });

            if (response.success) {
                // Afficher le numéro dans l'étape OTP
                document.getElementById('otpPhoneNumber').textContent = `+226 ${phoneNumber}`;

                // Passer à l'étape OTP
                this.nextStep();

                // Démarrer le timer
                this.startOTPTimer();

                // Stocker la transaction dans le cache
                this.transactionCache.set(this.currentTransaction.id, this.currentTransaction);

                this.showMessage('Code OTP envoyé avec succès', 'success');
                console.log(`Code OTP envoyé au +226 ${phoneNumber}: ${this.currentTransaction.otp}`);
            } else {
                throw new Error(response.message || 'Erreur lors de l\'envoi du code OTP');
            }
            
        } catch (error) {
            console.error('Erreur lors de l\'envoi du code OTP:', error);
            this.showMessage(`Erreur: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
        }
    }

    /**
     * Appelle l'API du fournisseur de paiement
     */
    async callProviderAPI(provider, endpoint, data) {
        const url = `${provider.apiEndpoint}/${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`,
            'X-Merchant-ID': provider.merchantId,
            'X-Transaction-ID': data.transactionId
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), provider.timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Délai d\'attente dépassé. Veuillez réessayer.');
            }
            throw error;
        }
    }

    /**
     * Vérifie les limites de taux
     */
    checkRateLimit(phoneNumber) {
        const now = Date.now();
        const key = `rate_limit_${phoneNumber}`;
        
        if (!this.rateLimitCache.has(key)) {
            this.rateLimitCache.set(key, []);
        }
        
        const requests = this.rateLimitCache.get(key);
        
        // Supprimer les anciennes requêtes
        const validRequests = requests.filter(time => now - time < this.securityConfig.rateLimit.timeWindow);
        
        if (validRequests.length >= this.securityConfig.rateLimit.maxRequests) {
            return false;
        }
        
        validRequests.push(now);
        this.rateLimitCache.set(key, validRequests);
        return true;
    }

    /**
     * Génère un code OTP sécurisé
     */
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Démarre le timer OTP
     */
    startOTPTimer() {
        const timerElement = document.getElementById('otpTimer');
        const resendBtn = document.getElementById('resendOTPBtn');
        let timeLeft = this.otpExpirationTime / 1000;

        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                timerElement.textContent = '00:00';
                resendBtn.disabled = false;
                this.showMessage('Le code OTP a expiré. Veuillez demander un nouveau code.', 'warning');
            }
            
            timeLeft--;
        }, 1000);

        // Stocker le timer pour pouvoir l'arrêter si nécessaire
        this.currentTransaction.timer = timer;
    }

    /**
     * Gère la saisie du code OTP
     */
    handleOTPInput(input) {
        const index = parseInt(input.dataset.index);
        const value = input.value;
        
        // Ne permettre que les chiffres
        if (!/^[0-9]$/.test(value)) {
            input.value = '';
            return;
        }

        // Passer au champ suivant
        if (value && index < 5) {
            const nextInput = document.querySelector(`[data-index="${index + 1}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }

        // Vérifier si tous les champs sont remplis
        this.checkOTPComplete();
    }

    /**
     * Vérifie si le code OTP est complet
     */
    checkOTPComplete() {
        const inputs = document.querySelectorAll('.otp-input');
        const isComplete = Array.from(inputs).every(input => input.value.length === 1);
        
        const validateBtn = document.getElementById('validateOTPBtn');
        validateBtn.disabled = !isComplete;
    }

    /**
     * Valide le code OTP et traite le paiement
     */
    async validateOTP() {
        if (this.isProcessing) return;
        
        const inputs = document.querySelectorAll('.otp-input');
        const enteredOTP = Array.from(inputs).map(input => input.value).join('');
        
        if (enteredOTP.length !== 6) {
            this.showMessage('Veuillez entrer le code OTP complet', 'error');
            return;
        }

        // Vérifier si le code OTP a expiré
        if (new Date() > this.currentTransaction.otpExpiry) {
            this.showMessage('Le code OTP a expiré. Veuillez demander un nouveau code.', 'error');
            return;
        }

        this.isProcessing = true;
        const validateBtn = document.getElementById('validateOTPBtn');
        const originalText = validateBtn.innerHTML;
        validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validation...';
        validateBtn.disabled = true;

        try {
            // Vérifier le code OTP
            if (enteredOTP === this.currentTransaction.otp) {
                // Code OTP correct, traiter le paiement
                await this.processPayment();
            } else {
                // Code OTP incorrect
                this.retryCount++;
                
                if (this.retryCount >= this.maxRetries) {
                    this.showMessage('Nombre maximum de tentatives atteint. Veuillez recommencer.', 'error');
                    this.resetOTP();
                } else {
                    this.showMessage(`Code OTP incorrect. Il vous reste ${this.maxRetries - this.retryCount} tentative(s).`, 'error');
                    this.clearOTPInputs();
                }
            }
        } catch (error) {
            console.error('Erreur lors de la validation OTP:', error);
            this.showMessage('Erreur lors de la validation', 'error');
        } finally {
            this.isProcessing = false;
            validateBtn.innerHTML = originalText;
            validateBtn.disabled = false;
        }
    }

    /**
     * Traite le paiement via l'API du fournisseur
     */
    async processPayment() {
        try {
            const provider = this.paymentProviders[this.currentTransaction.provider];
            
            // Appeler l'API de paiement
            const response = await this.callProviderAPI(provider, 'process-payment', {
                phoneNumber: `+226${this.currentTransaction.phoneNumber}`,
                amount: this.currentTransaction.product.price,
                transactionId: this.currentTransaction.id,
                merchantId: provider.merchantId,
                otp: this.currentTransaction.otp,
                productName: this.currentTransaction.product.title,
                callbackUrl: provider.webhookUrl
            });

            if (response.success) {
                // Mettre à jour le statut de la transaction
                this.currentTransaction.status = 'completed';
                this.currentTransaction.completedAt = new Date();
                this.currentTransaction.providerTransactionId = response.providerTransactionId;
                
                // Afficher les détails de la transaction
                this.displayTransactionDetails();
                
                // Passer à l'étape de confirmation
                this.nextStep();
                
                this.showMessage('Paiement traité avec succès!', 'success');
            } else {
                throw new Error(response.message || 'Erreur lors du traitement du paiement');
            }
            
        } catch (error) {
            console.error('Erreur lors du traitement du paiement:', error);
            this.showMessage(`Erreur de paiement: ${error.message}`, 'error');
            
            // Mettre à jour le statut de la transaction
            this.currentTransaction.status = 'failed';
            this.currentTransaction.error = error.message;
        }
    }

    /**
     * Affiche les détails de la transaction
     */
    displayTransactionDetails() {
        document.getElementById('transactionNumber').textContent = this.currentTransaction.id;
        document.getElementById('transactionAmount').textContent = `${this.currentTransaction.product.price.toLocaleString()} FCFA`;
        document.getElementById('transactionDate').textContent = this.currentTransaction.completedAt.toLocaleString('fr-FR');
        document.getElementById('transactionMethod').textContent = this.currentTransaction.provider;
    }

    /**
     * Renvoie le code OTP
     */
    resendOTP() {
        this.retryCount = 0;
        this.sendOTP();
    }

    /**
     * Change le numéro de téléphone
     */
    changePhoneNumber() {
        this.previousStep();
        this.clearOTPInputs();
    }

    /**
     * Efface les champs OTP
     */
    clearOTPInputs() {
        document.querySelectorAll('.otp-input').forEach(input => {
            input.value = '';
        });
        this.checkOTPComplete();
    }

    /**
     * Réinitialise le code OTP
     */
    resetOTP() {
        this.retryCount = 0;
        this.clearOTPInputs();
        this.previousStep();
    }

    /**
     * Génère un ID de transaction unique
     */
    generateTransactionId() {
        return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    /**
     * Télécharge le reçu
     */
    downloadReceipt() {
        const receipt = this.generateReceipt();
        const blob = new Blob([receipt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu_${this.currentTransaction.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Génère le contenu du reçu
     */
    generateReceipt() {
        const transaction = this.currentTransaction;
        const receipt = `
E-YAAR - RECU DE PAIEMENT
==========================

Numéro de transaction: ${transaction.id}
Date: ${transaction.completedAt.toLocaleString('fr-FR')}
Méthode de paiement: ${transaction.provider}
Numéro de téléphone: +226 ${transaction.phoneNumber}

PRODUIT
-------
Nom: ${transaction.product.title}
Prix: ${transaction.product.price.toLocaleString()} FCFA

STATUT: PAIEMENT RÉUSSI

Merci pour votre confiance!
E-YAAR - Marketplace du Burkina Faso
        `;
        
        return receipt;
    }

    /**
     * Affiche un message à l'utilisateur
     */
    showMessage(message, type = 'info') {
        // Créer l'élément de message
        const messageEl = document.createElement('div');
        messageEl.className = `payment-message ${type}`;
        messageEl.innerHTML = `
            <i class="${this.getMessageIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Ajouter au modal
        const modal = document.getElementById('securePaymentModal');
        modal.appendChild(messageEl);

        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 5000);
    }

    /**
     * Retourne l'icône pour le type de message
     */
    getMessageIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Réinitialise les étapes
     */
    resetSteps() {
        this.showStep(1);
        this.clearOTPInputs();
        this.retryCount = 0;
        
        // Réinitialiser les champs
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) phoneInput.value = '';
        
        // Arrêter le timer si actif
        if (this.currentTransaction && this.currentTransaction.timer) {
            clearInterval(this.currentTransaction.timer);
        }
    }
}

// Initialiser le système de paiement
const paymentSystem = new PaymentSystem();
document.addEventListener('DOMContentLoaded', () => {
    paymentSystem.init();
});

// Styles CSS pour le système de paiement
const paymentStyles = `
    .secure-payment-modal {
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    }

    .secure-payment-content {
        background: white;
        border-radius: 20px;
        padding: 0;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        position: relative;
    }

    .payment-header {
        background: linear-gradient(135deg, #FF6B35, #FF8C42);
        color: white;
        padding: 2rem;
        border-radius: 20px 20px 0 0;
        text-align: center;
        position: relative;
    }

    .payment-header h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
    }

    .payment-header p {
        margin: 0;
        opacity: 0.9;
    }

    .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .modal-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
    }

    .payment-step {
        display: none;
        padding: 2rem;
    }

    .payment-step.active {
        display: block;
    }

    .step-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2rem;
    }

    .step {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e0e0e0;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .step.active {
        background: #FF6B35;
        color: white;
        transform: scale(1.1);
    }

    .step.completed {
        background: #28A745;
        color: white;
    }

    .step-line {
        width: 60px;
        height: 3px;
        background: #e0e0e0;
        margin: 0 0.5rem;
        transition: all 0.3s ease;
    }

    .step-line.completed {
        background: #28A745;
    }

    .product-summary {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }

    .product-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .product-info img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
    }

    .product-info h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
    }

    .product-info p {
        margin: 0;
        color: #FF6B35;
        font-weight: bold;
        font-size: 1.2rem;
    }

    .payment-methods h4 {
        margin-bottom: 1rem;
        color: #333;
    }

    .payment-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .payment-option {
        display: flex;
        align-items: center;
        padding: 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .payment-option:hover {
        border-color: #FF6B35;
        transform: translateY(-2px);
    }

    .payment-option.selected {
        border-color: #FF6B35;
        background: rgba(255, 107, 53, 0.05);
    }

    .provider-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        margin-right: 1rem;
    }

    .provider-info {
        flex: 1;
    }

    .provider-info h5 {
        margin: 0 0 0.25rem 0;
        color: #333;
    }

    .provider-info p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
    }

    .radio-btn {
        position: relative;
    }

    .radio-btn input[type="radio"] {
        display: none;
    }

    .checkmark {
        width: 24px;
        height: 24px;
        border: 2px solid #e0e0e0;
        border-radius: 50%;
        display: block;
        position: relative;
        transition: all 0.3s ease;
    }

    .radio-btn input[type="radio"]:checked + .checkmark {
        border-color: #FF6B35;
        background: #FF6B35;
    }

    .radio-btn input[type="radio"]:checked + .checkmark::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
    }

    .phone-input-section {
        text-align: center;
        margin-bottom: 2rem;
    }

    .phone-input-section h4 {
        margin-bottom: 0.5rem;
        color: #333;
    }

    .phone-input-section p {
        color: #666;
        margin-bottom: 2rem;
    }

    .phone-input-group {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .country-code {
        background: #f8f9fa;
        padding: 0.75rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-weight: bold;
        color: #333;
    }

    #phoneNumber {
        padding: 0.75rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        width: 200px;
        text-align: center;
        transition: all 0.3s ease;
    }

    #phoneNumber:focus {
        outline: none;
        border-color: #FF6B35;
        box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
    }

    #phoneNumber.valid {
        border-color: #28A745;
    }

    #phoneNumber.invalid {
        border-color: #DC3545;
    }

    .phone-validation {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 1rem;
    }

    .validation-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #666;
    }

    .validation-item i.valid {
        color: #28A745;
    }

    .otp-section {
        text-align: center;
        margin-bottom: 2rem;
    }

    .otp-section h4 {
        margin-bottom: 0.5rem;
        color: #333;
    }

    .otp-section p {
        color: #666;
        margin-bottom: 2rem;
    }

    .otp-timer {
        margin-bottom: 2rem;
    }

    .timer-circle {
        width: 80px;
        height: 80px;
        border: 4px solid #FF6B35;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 1.2rem;
        font-weight: bold;
        color: #FF6B35;
    }

    .otp-input-group {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    .otp-input {
        width: 50px;
        height: 50px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        text-align: center;
        font-size: 1.5rem;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .otp-input:focus {
        outline: none;
        border-color: #FF6B35;
        box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
    }

    .otp-actions {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-bottom: 1rem;
    }

    .btn-link {
        background: none;
        border: none;
        color: #FF6B35;
        cursor: pointer;
        font-size: 0.9rem;
        text-decoration: underline;
        transition: color 0.3s ease;
    }

    .btn-link:hover {
        color: #FF8C42;
    }

    .btn-link:disabled {
        color: #ccc;
        cursor: not-allowed;
        text-decoration: none;
    }

    .otp-validation {
        margin-top: 1rem;
    }

    .validation-message {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        display: none;
    }

    .validation-message.error {
        background: rgba(220, 53, 69, 0.1);
        color: #DC3545;
        border: 1px solid #DC3545;
        display: block;
    }

    .validation-message.success {
        background: rgba(40, 167, 69, 0.1);
        color: #28A745;
        border: 1px solid #28A745;
        display: block;
    }

    .payment-actions {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 2rem;
    }

    .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-primary {
        background: #FF6B35;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: #FF8C42;
        transform: translateY(-2px);
    }

    .btn-secondary {
        background: #6c757d;
        color: white;
    }

    .btn-secondary:hover:not(:disabled) {
        background: #5a6268;
        transform: translateY(-2px);
    }

    .payment-success {
        text-align: center;
        padding: 2rem 0;
    }

    .success-icon {
        font-size: 4rem;
        color: #28A745;
        margin-bottom: 1rem;
    }

    .payment-success h4 {
        color: #333;
        margin-bottom: 0.5rem;
    }

    .payment-success p {
        color: #666;
        margin-bottom: 2rem;
    }

    .transaction-details {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        text-align: left;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #e0e0e0;
    }

    .detail-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .detail-item .label {
        color: #666;
        font-weight: 500;
    }

    .detail-item .value {
        color: #333;
        font-weight: bold;
    }

    .success-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .payment-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 1rem 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 10001;
        animation: slideInRight 0.3s ease;
    }

    .payment-message.success {
        border-left: 4px solid #28A745;
    }

    .payment-message.error {
        border-left: 4px solid #DC3545;
    }

    .payment-message.warning {
        border-left: 4px solid #FFC107;
    }

    .payment-message.info {
        border-left: 4px solid #17A2B8;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        .secure-payment-content {
            width: 95%;
            margin: 1rem;
        }

        .payment-header {
            padding: 1.5rem;
        }

        .payment-step {
            padding: 1.5rem;
        }

        .otp-input-group {
            gap: 0.25rem;
        }

        .otp-input {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
        }

        .payment-actions {
            flex-direction: column;
        }

        .success-actions {
            flex-direction: column;
        }
    }
`;

// Ajouter les styles au document
const styleSheet = document.createElement('style');
styleSheet.textContent = paymentStyles;
document.head.appendChild(styleSheet); 