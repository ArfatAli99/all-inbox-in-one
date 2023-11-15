import { Test, TestingModule } from '@nestjs/testing';
import { MessageproController } from './messagepro.controller';

describe('MessageproController', () => {
  let controller: MessageproController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageproController],
    }).compile();

    controller = module.get<MessageproController>(MessageproController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
