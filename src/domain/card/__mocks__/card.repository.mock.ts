import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import generateBaseEntity from '../../../common/__mocks__/base.entity.util';
import { CardList } from '../../cardlist/cardlist.entity';
import { Card } from '../card.entity';
import { cardsTC } from './card.testcase';

export class MockCardRepository {

  save(partialCard: { position: number, title: string, cardList: CardList }) {
    const newCard: Card = {
      ...generateBaseEntity(),
      ...partialCard,
    };
    return new Promise(resolve => resolve(newCard));
  }

  findOne(id: number): Promise<Card> {
    return new Promise(resolve => resolve(cardsTC.find(card => card.id === id)));
  }

  findOneOrFail(id: number): Promise<Card> {
    const targetCard: Card = cardsTC.find(card => card.id === id);
    return new Promise((resolve, reject) => {
      targetCard ? resolve(targetCard) : reject(new EntityNotFoundError('Card', null))
    });
  }

}
