import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create statement", () => {
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
  });

  it("should be able to create a statement", async () => {
    const user = await createUserUseCase.execute({
      name: "user name",
      email: "user@email.com",
      password: "userpassword",
    });

    await authenticateUserUseCase.execute({
      email: "user@email.com",
      password: "userpassword",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      amount: 300,
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a statement to a non-existent user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "non-existent",
        type: OperationType.DEPOSIT,
        description: "deposit test",
        amount: 300,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a withdraw statement greater than balance", async () => {
    expect(async () => {
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
        type: OperationType.WITHDRAW,
        description: "deposit test",
        amount: 300,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
