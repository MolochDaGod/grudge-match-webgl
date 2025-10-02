import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createTransferInstruction,
} from '@solana/spl-token';

export interface CharacterMintCost {
  baseCost: number;
  attributeMultiplier: number;
  totalCost: number;
}

export interface TokenBalance {
  balance: number;
  formatted: string;
}

export class GbuxTokenService {
  private connection: Connection;
  private gbuxMintAddress: PublicKey;
  private decimals: number = 6; // Standard GBUX token decimals

  constructor(connection: Connection) {
    this.connection = connection;
    // GBUX token mint address (this would be the actual GBUX token address)
    // For development, this might be a test token address
    this.gbuxMintAddress = new PublicKey(
      process.env.NEXT_PUBLIC_GBUX_TOKEN_MINT || 
      '11111111111111111111111111111111' // Placeholder for development
    );
  }

  /**
   * Get GBUX token balance for a wallet
   */
  async getTokenBalance(walletAddress: PublicKey): Promise<TokenBalance> {
    try {
      const associatedTokenAddress = await getAssociatedTokenAddress(
        this.gbuxMintAddress,
        walletAddress
      );

      const tokenAccount = await getAccount(this.connection, associatedTokenAddress);
      const balance = Number(tokenAccount.amount) / Math.pow(10, this.decimals);
      
      return {
        balance,
        formatted: balance.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })
      };
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        // Token account doesn't exist, balance is 0
        return { balance: 0, formatted: '0.00' };
      }
      throw error;
    }
  }

  /**
   * Calculate character minting cost based on attributes
   */
  calculateMintCost(attributes: {
    strength: number;
    defense: number;
    speed: number;
    intelligence: number;
  }): CharacterMintCost {
    const baseCost = 100; // 100 GBUX base cost
    const totalAttributes = attributes.strength + attributes.defense + attributes.speed + attributes.intelligence;
    const attributeMultiplier = Math.pow(1.1, totalAttributes - 40); // Exponential scaling from base 40 points
    const totalCost = Math.ceil(baseCost * attributeMultiplier);

    return {
      baseCost,
      attributeMultiplier,
      totalCost
    };
  }

  /**
   * Create transaction to pay for character minting
   */
  async createMintPaymentTransaction(
    payerWallet: PublicKey,
    recipientWallet: PublicKey, // Could be treasury or game wallet
    amount: number
  ): Promise<Transaction> {
    const transaction = new Transaction();

    // Get or create associated token accounts
    const payerTokenAddress = await getAssociatedTokenAddress(
      this.gbuxMintAddress,
      payerWallet
    );

    const recipientTokenAddress = await getAssociatedTokenAddress(
      this.gbuxMintAddress,
      recipientWallet
    );

    // Check if recipient token account exists, create if not
    try {
      await getAccount(this.connection, recipientTokenAddress);
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            payerWallet, // payer
            recipientTokenAddress, // associated token address
            recipientWallet, // owner
            this.gbuxMintAddress // mint
          )
        );
      }
    }

    // Add transfer instruction
    const transferAmount = amount * Math.pow(10, this.decimals);
    transaction.add(
      createTransferInstruction(
        payerTokenAddress,
        recipientTokenAddress,
        payerWallet,
        transferAmount
      )
    );

    return transaction;
  }

  /**
   * Get SOL balance for transaction fees
   */
  async getSolBalance(walletAddress: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(walletAddress);
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Estimate transaction fee
   */
  async estimateTransactionFee(transaction: Transaction): Promise<number> {
    const { feeCalculator } = await this.connection.getRecentBlockhash();
    return feeCalculator.lamportsPerSignature / LAMPORTS_PER_SOL;
  }

  /**
   * Validate if wallet has enough GBUX tokens for transaction
   */
  async validateTokenBalance(walletAddress: PublicKey, requiredAmount: number): Promise<boolean> {
    const balance = await this.getTokenBalance(walletAddress);
    return balance.balance >= requiredAmount;
  }

  /**
   * Validate if wallet has enough SOL for transaction fees
   */
  async validateSolBalance(walletAddress: PublicKey, estimatedFee: number): Promise<boolean> {
    const balance = await this.getSolBalance(walletAddress);
    const minSolRequired = estimatedFee + 0.001; // Add small buffer
    return balance >= minSolRequired;
  }
}