import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import type { UserWithDetails } from 'src/users/entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(
    user: UserWithDetails,
    done: (err: Error | null, id: string) => void,
  ): void {
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user: UserWithDetails | null) => void,
  ): Promise<void> {
    try {
      const user = await this.usersService.getById(id);
      done(null, user);
    } catch (err) {
      done(err instanceof Error ? err : new Error(String(err)), null);
    }
  }
}
