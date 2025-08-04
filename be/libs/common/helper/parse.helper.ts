import { ValidationError } from '@nestjs/common';

export function errorFormatter(errors: ValidationError[]): string {
  return errors
    .map((error) => {
      const constraints = error.constraints
        ? Object.values(error.constraints)
        : [];
      return `${error.property}: ${constraints.join(', ')}`;
    })
    .join('; ');
}
