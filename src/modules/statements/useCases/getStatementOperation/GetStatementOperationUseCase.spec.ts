import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let inMemoryStatementRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get statement operation", () => {
  beforeEach(() => {
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    inMemoryUserRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUserRepository,
      inMemoryStatementRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUserRepository,
      inMemoryStatementRepository
    );
  });

  it("should be able to get a statement operation", async () => {
    const user = await createUserUseCase.execute({
      name: "user name",
      email: "user@email.com",
      password: "userpassword",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      amount: 300,
    });

    const operation = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!,
    });

    expect(operation).toHaveProperty("id");
  });

  it("should be able to get a statement operation to a non-existent user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "non-existent",
        statement_id: "statement id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should be able to get a statement operation of a non-existent statement", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "user name",
        email: "user@email.com",
        password: "userpassword",
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: "non-existent",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
