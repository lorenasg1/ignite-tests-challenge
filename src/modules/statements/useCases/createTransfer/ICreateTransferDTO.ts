enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export interface ICreateTransferDTO {
  amount: number;
  description: string;
  type: OperationType;
  recipient_id: string;
  sender_id: string;
}
