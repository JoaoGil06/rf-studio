// É necessário ser um domain service porque:
// Envolve o repositório (mas se envolvesse mais do que uma entidade também seria
// Tem de ser usado por múltiplos useCases (registerSchedule, updateSchedule ...)
// A entedidade Schedule (sem mais nenhuma dependência) não conseguia calcular conflitos

import { IScheduleRepository } from '../../repository/schedule-repository.interface.js';

export class ScheduleConflictService {
  public static async hasConflict(
    start: Date,
    durationMinutes: number,
    repo: IScheduleRepository,
    excludeId?: string,
  ): Promise<boolean> {
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    const overlapping = await repo.findOverlapping(start, end, excludeId);
    return overlapping.length > 0;
  }
}
