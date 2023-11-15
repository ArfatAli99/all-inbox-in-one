import { Test, TestingModule } from '@nestjs/testing';
import { FbinboxController } from './fbinbox.controller';

describe('FbinboxController', () => {
  let controller: FbinboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FbinboxController],
    }).compile();

    controller = module.get<FbinboxController>(FbinboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
