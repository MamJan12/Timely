import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterLecturerDto } from './dto/register-lecturer.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive JWT tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register/admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Self-register a new admin account' })
  @ApiResponse({ status: 201, description: 'Admin account created and logged in' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  @Public()
  @Get('lecturers/search')
  @ApiOperation({ summary: 'Search existing lecturers by name (for account claiming during registration)' })
  searchLecturers(@Query('name') name: string) {
    return this.authService.searchLecturers(name ?? '');
  }

  @Public()
  @Post('register/lecturer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Self-register a new lecturer account' })
  @ApiResponse({ status: 201, description: 'Account created and logged in' })
  @ApiResponse({ status: 409, description: 'Staff ID or email already registered' })
  registerLecturer(@Body() dto: RegisterLecturerDto) {
    return this.authService.registerLecturer(dto);
  }

  @Public()
  @Post('register/student')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Self-register a new student account' })
  @ApiResponse({ status: 201, description: 'Account created and logged in' })
  @ApiResponse({ status: 409, description: 'Student ID or email already registered' })
  registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  getProfile(@CurrentUser('userId') userId: string) {
    return this.authService.getProfile(userId);
  }
}
