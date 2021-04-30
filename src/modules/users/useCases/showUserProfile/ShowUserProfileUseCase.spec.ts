import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show user's profile", async () => {
    await createUserUseCase.execute({
      name: "user name",
      email: "user@email.com",
      password: "userpassword",
    });

    const response = await authenticateUserUseCase.execute({
      email: "user@email.com",
      password: "userpassword",
    });

    const userProfile = await showUserProfileUseCase.execute(response.user.id!);

    expect(userProfile).toHaveProperty("id");
  });

  it("should be able to show a non-existent user profile", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("non-existent");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
