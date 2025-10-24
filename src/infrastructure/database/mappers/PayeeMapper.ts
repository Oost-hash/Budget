import { Payee } from '@domain/entities/Payee';
import { PayeeEntity } from '../entities/PayeeEntity';
import { IBAN } from '@domain/value-objects/IBAN';

export class PayeeMapper {
  // Database → Domain
  static toDomain(entity: PayeeEntity): Payee {
    const iban = entity.iban ? IBAN.create(entity.iban) : null;

    return new Payee(
      entity.id,
      entity.name,
      iban
    );
  }

  // Domain → Database
  static toEntity(payee: Payee): PayeeEntity {
    const entity = new PayeeEntity();
    entity.id = payee.id;
    entity.name = payee.name;
    entity.iban = payee.iban?.toString() ?? null;
    return entity;
  }
}