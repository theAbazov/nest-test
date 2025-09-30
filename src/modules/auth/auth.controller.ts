import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiConflictResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from '../../common/dto/register.dto';
import { LoginDto } from '../../common/dto/login.dto';
import { AuthResponseDto } from '../../common/dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Регистрация нового пользователя',
    description: 'Создает новую учетную запись пользователя и возвращает JWT токен',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Пользователь успешно зарегистрирован',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ 
    description: 'Неверные данные валидации',
    schema: {
      example: {
        success: false,
        data: null,
        error: {
          statusCode: 400,
          message: 'Ошибка валидации',
          errors: {
            email: ['должен быть корректным email'],
            password: ['должен быть не менее 6 символов']
          }
        }
      }
    }
  })
  @ApiConflictResponse({ 
    description: 'Пользователь с таким email уже существует',
    schema: {
      example: {
        success: false,
        data: null,
        error: {
          statusCode: 409,
          message: 'User with this email already exists'
        }
      }
    }
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { user, access_token } = await this.authService.register(registerDto);
    return new AuthResponseDto(user, access_token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Вход в систему',
    description: 'Аутентификация пользователя по email и паролю',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Успешный вход в систему',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ 
    description: 'Неверные данные валидации' 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Неверный email или пароль',
    schema: {
      example: {
        success: false,
        data: null,
        error: {
          statusCode: 401,
          message: 'Invalid credentials'
        }
      }
    }
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const { user, access_token } = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return new AuthResponseDto(user, access_token);
  }
}