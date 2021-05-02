import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceError } from "../getBalance/GetBalanceError";
import { CreateTransferError } from "./CreateTransferError";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

interface IRequest {
  id: string;
  sender_id: string;
  amount: number;
  description: string;
  type: OperationType;
}

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ id, sender_id, amount, description, type }: IRequest) {
    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new CreateTransferError.UserNotFound();
    }

    const receiver = await this.usersRepository.findById(id);

    if (!receiver) {
      throw new CreateTransferError.ReceiverNotfound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    this.statementsRepository.create({
      user_id: sender_id,
      amount,
      description,
      type: OperationType.WITHDRAW,
    });

    this.statementsRepository.create({
      user_id: id,
      amount,
      description,
      type: OperationType.DEPOSIT,
    });
  }
}
