import { Test, TestingModule } from '@nestjs/testing';
import { MessageproService } from './messagepro.service';

describe('MessageproService', () => {
  let service: MessageproService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageproService],
    }).compile();

    service = module.get<MessageproService>(MessageproService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
