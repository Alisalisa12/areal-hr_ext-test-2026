import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import type { UserWithDetails } from 'src/users/entities/user.entity';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

interface RequestWithUser extends ExpressRequest {
  user: UserWithDetails;
}

@Controller('auth')
export class AuthController {
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: RequestWithUser): Promise<UserWithDetails> {
    await new Promise<void>((resolve, reject) => {
      req.logIn(req.user, (err: unknown) => {
        if (err) {
          return reject(
            err instanceof Error ? err : new Error('Не удалось войти'),
          );
        }
        resolve();
      });
    });
    return req.user;
  }

  @Get('profile')
  getProfile(@CurrentUser() user: UserWithDetails): UserWithDetails {
    return user;
  }

  @Post('logout')
  async logout(@Request() req: RequestWithUser): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      req.logOut((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException('Ошибка при завершении сеанса'),
          );
        }
        resolve();
      });
    });

    if (req.session) {
      await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            return reject(
              new InternalServerErrorException('Не удалось удалить сессию'),
            );
          }
          resolve();
        });
      });
    }
  }
}
