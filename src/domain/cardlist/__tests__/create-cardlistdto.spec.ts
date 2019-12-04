import { CreateCardListDto } from '../dto/create-cardlistdto';
describe('CreateCardListDto', () => {

  it('should have properties those name are title and position repectively', () => {
    const title = 'todo';
    const position = 0;

    const createCardListDto = new CreateCardListDto(title, position);

    expect(createCardListDto.title).toBe(title);
    expect(createCardListDto.position).toBe(position);

  });

});
