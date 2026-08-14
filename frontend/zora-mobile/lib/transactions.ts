import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types/transaction';

const TRANSACTIONS_KEY = '@zora_transactions';

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to get transactions:', error);
    return [];
  }
}

export async function getTransaction(
  id: string
): Promise<Transaction | null> {
  const transactions = await getTransactions();

  return (
    transactions.find(
      (transaction) => transaction.id === id
    ) ?? null
  );
}

export async function saveTransaction(
  transaction: Transaction
): Promise<void> {
  try {
    const transactions = await getTransactions();

    const updatedTransactions = [
      transaction,
      ...transactions.filter(
        (item) => item.id !== transaction.id
      ),
    ];

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(updatedTransactions)
    );
  } catch (error) {
    console.error('Failed to save transaction:', error);
    throw error;
  }
}

export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>
): Promise<Transaction | null> {
  try {
    const transactions = await getTransactions();

    const index = transactions.findIndex(
      (transaction) => transaction.id === id
    );

    if (index === -1) {
      return null;
    }

    const updatedTransaction = {
      ...transactions[index],
      ...updates,
    };

    transactions[index] = updatedTransaction;

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(transactions)
    );

    return updatedTransaction;
  } catch (error) {
    console.error('Failed to update transaction:', error);
    throw error;
  }
}
