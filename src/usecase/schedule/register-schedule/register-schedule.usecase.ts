import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { ScheduleFactory } from '../../../domain/entity/schedule/factory/schedule.factory.js';
import { IScheduleDiscountRepository } from '../../../domain/repository/schedule-discount-repository.interface.js';
import { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import { DiscountReason } from '../../../domain/service/discount/discount-rule.interface.js';
import { DiscountService } from '../../../domain/service/discount/discount.service.js';
import { ScheduleConflictService } from '../../../domain/service/schedule-conflict/schedule-conflict.service.js';
import { IFeatureFlagProvider } from '../../interfaces/feature-flag-provider.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { RegisterScheduleInputDto, RegisterScheduleOutputDto } from './register-schedule.dto.js';
import { registerScheduleSchema } from './register-schedule.schema-validator.js';

export class RegisterScheduleUseCase {
  private readonly scheduleRepository: IScheduleRepository;
  private readonly userRepository: IUserRepository;
  private readonly scheduleDiscountRepository: IScheduleDiscountRepository;
  private readonly serviceRepository: IServiceRepository;
  private readonly validationAdapter: IValidationAdapter;
  private readonly discountService: DiscountService;
  private readonly featureFlagProvider: IFeatureFlagProvider;

  constructor(
    scheduleRepository: IScheduleRepository,
    userRepository: IUserRepository,
    scheduleDiscountRepository: IScheduleDiscountRepository,
    serviceRepository: IServiceRepository,
    validationAdapter: IValidationAdapter,
    discountService: DiscountService,
    featureFlagProvider: IFeatureFlagProvider,
  ) {
    this.scheduleRepository = scheduleRepository;
    this.userRepository = userRepository;
    this.scheduleDiscountRepository = scheduleDiscountRepository;
    this.serviceRepository = serviceRepository;
    this.validationAdapter = validationAdapter;
    this.discountService = discountService;
    this.featureFlagProvider = featureFlagProvider;
  }

  async execute(input: RegisterScheduleInputDto): Promise<RegisterScheduleOutputDto> {
    const validatedData = this.validationAdapter.validate<RegisterScheduleInputDto>(
      registerScheduleSchema,
      input,
    );

    const user = await this.userRepository.findById(validatedData.userId);

    if (!user) throw new EntityNotFoundError(`User not found: ${validatedData.userId}`);

    const service = await this.serviceRepository.findById(validatedData.serviceId);

    if (!service) throw new EntityNotFoundError(`Service not found: ${validatedData.serviceId}`);

    const conflict = await ScheduleConflictService.hasConflict(
      validatedData.date,
      service.durationMinutes,
      this.scheduleRepository,
    );
    if (conflict) {
      throw new ConflictError(`Time slot already booked: ${validatedData.date.toISOString()}`);
    }

    const schedule = ScheduleFactory.create({
      userId: validatedData.userId,
      serviceId: validatedData.serviceId,
      date: validatedData.date,
      status: validatedData.status,
      photoUrl: validatedData.photoUrl ?? null,
    });

    await this.scheduleRepository.save(schedule);

    const enabled = new Set<DiscountReason>();
    if (await this.featureFlagProvider.isEnabled('loyalty')) enabled.add('loyalty');
    if (await this.featureFlagProvider.isEnabled('birthday')) enabled.add('birthday');

    if (enabled.size > 0) {
      let loyaltyCompletedCount = 0;
      let loyaltyGrantedCount = 0;

      if (enabled.has('loyalty')) {
        [loyaltyCompletedCount, loyaltyGrantedCount] = await Promise.all([
          this.scheduleRepository.countCompletedForLoyalty(schedule.userId),
          this.scheduleDiscountRepository.countByUserAndReason(schedule.userId, 'loyalty'),
        ]);
      }

      const discount = this.discountService.resolveBest(
        {
          scheduleDate: schedule.date,
          birthDate: user.birthDate,
          loyaltyCompletedCount,
          loyaltyGrantedCount,
        },
        enabled,
      );

      if (discount) {
        await this.scheduleDiscountRepository.save({
          scheduleId: schedule.id,
          userId: schedule.userId,
          reason: discount.reason,
          percentage: discount.percentage,
        });
      }
    }

    return {
      id: schedule.id,
      userId: schedule.userId,
      serviceId: schedule.serviceId,
      status: schedule.status.value,
      date: schedule.date.toISOString(),
      photoUrl: schedule.photoUrl,
      createdAt: schedule.createdAt.toISOString(),
    };
  }
}
