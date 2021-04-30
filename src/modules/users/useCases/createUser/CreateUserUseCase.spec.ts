import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a user", async () => {
    const user = {
      name: "user name",
      email: "user@email.com",
      password: "userpassword",
    };

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const createdUser = await inMemoryUsersRepository.findByEmail(user.email);

    expect(createdUser).toHaveProperty("id");
    expect(user.name).toBe("user name");
  });

  it("should not be able to create a user with an existent email", async () => {
    expect(async () => {
      const user = {
        name: "user name",
        email: "user@email.com",
        password: "userpassword",
      };

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password,
      });

      await createUserUseCase.execute({
        name: "user name",
        email: user.email,
        password: user.password,
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
