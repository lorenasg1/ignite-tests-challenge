import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "../createUser/CreateUserError";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to authenticate a user", async () => {
    const user: ICreateUserDTO = {
      name: "user name",
      email: "user@email.com",
      password: "userpassword",
    };

    await createUserUseCase.execute(user);

    const response = await authenticateUserUseCase.execute({
      email: "user@email.com",
      password: "userpassword",
    });

    expect(response).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-existent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user@email.com",
        password: "userpassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with wrong password", async () => {
    const user: ICreateUserDTO = {
      name: "user name",
      email: "user@email.com",
      password: "userpassword",
    };

    await createUserUseCase.execute(user);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user@email.com",
        password: "user_password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
