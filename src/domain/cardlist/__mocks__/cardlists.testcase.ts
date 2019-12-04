import generateBaseEntity from '../../../common/__mocks__/base.entity.util';
import { CardList } from '../cardlist.entity';
import { CreateCardListDto } from '../dto/create-cardlistdto';

const createCardListDtos: CreateCardListDto[] = [
  { title: 'todo', position: 0 },
  { title: 'doing', position: 1 },
  { title: 'done', position: 2 },
];

export const cardListsTC: CardList[] = createCardListDtos.map((dto, id) => ({ ...generateBaseEntity(id), ...dto } as CardList));

export const nonexistentCardListId = cardListsTC.length;

export function findCardListById(id: number): CardList {
  return cardListsTC.find(cardList => cardList.id === id);
}

export const getTargetCardListId = () => Math.floor(Math.random() * cardListsTC.length);
