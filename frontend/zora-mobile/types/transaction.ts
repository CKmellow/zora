export type TransactionStatus =
  | 'pending'
  | 'funded'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface Transaction {
  id: string;
  product: string;
  description: string;
  price: number;
  buyerName: string;
  productImage: string | null;
  status: TransactionStatus;
  createdAt: string;
}