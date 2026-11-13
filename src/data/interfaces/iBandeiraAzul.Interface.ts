import { BandeiraAzul } from "../entities/bandeiraAzul.Entity";

export interface IBandeiraAzulRepository {
  find(): Promise<BandeiraAzul | null>;
  save(data: BandeiraAzul): Promise<BandeiraAzul>;
}
