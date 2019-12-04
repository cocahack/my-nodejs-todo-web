import { BaseEntity } from '../base.entity';

function generateId(begin = 1, end = 100000) {
  return Math.floor(Math.random() * end) + begin;
}

export default function generateBaseEntity(id = generateId()): BaseEntity {
  return {
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: false,
  };
}
