/**
 * Grudge Tower - GBUX Wallet Integration Module
 * Handles Solana wallet connection and GBUX token transactions
 */

class GBUXWallet {
    constructor() {
        this.connection = null;
        this.wallet = null;
        this.isConnected = false;
        this.balance = 0;
        this.gbuxTokenMint = '55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray';
        this.adminWallet = 'DRJiootURSQeGhQXjLVpbnfDndpTG9DsPFo2oLaa5xpy';
        this.rpcEndpoint = 'https://api.mainnet-beta.solana.com';
        this.eventListeners = {
            connect: [],
            disconnect: [],
            balanceUpdate: [],
            transaction: []
        };
    }

    /**
     * Initialize the wallet connection
     */
    async initialize() {
        try {
            // Check if Solana wallet is available
            if (typeof window !== 'undefined' && window.solana) {
                this.wallet = window.solana;
                console.log('Solana wallet detected:', this.wallet.isPhantom ? 'Phantom' : 'Unknown');
            } else {
                console.warn('No Solana wallet detected');
                return false;
            }

            // Initialize Solana connection (in production, you'd use actual Solana Web3.js)
            this.connection = {
                getBalance: this.mockGetBalance.bind(this),
                sendTransaction: this.mockSendTransaction.bind(this),
                getTokenBalance: this.mockGetTokenBalance.bind(this)
            };

            return true;
        } catch (error) {
            console.error('Failed to initialize wallet:', error);
            return false;
        }
    }

    /**
     * Connect to the user's wallet
     */
    async connect() {
        try {
            if (!this.wallet) {
                throw new Error('No wallet detected. Please install Phantom wallet.');
            }

            // Request connection
            const response = await this.wallet.connect();
            this.isConnected = true;

            // Get wallet info
            const publicKey = response.publicKey || this.wallet.publicKey;
            
            // Mock wallet address for demo
            const walletAddress = publicKey?.toString() || this.adminWallet;
            
            // Get GBUX balance
            this.balance = await this.getGBUXBalance(walletAddress);

            // Trigger connect event
            this.emit('connect', {
                walletAddress,
                balance: this.balance
            });

            console.log('Wallet connected:', walletAddress);
            return {
                success: true,
                walletAddress,
                balance: this.balance
            };

        } catch (error) {
            console.error('Failed to connect wallet:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Disconnect wallet
     */
    async disconnect() {
        try {
            if (this.wallet && this.wallet.disconnect) {
                await this.wallet.disconnect();
            }
            
            this.isConnected = false;
            this.balance = 0;
            
            this.emit('disconnect');
            console.log('Wallet disconnected');
            
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    }

    /**
     * Get GBUX token balance
     */
    async getGBUXBalance(walletAddress) {
        try {
            // In production, this would query the actual Solana blockchain
            // For demo purposes, return a mock balance
            const mockBalance = this.getMockBalance(walletAddress);
            return mockBalance;
            
        } catch (error) {
            console.error('Failed to get GBUX balance:', error);
            return 0;
        }
    }

    /**
     * Purchase item with GBUX tokens
     */
    async purchaseItem(itemId, itemPrice, itemName) {
        try {
            if (!this.isConnected) {
                throw new Error('Wallet not connected');
            }

            if (this.balance < itemPrice) {
                throw new Error('Insufficient GBUX balance');
            }

            // Create transaction (mock for demo)
            const transaction = await this.createPurchaseTransaction(itemId, itemPrice);
            
            // Send transaction
            const signature = await this.sendTransaction(transaction);
            
            // Update local balance
            this.balance -= itemPrice;
            
            // Emit events
            this.emit('balanceUpdate', this.balance);
            this.emit('transaction', {
                type: 'purchase',
                itemId,
                itemName,
                amount: itemPrice,
                signature
            });

            return {
                success: true,
                signature,
                newBalance: this.balance
            };

        } catch (error) {
            console.error('Purchase failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create a purchase transaction
     */
    async createPurchaseTransaction(itemId, amount) {
        // This would create an actual Solana transaction in production
        return {
            type: 'transfer',
            from: this.wallet.publicKey?.toString() || 'user_wallet',
            to: this.adminWallet,
            amount: amount,
            tokenMint: this.gbuxTokenMint,
            memo: `Purchase item: ${itemId}`,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Send transaction to the blockchain
     */
    async sendTransaction(transaction) {
        // Mock transaction sending for demo
        const signature = this.generateMockSignature();
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Transaction sent:', {
            signature,
            transaction
        });

        return signature;
    }

    /**
     * Add event listener
     */
    addEventListener(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, callback) {
        if (this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Check transaction status
     */
    async getTransactionStatus(signature) {
        // Mock transaction status check
        return {
            signature,
            confirmed: true,
            blockTime: Date.now() / 1000,
            status: 'success'
        };
    }

    /**
     * Get transaction history
     */
    async getTransactionHistory(walletAddress, limit = 10) {
        // This would fetch actual transaction history from Solana
        const mockHistory = this.getMockTransactionHistory(walletAddress, limit);
        return mockHistory;
    }

    // Mock methods for demo purposes
    getMockBalance(walletAddress) {
        // Return different balances for different wallets for demo
        const balances = {
            [this.adminWallet]: 1000,
            'DemoWallet1': 250,
            'DemoWallet2': 150,
            'DemoWallet3': 500
        };
        
        return balances[walletAddress] || 250; // Default demo balance
    }

    async mockGetBalance(publicKey) {
        return 1000000000; // 1 SOL in lamports
    }

    async mockGetTokenBalance(walletAddress, tokenMint) {
        if (tokenMint === this.gbuxTokenMint) {
            return this.getMockBalance(walletAddress);
        }
        return 0;
    }

    async mockSendTransaction(transaction) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return this.generateMockSignature();
    }

    generateMockSignature() {
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 88; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    getMockTransactionHistory(walletAddress, limit) {
        const transactions = [];
        for (let i = 0; i < Math.min(limit, 5); i++) {
            transactions.push({
                signature: this.generateMockSignature(),
                timestamp: Date.now() - (i * 3600000), // Hour intervals
                type: i % 2 === 0 ? 'purchase' : 'received',
                amount: Math.floor(Math.random() * 50) + 10,
                status: 'confirmed',
                item: i % 2 === 0 ? `Demo Item ${i + 1}` : null
            });
        }
        return transactions;
    }

    /**
     * Validate GBUX token mint address
     */
    isValidGBUXToken(tokenMint) {
        return tokenMint === this.gbuxTokenMint;
    }

    /**
     * Format GBUX amount for display
     */
    formatGBUX(amount) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Get wallet connection status
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            walletAddress: this.wallet?.publicKey?.toString() || null,
            balance: this.balance,
            hasWallet: !!this.wallet
        };
    }

    /**
     * Request airdrop for testing (demo only)
     */
    async requestAirdrop(amount = 100) {
        if (!this.isConnected) {
            throw new Error('Wallet not connected');
        }

        // Mock airdrop for testing
        this.balance += amount;
        this.emit('balanceUpdate', this.balance);
        
        return {
            success: true,
            amount,
            newBalance: this.balance,
            signature: this.generateMockSignature()
        };
    }

    /**
     * Get wallet adapter info
     */
    getWalletInfo() {
        if (!this.wallet) return null;

        return {
            name: this.wallet.isPhantom ? 'Phantom' : 'Unknown Wallet',
            icon: this.wallet.isPhantom ? 'https://www.phantom.app/img/logo.png' : null,
            url: this.wallet.isPhantom ? 'https://phantom.app' : null,
            isConnected: this.isConnected
        };
    }

    /**
     * Switch network (mainnet/devnet)
     */
    async switchNetwork(network = 'mainnet') {
        const endpoints = {
            mainnet: 'https://api.mainnet-beta.solana.com',
            devnet: 'https://api.devnet.solana.com',
            testnet: 'https://api.testnet.solana.com'
        };

        if (endpoints[network]) {
            this.rpcEndpoint = endpoints[network];
            console.log(`Switched to ${network} network`);
            return true;
        }
        
        return false;
    }
}

// Auto-detect and setup wallet when page loads
let gbuxWallet = null;

// Initialize wallet when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        gbuxWallet = new GBUXWallet();
        await gbuxWallet.initialize();
        
        // Make it globally available
        window.gbuxWallet = gbuxWallet;
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GBUXWallet;
} else {
    window.GBUXWallet = GBUXWallet;
}