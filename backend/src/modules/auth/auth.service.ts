import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { AuthResponseDto } from './dto/auth-response.dto'
import {
  AppException,
  UnauthorizedException,
} from '../../shared/exceptions/app.exception'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    if (!user.isActive) {
      throw new AppException('USER_INACTIVE', 'Usuario inactivo', undefined, 403)
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role)

    return {
      ...tokens,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    }
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const tokenHash = this.hashToken(refreshToken)

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado')
    }

    if (!stored.user.isActive) {
      throw new AppException('USER_INACTIVE', 'Usuario inactivo', undefined, 403)
    }

    await this.prisma.refreshToken.delete({ where: { tokenHash } })

    const tokens = await this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
    )

    return {
      ...tokens,
      user: {
        id: stored.user.id,
        fullName: stored.user.fullName,
        email: stored.user.email,
        role: stored.user.role,
      },
    }
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken)
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } })
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    const accessToken = this.jwtService.sign(payload)

    const refreshToken = crypto.randomBytes(64).toString('hex')
    const tokenHash = this.hashToken(refreshToken)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.prisma.refreshToken.create({
      data: { tokenHash, userId, expiresAt },
    })

    return { accessToken, refreshToken }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }
}