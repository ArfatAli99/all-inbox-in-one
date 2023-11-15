import { Test, TestingModule } from '@nestjs/testing';
import { FbinboxService } from './fbinbox.service';

describe('FbinboxService', () => {
  let service: FbinboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FbinboxService],
    }).compile();

    service = module.get<FbinboxService>(FbinboxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
