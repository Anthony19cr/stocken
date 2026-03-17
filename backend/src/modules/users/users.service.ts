import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserFiltersDto } from './dto/user-filters.dto'
import { UserResponseDto, PaginatedUsersDto } from './dto/user-response.dto'
import {
  AppException,
  ResourceNotFoundException,
} from '../../shared/exceptions/app.exception'
import { UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: UserFiltersDto): Promise<PaginatedUsersDto> {
    const { page = 1, pageSize = 20, search, role, isActive } = filters

    const where = {
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return { data: users as UserResponseDto[], total, page, pageSize }
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) throw new ResourceNotFoundException('Usuario', id)
    return user as UserResponseDto
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existing) {
      throw new AppException(
        'EMAIL_ALREADY_EXISTS',
        'Ya existe un usuario con ese email',
        { email: dto.email },
        409,
      )
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        role: dto.role ?? UserRole.VIEWER,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user as UserResponseDto
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findOne(id)

    const data: Record<string, unknown> = {}
    if (dto.fullName !== undefined) data.fullName = dto.fullName
    if (dto.role !== undefined) data.role = dto.role
    if (dto.isActive !== undefined) data.isActive = dto.isActive
    if (dto.password !== undefined) {
      data.passwordHash = await bcrypt.hash(dto.password, 12)
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user as UserResponseDto
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    await this.findOne(id)
    return this.update(id, { isActive: false })
  }
}