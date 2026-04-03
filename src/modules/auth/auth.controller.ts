import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwt: JwtService,
  ) {}

  @Post('signup')
  signup(@Body() signup: SignupDto) {
    return this.authService.signup(signup);
  }

  @Post('login')
  login(@Body() login: LoginDto) {
    return this.authService.login(login);
  }

  @Post('refresh')
  refresh(@Body() refresh: RefreshDto) {

    const decoded = this.jwt.decode(refresh.refreshToken);

    if (!decoded.sub) {
      throw new UnauthorizedException('Invalid token');
    }
    return this.authService.refresh(decoded.sub, refresh);
  }

  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  // logout(@CurrentUser() user: { id: string; email: string }) {
  //   return this.authService.logout(user.id);
  // }
  logout(@Body() body: { refreshToken: string }) {
    return this.authService.logout(body.refreshToken);
  }
}
