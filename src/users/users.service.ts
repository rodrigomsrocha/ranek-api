import { ConflictException, Injectable } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/database/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async craeteUser({
    email,
    name,
    password,
  }: CreateUserDto): Promise<UserModel> {
    const userAlreadyExists = await this.getUser({ where: { email } });
    if (userAlreadyExists) throw new ConflictException('User already exists');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        addresses: { create: [] },
      },
      include: { addresses: true },
    });
  }

  async getUser(query: object): Promise<UserModel | undefined> {
    return this.prisma.user.findFirst(query);
  }
}