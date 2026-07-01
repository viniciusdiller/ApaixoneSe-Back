import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/db/prisma.Service';

export type AuthTokenTypeValue = 'VERIFY_EMAIL' | 'RESET_PASSWORD';

@Injectable()
export class AuthTokenRepository {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, tokenHash: string, type: AuthTokenTypeValue, expiresAt: Date) {
    return await this.prisma.authToken.create({
      data: { userId, tokenHash, type, expiresAt }
    });
  }

  async findByToken(tokenHash: string) {
    return await this.prisma.authToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
  }

  async delete(id: string) {
    return await this.prisma.authToken.delete({ where: { id } });
  }
}