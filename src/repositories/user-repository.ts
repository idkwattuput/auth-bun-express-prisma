import { prisma } from "../database/db";

async function findByEmail(email: string) {
  return await prisma.users.findUnique({
    where: { email: email },
  });
}

async function findByRefreshToken(refreshToken: string) {
  return await prisma.users.findUnique({
    where: { refresh_token: refreshToken },
  });
}

async function save(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  return prisma.users.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
    },
  });
}

async function updateRefreshToken(id: number, refreshToken: string | null) {
  return prisma.users.update({
    where: { id: id },
    data: {
      refresh_token: refreshToken,
    },
  });
}

export default {
  findByEmail,
  findByRefreshToken,
  save,
  updateRefreshToken,
};
