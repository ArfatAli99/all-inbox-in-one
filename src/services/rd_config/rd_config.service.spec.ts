import { Test, TestingModule } from '@nestjs/testing';
import { RdConfigService } from './rd_config.service';

describe('RdConfigService', () => {
  let service: RdConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RdConfigService],
    }).compile();

    service = module.get<RdConfigService>(RdConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
