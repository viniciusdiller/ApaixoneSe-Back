import { EventoPrincipal } from "../entities/eventoPrincipal.Entity";

export interface IEventoPrincipalRepository {
  save(data: EventoPrincipal): Promise<EventoPrincipal>;
  findAll(): Promise<EventoPrincipal[]>;
  findById(id: string): Promise<EventoPrincipal | null>;
  update(id: string, data: Partial<EventoPrincipal>): Promise<EventoPrincipal>;
  delete(id: string): Promise<void>;
}
