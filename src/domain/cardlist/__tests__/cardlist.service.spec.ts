import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { CardList } from '../cardlist.entity';
import { CardListService } from '../cardlist.service';
import { CreateCardListDto } from '../dto/create-cardlistdto';
import { MockCardListRepository } from '../__mocks__/cardlists.repository.mock';
import { cardListsTC, nonexistentCardListId } from '../__mocks__/cardlists.testcase';

describe('CardListService', () => {
  let cardListService: CardListService;

  beforeEach(async () => {
    const cardListModule: TestingModule = await Test.createTestingModule({
      providers: [
        CardListService,
        {
          provide: getRepositoryToken(CardList),
          useValue: new MockCardListRepository(),
        },
      ],
    }).compile();

    cardListService = cardListModule.get<CardListService>(CardListService);
  });

  it('should be defined', () => {
    expect(cardListService).toBeDefined();
  });

  it('should return new CardList', () => {
    const createCardListDto = new CreateCardListDto('test', 9);

    expect(cardListService.create(createCardListDto)).resolves.toMatchObject(createCardListDto);
  });

  it('should return CardList', () => {
    const targetId = 0;
    expect(cardListService.find(targetId)).resolves.toEqual(cardListsTC.find(cardList => cardList.id === targetId));
  });

  it('should return all CardLists', () => {
    expect(cardListService.findAll()).resolves.toEqual(cardListsTC);
  });

  it('should return modified CardList', () => {
    const targetId = 0;
    const updateCardListDto: CreateCardListDto = new CreateCardListDto('test', 2);

    expect(cardListService.update(targetId, updateCardListDto)).resolves.toMatchObject(updateCardListDto);
  });

  it('should throw error when attempts to update nonexistent CardList', () => {
    const targetId = nonexistentCardListId;

    expect(cardListService.update(targetId, null)).rejects.toThrow(EntityNotFoundError);
  });

  it('should set isActive true', () => {
    const targetId = 0;

    expect(cardListService.delete(targetId)).resolves.toBeTruthy();
  });

  it('should throw error when attempts to delete nonexistent CardList', () => {
    expect(cardListService.delete(nonexistentCardListId)).rejects.toThrow(EntityNotFoundError);
  });

});
