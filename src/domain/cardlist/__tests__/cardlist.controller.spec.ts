import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import generateBaseEntity from '../../../common/__mocks__/base.entity.util';
import { CardListController } from '../cardlist.controller';
import { CardList } from '../cardlist.entity';
import { CardListService } from '../cardlist.service';
import { CreateCardListDto } from '../dto/create-cardlistdto';
import { cardListsTC, findCardListById, getTargetCardListId, nonexistentCardListId } from '../__mocks__/cardlists.testcase';

describe('CardListController', () => {
  let app: INestApplication;
  let cardListController: CardListController;
  let cardListService: CardListService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CardListController],
      providers: [
        {
          provide: CardListService,
          useValue: {},
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cardListController = moduleFixture.get(CardListController);
    cardListService = moduleFixture.get(CardListService);
  });

  it('/cardlists/:id (GET)', () => {
    cardListService.find = jest.fn(id => new Promise(resolve => resolve(findCardListById(Number(id)))));
    const targetId = 0;

    return request(app.getHttpServer())
      .get(`/cardlists/${targetId}`)
      .expect(200)
      .expect(res => expect(JSON.stringify(res.body)).toBe(JSON.stringify(findCardListById(targetId))));
  });

  it('/cardlists (GET)', () => {
    cardListService.findAll = jest.fn(() => new Promise(resolve => resolve(cardListsTC)));

    return request(app.getHttpServer())
      .get('/cardlists')
      .expect(200)
      .expect(res => expect(JSON.stringify(res.body)).toBe(JSON.stringify(cardListsTC)));
  });

  it('/cardlists (POST)', () => {
    cardListService.create = jest.fn((createCardListDto: CreateCardListDto) => {
        return new Promise(resolve => resolve({
          ...generateBaseEntity(),
          ...createCardListDto,
          cards: null,
        }));
      });
    const newCreateCardListDto: CreateCardListDto = new CreateCardListDto('test', 0);

    return request(app.getHttpServer())
      .post('/cardlists')
      .send(newCreateCardListDto)
      .expect(201)
      .expect(res => expect(res.body).toMatchObject(newCreateCardListDto));
  });

  it('/cardlists/:id (PUT)', () => {
    const targetId: number = getTargetCardListId();
    const targetCardList: CardList = findCardListById(targetId);

    cardListService.update = jest.fn((id, createCardDto) => {
      return new Promise(resolve => resolve({
        ...targetCardList,
        ...createCardDto,
      }));
    });
    const newUpdateCardListDto: CreateCardListDto = new CreateCardListDto('test', 2);

    return request(app.getHttpServer())
      .put(`/cardlists/${targetId}`)
      .send(newUpdateCardListDto)
      .expect(200)
      .expect(res => {
        expect(res.body).toMatchObject(newUpdateCardListDto);
      });
  });

  it('/cardlists/:id (PUT) with wrong id', () => {
    cardListService.update = jest.fn((id, dto) => new Promise((resolve, reject) => reject(new EntityNotFoundError('CardList', null))));

    return request(app.getHttpServer())
      .put(`/cardlists/${nonexistentCardListId}`)
      .expect(404);
  });

  it('/cardlists/:id (DELETE)', () => {
    cardListService.delete = jest.fn(id => new Promise(resolve => resolve(cardListsTC.some(cardList => cardList.id === Number(id)))));

    const targetId = getTargetCardListId();

    return request(app.getHttpServer())
      .delete(`/cardlists/${targetId}`)
      .expect(200)
      .expect(res => expect(res.body).toBeTruthy());
  });

  it('/cardlists/:id (DELETE) with wrong id', () => {
    cardListService.delete = jest.fn(id => new Promise((resolve, reject) => reject(new EntityNotFoundError('CardList', null))));

    return request(app.getHttpServer())
      .delete(`/cardlists/${nonexistentCardListId}`)
      .expect(404);
  });

});
