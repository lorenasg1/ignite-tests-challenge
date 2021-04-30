import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get the balance", async () => {
    const user = await createUserUseCase.execute({
      name: "user name",
      email: "user@email.com",
      password: "userpassword",
    });

    await authenticateUserUseCase.execute({
      email: "user@email.com",
      password: "userpassword",
    });

    await createStatementUseCase.execute({
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      amount: 300,
    });

    const balanceResponse = await getBalanceUseCase.execute({
      user_id: user.id!,
    });

    expect(balanceResponse.balance).toBe(300);
  });

  it("should not be able to get the balance of a non-existent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "non-existent",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
