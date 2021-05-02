import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const transfer = await createTransferUseCase.execute({
      id,
      sender_id,
      amount,
      description,
      type: OperationType.TRANSFER,
    });

    return response.status(201).json(transfer);
  }
}
