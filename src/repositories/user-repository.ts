import type { PrismaClient } from "@prisma/client";

export class UserRepository {
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByEmail(email: string) {
    return await this.prisma.users.findUnique({
      where: { email: email },
    });
  }

  async findByRefreshToken(refreshToken: string) {
    return await this.prisma.users.findUnique({
      where: { refresh_token: refreshToken },
    });
  }

  async save(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    return this.prisma.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      },
    });
  }

  async updateRefreshToken(id: number, refreshToken: string | null) {
    return this.prisma.users.update({
      where: { id: id },
      data: {
        refresh_token: refreshToken,
      },
    });
  }
}
