import generateBaseEntity from '../../../common/__mocks__/base.entity.util';
import { CardList } from '../../cardlist/cardlist.entity';
import { cardListsTC } from '../../cardlist/__mocks__/cardlists.testcase';
import { Card } from '../card.entity';
import { CreateCardDto } from '../dto/create-carddto';

const testCreateCardDto: CreateCardDto[] = cardListsTC.map((cardList: CardList): CreateCardDto[] => {
  return [
   {
     title: 'a',
     position: 0,
     cardListId: cardList.id,
   },
   {
     title: 'b',
     position: 1,
     cardListId: cardList.id,
   },
   {
     title: 'c',
     position: 2,
     cardListId: cardList.id,
   },
  ];
}).reduce((acc, createCardDtos) => [...acc, ...createCardDtos], []);

const cardsTC = testCreateCardDto.map((createCardDto: CreateCardDto, id): Card => {
  return {
    ...generateBaseEntity(id),
    ...createCardDto,
    cardList: cardListsTC.find(cardList => cardList.id === createCardDto.cardListId),
  };
});

function findCardById(id: number): Card {
  return cardsTC.find(card => card.id === id);
}

const getTargetCardId = () => Math.floor(Math.random() * cardsTC.length);

const nonexistentCardId = cardsTC.length;

export { cardsTC, findCardById, getTargetCardId, nonexistentCardId };

