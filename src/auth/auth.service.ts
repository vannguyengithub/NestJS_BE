import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { parseDuration } from '../utils/time.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid === true) {
        return user;
      }
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    const refresh_token = this.createRefreshToken(payload);
    // update refresh token
    await this.usersService.updateUserToken(_id, refresh_token);

    // set refresh_token as cookies
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true, // only accessible by the web server
      maxAge: parseDuration(
        this.configService.get<string>('JWT_REFRESH_EXPIRE') || '7d',
      ),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
      },
    };
  }

  async register(user: RegisterUserDto) {
    const newUser = await this.usersService.register(user);

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  createRefreshToken = (payload: IUser) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: parseDuration(
        this.configService.get<string>('JWT_REFRESH_EXPIRE') || '7d',
      ),
    });

    return refresh_token;
  };

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findUserByToken(refreshToken);
      if (user) {
        // update refresh token
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id: _id.toString(),
          name,
          email,
          role,
        };

        const refresh_token = this.createRefreshToken(payload);
        // update refresh token
        await this.usersService.updateUserToken(_id.toString(), refresh_token);
        // set refresh_token as cookies
        response.clearCookie('refresh_token');

        response.cookie('refresh_token', refresh_token, {
          httpOnly: true, // only accessible by the web server
          maxAge: parseDuration(
            this.configService.get<string>('JWT_REFRESH_EXPIRE') || '7d',
          ),
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id: _id.toString(),
            name,
            email,
            role,
          },
        };
      } else {
        throw new BadRequestException('User not found');
      }
    } catch (error) {
      throw new BadRequestException(
        `Refresh token is invalid. Please login again. ${error}`,
      );
    }
  };

  logout = async (response: Response, user: IUser) => {
    await this.usersService.updateUserToken(user._id, '');
    response.clearCookie('refresh_token');
    return 'ok';
  };
}
