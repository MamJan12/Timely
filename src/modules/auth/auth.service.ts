import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterLecturerDto } from './dto/register-lecturer.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    // Try email first, then staffId (lecturers), then studentId (students)
    const user =
      (await this.authRepository.findUserByEmail(dto.identifier)) ??
      (await this.authRepository.findUserByStaffId(dto.identifier)) ??
      (await this.authRepository.findUserByStudentId(dto.identifier));

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

  async registerAdmin(dto: RegisterAdminDto) {
    const emailTaken = await this.authRepository.findUserByEmail(dto.email);
    if (emailTaken) throw new ConflictException('Email is already registered. Please sign in.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user   = await this.authRepository.createAdminAccount({ ...dto, password: hashed });
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, role: user.role };
  }

  async searchLecturers(name: string) {
    if (!name || name.trim().length < 2) return [];
    return this.authRepository.searchLecturersByName(name.trim());
  }

  async registerLecturer(dto: RegisterLecturerDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    if (dto.claimLecturerId) {
      // The lecturer is claiming an existing record — link their credentials to it
      const lecturer = await this.authRepository.findLecturerById(dto.claimLecturerId);
      if (!lecturer) throw new NotFoundException('Lecturer record not found.');

      // Allow if the email belongs to the same user being claimed, deny if taken by someone else
      const emailUser = await this.authRepository.findUserByEmail(dto.email);
      if (emailUser && emailUser.id !== lecturer.userId) {
        throw new ConflictException('Email is already registered by a different account. Please use a different email.');
      }

      const result = await this.authRepository.claimLecturerAccount(dto.claimLecturerId, { email: dto.email, password: hashed });
      const tokens = await this.generateTokens(result.user.id, result.user.email, result.user.role);
      return { ...tokens, role: result.user.role, staffId: result.staffId };
    }

    // Standard registration — create a brand-new Lecturer record
    const emailTaken = await this.authRepository.findUserByEmail(dto.email);
    if (emailTaken) throw new ConflictException('Email is already registered. Please sign in.');

    const user = await this.authRepository.createLecturerAccount({ ...dto, password: hashed });
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, role: user.role, staffId: user.lecturer?.staffId };
  }

  async registerStudent(dto: RegisterStudentDto) {
    const [idTaken, emailTaken] = await Promise.all([
      this.authRepository.isStudentIdTaken(dto.studentId),
      this.authRepository.findUserByEmail(dto.email),
    ]);
    if (idTaken) throw new ConflictException('Student ID already has an account. Please sign in.');
    if (emailTaken) throw new ConflictException('Email is already registered. Please sign in.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.authRepository.createStudentAccount({ ...dto, password: hashed });
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, role: user.role };
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
}
