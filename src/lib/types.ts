export type ScheduleType = "daily" | "weekday" | "date";

export type ScheduleConfig = {
  weekdays?: number[];
  date?: string;
  startTime?: string;
};

export type Family = {
  id: string;
  code: string;
  created_at: string;
};

export type Routine = {
  id: string;
  family_id: string;
  name: string;
  schedule_type: ScheduleType;
  schedule_config: ScheduleConfig;
  sort_order: number;
  created_at: string;
};

export type Task = {
  id: string;
  routine_id: string;
  title: string;
  emoji: string | null;
  image_url: string | null;
  duration_sec: number;
  sort_order: number;
  created_at: string;
};

export type Completion = {
  id: string;
  task_id: string;
  date: string;
  completed_at: string;
};

export type RoutineWithTasks = Routine & { tasks: Task[] };
