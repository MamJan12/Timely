<<<<<<< HEAD
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) throw new NotFoundException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, role: user.role };
  }

  async logout(refreshToken: string) {
    const token = await this.authRepository.findRefreshToken(refreshToken);
    if (!token) throw new UnauthorizedException('Invalid refresh token');
    await this.authRepository.deleteRefreshToken(refreshToken);
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(refreshToken: string) {
    const storedToken = await this.authRepository.findRefreshToken(refreshToken);
    if (!storedToken) throw new UnauthorizedException('Invalid refresh token');
    if (new Date() > storedToken.expiresAt) {
      await this.authRepository.deleteRefreshToken(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.authRepository.findUserById(storedToken.userId);
    if (!user) throw new NotFoundException('User not found');

    await this.authRepository.deleteRefreshToken(refreshToken);
    return this.generateTokens(user.id, user.email, user.role);
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiration') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiration') as any,
      }),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.saveRefreshToken({
      token: refreshToken,
      expiresAt,
      user: { connect: { id: userId } },
    });

    return { accessToken, refreshToken };
  }
=======
import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signup() {}

  signin() {}
>>>>>>> 01baa886891db1263d9ee5b1ee826fbf9abdf4b9
}
