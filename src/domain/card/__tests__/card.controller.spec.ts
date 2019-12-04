import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import generateBaseEntity from '../../../common/__mocks__/base.entity.util';
import { cardListsTC } from '../../cardlist/__mocks__/cardlists.testcase';
import { CardController } from '../card.controller';
import { Card } from '../card.entity';
import { CardService } from '../card.service';
import { CreateCardDto } from '../dto/create-carddto';
import { cardsTC, findCardById, getTargetCardId, nonexistentCardId } from '../__mocks__/card.testcase';

describe('CardController', () => {
  let app: INestApplication;
  let cardController: CardController;
  let cardService: CardService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        {
          provide: CardService,
          useValue: {},
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cardController = moduleFixture.get(CardController);
    cardService = moduleFixture.get(CardService);
  });

  it('/cards/:id (GET)', () => {
    cardService.find = jest.fn(id => new Promise(resolve => resolve(findCardById(Number(id)))));
    const targetId = 0;

    return request(app.getHttpServer())
      .get(`/cards/${targetId}`)
      .expect(200)
      .expect(res => expect(JSON.stringify(res.body)).toBe(JSON.stringify(findCardById(targetId))));
  });

  it('/cards (POST)', () => {
    cardService.create = jest.fn((createCardDto: CreateCardDto) => {
        return new Promise(resolve => resolve({
          ...generateBaseEntity(),
          ...createCardDto,
          cardList: cardListsTC.find(cardList => cardList.id === createCardDto.cardListId),
        }));
      });
    const newCreateCardDto: CreateCardDto = new CreateCardDto('test', 0, cardListsTC[0].id);

    return request(app.getHttpServer())
      .post('/cards')
      .send(newCreateCardDto)
      .expect(201)
      .expect(res => compareCardToCardDto(res.body, newCreateCardDto));
  });

  it('/cards/:id (PUT)', () => {
    const targetId: number = getTargetCardId();
    const targetCard: Card = findCardById(targetId);

    cardService.update = jest.fn((id, createCardDto) => {
      return new Promise(resolve => resolve({
        ...targetCard,
        ...createCardDto,
      }));
    });
    const newUpdateCardDto: CreateCardDto = new CreateCardDto('test', 2, targetCard.cardList.id);

    return request(app.getHttpServer())
      .put(`/cards/${targetId}`)
      .send(newUpdateCardDto)
      .expect(200)
      .expect(res => {
        compareCardToCardDto(res.body, newUpdateCardDto);
        expect(res.body.cardList.id).toBe(newUpdateCardDto.cardListId);
      });
  });

  it('/cards/:id (PUT) with wrong id', () => {
    cardService.update = jest.fn((id, dto) => new Promise((resolve, reject) => reject(new EntityNotFoundError('Card', null))));

    return request(app.getHttpServer())
      .put(`/cards/${nonexistentCardId}`)
      .expect(404);
  });

  it('/cards/:id (DELETE)', () => {
    cardService.delete = jest.fn(id => new Promise(resolve => resolve(cardsTC.some(card => card.id === Number(id)))));

    const targetId = getTargetCardId();

    return request(app.getHttpServer())
      .delete(`/cards/${targetId}`)
      .expect(200)
      .expect(res => expect(res.body).toBeTruthy());
  });

  it('/cards/:id (DELETE) with wrong id', () => {
    cardService.delete = jest.fn(id => new Promise((resolve, reject) => reject(new EntityNotFoundError('Card', null))));

    return request(app.getHttpServer())
      .delete(`/cards/${nonexistentCardId}`)
      .expect(404);
  });

});

function compareCardToCardDto(card: Card, cardDto: { title: string, position: number}) {
  expect(card).toMatchObject(cardDto);
}
