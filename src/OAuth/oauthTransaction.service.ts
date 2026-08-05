import { randomBytes, randomBase64Url } from "../utils/CryptoRandom";
import { deleteTransaction, getOAuthTransaction, storeOAuthTransaction } from "../utils/RedisSessionStore";
import { CreateOAuthTransactionInput, OAuthProviderName, OAuthTransactionResult } from "./types/oauth.types";



class OAuthTransactionService {

    async createTransaction(provider: OAuthProviderName): Promise<OAuthTransactionResult>{
        const state  = randomBase64Url(32);
        const codeVerifier  = randomBase64Url(32)
        const transactionId = randomBytes(16)
        return await storeOAuthTransaction(transactionId, {state, codeVerifier, provider});
    };

    async getTransaction(tId: string): Promise<CreateOAuthTransactionInput> {
        const transaction = await getOAuthTransaction(tId)
        return transaction
    };

    async deleteTransaction(tId: string): Promise<void> {
        await deleteTransaction(tId)
    };

}
