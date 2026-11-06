import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../providers/db/prisma.Service";
import { IBandeiraAzulRepository } from "../interfaces/iBandeiraAzul.Interface";
import { BandeiraAzul } from "../entities/bandeiraAzul.Entity";

@Injectable()
export class BandeiraAzulRepository implements IBandeiraAzulRepository {
  constructor(private readonly prisma: PrismaService) {}

  // A página é única: existe no máximo um registro
  async find(): Promise<BandeiraAzul | null> {
    const registro = await this.prisma.bandeiraAzul.findFirst({
      orderBy: { createdAt: "asc" },
    });
    return registro ? this.toEntity(registro) : null;
  }

  async save(data: BandeiraAzul): Promise<BandeiraAzul> {
    const campos = {
      titulo: data.titulo,
      subtitulo: data.subtitulo ?? null,
      bannerImagens: (data.bannerImagens ?? []) as unknown as Prisma.InputJsonValue,
      blocos: data.blocos as unknown as Prisma.InputJsonValue,
    };

    const existente = await this.prisma.bandeiraAzul.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    const salvo = existente
      ? await this.prisma.bandeiraAzul.update({
          where: { id: existente.id },
          data: campos,
        })
      : await this.prisma.bandeiraAzul.create({ data: campos });

    return this.toEntity(salvo);
  }

  private toEntity(registro: {
    id: string;
    titulo: string;
    subtitulo: string | null;
    bannerImagens: Prisma.JsonValue | null;
    blocos: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  }): BandeiraAzul {
    return new BandeiraAzul({
      ...registro,
      bannerImagens: (registro.bannerImagens ?? []) as unknown as string[],
      blocos: registro.blocos as unknown as BandeiraAzul["blocos"],
    });
  }
}
