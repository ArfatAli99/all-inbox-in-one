import { Test, TestingModule } from '@nestjs/testing';
import { GoogleBusinessController } from './googlebuisness.controller';

describe('GoogleBusinessController', () => {
  let controller: GoogleBusinessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleBusinessController],
    }).compile();

    controller = module.get<GoogleBusinessController>(GoogleBusinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
