import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import generateBaseEntity from '../../../common/__mocks__/base.entity.util';
import { CardList } from '../cardlist.entity';
import { cardListsTC } from './cardlists.testcase';
import { find } from 'rxjs/operators';

export class MockCardListRepository {

  save(partialCardList: { position: number, title: string }) {
    const newCardList: CardList = {
      ...generateBaseEntity(),
      ...partialCardList,
      cards: null,
    };
    return new Promise(resolve => resolve(newCardList));
  }

  findOne(id: number): Promise<CardList> {
    return new Promise(resolve => resolve(cardListsTC.find(cardList => cardList.id === id)));
  }

  findOneOrFail(id: number): Promise<CardList> {
    const targetCardList: CardList = cardListsTC.find(cardList => cardList.id === id);
    return new Promise((resolve, reject) => {
      targetCardList ? resolve(targetCardList) : reject(new EntityNotFoundError('CardList', null));
    });

  }

  find(options): Promise<CardList[]> {
    return new Promise(resolve => resolve(cardListsTC));
  }

}
