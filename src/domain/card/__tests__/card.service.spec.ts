import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { CardListService } from '../../cardlist/cardlist.service';
import { cardListsTC } from '../../cardlist/__mocks__/cardlists.testcase';
import { Card } from '../card.entity';
import { CardService } from '../card.service';
import { CreateCardDto } from '../dto/create-carddto';
import { MockCardRepository } from '../__mocks__/card.repository.mock';
import { cardsTC, getTargetCardId, nonexistentCardId } from '../__mocks__/card.testcase';

describe('CardService', () => {

  let cardService: CardService;
  let cardListService: CardListService;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: new MockCardRepository(),
        },
        {
          provide: CardListService,
          useValue: {},
        },
      ],

    }).compile();

    cardService = module.get<CardService>(CardService);
    cardListService = module.get(CardListService);

  });

  it('should be defined', () => expect(cardService).toBeDefined());

  it('should return Card has id 0', async () => {
    const targetId = getTargetCardId();
    expect(cardService.find(targetId)).resolves.toEqual(cardsTC.find(card => card.id === targetId));
  });

  it('should create new Card', async () => {
    cardListService.find = jest.fn(id => new Promise(resolve => resolve(cardListsTC.find(cardList => cardList.id === id))));

    const cardListId = cardListsTC[0].id;
    const createCardDto: CreateCardDto = {
      title: 'test',
      position: 4,
      cardListId,
    };

    const card: Card = await cardService.create(createCardDto);

    compareCardToCardDto(card, createCardDto);
    expect(card.cardList.id).toBe(cardListId);
  });

  it('should update Card has id 0', async () => {
    const targetId = getTargetCardId();
    const createCardDto: CreateCardDto = {
      title: 'test',
      position: 4,
      cardListId: null,
    };

    const modifiedCard: Card = await cardService.update(targetId, createCardDto);

    compareCardToCardDto(modifiedCard, createCardDto);
  });

  it('should occur EntityNotFoundError when updates nonexistent entity', async () => {
    expect(cardService.update(nonexistentCardId, null)).rejects.toThrow(EntityNotFoundError);
  });

  it('should return true when removes existent Card', async () => {
    const targetId = getTargetCardId();
    expect(cardService.delete(targetId)).resolves.toBeTruthy();
  });

  it('should return false when remove nonexistent Card', async () => {
    expect(cardService.delete(nonexistentCardId)).rejects.toThrow(EntityNotFoundError);
  });

});

function compareCardToCardDto(expectCard: Card, actualCardDto: { title: string, position: number}) {
  expect(expectCard.title).toBe(actualCardDto.title);
  expect(expectCard.position).toBe(actualCardDto.position);
}
