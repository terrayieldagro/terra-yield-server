import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const { email, password } = dto;

    const existingUser = await this.prisma.admin.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.admin.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    return { message: 'User created successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.signTokens(user.id, user.email);

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, admin: { id: user.id, email: user.email } };
  }

  async refresh(userId: string, refresh: RefreshDto) {
    await this.verifyRefreshToken(refresh.refreshToken);

    const user = await this.prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const tokenMatch = await bcrypt.compare(
      refresh.refreshToken,
      user.refreshToken,
    );

    if (!tokenMatch) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.signTokens(user.id, user.email);

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(refreshToken: string) {
    const decoded = this.jwt.decode(refreshToken) as { sub: string };

    if (!decoded?.sub) return;

    await this.prisma.admin.update({
      where: { id: decoded.sub },
      data: { refreshToken: null },
    });
  }

  private async signTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);

    await this.prisma.admin.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
