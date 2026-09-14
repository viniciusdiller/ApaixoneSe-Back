import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "MustAccept", async: false })
class MustAcceptConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return value === true;
  }

  defaultMessage(): string {
    return "É necessário aceitar o Termo de Adesão para enviar o cadastro.";
  }
}

export function MustAccept(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: MustAcceptConstraint,
    });
  };
}
