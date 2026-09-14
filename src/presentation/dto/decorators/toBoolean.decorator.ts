import { Transform } from "class-transformer";

export const ToBoolean = () =>
  Transform(({ value }) => value === true || value === "true");
