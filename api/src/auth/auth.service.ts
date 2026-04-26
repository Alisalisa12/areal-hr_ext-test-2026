import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserWithDetails } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserWithDetails | null> {
    const user = await this.usersService.findByLogin(login);

    if (!user || !user.password_hash) {
      return null;
    }

    const isPasswordValid = await argon2.verify(user.password_hash, password);

    if (isPasswordValid) {
      const { password_hash, ...result } = user;
      return result as UserWithDetails;
    }

    return null;
  }
}
