import { Module } from "@nestjs/common";
import { DataModule } from "./data/data.module";
import { ApplicationModule } from "./application/application.module";
import { PresentationModule } from "./presentation/presentation.module";

@Module({
  imports: [DataModule, ApplicationModule, PresentationModule],
})
export class AppModule {}
