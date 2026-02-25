interface ITaskCreate {
  name: string;
  position: number;
  createdAt: string;
  dueDate: string;
  completed: boolean;
  tags: string[];
  columnId: string;
}

interface ITask extends ITaskCreate {
  id: string;
}

export type { ITask, ITaskCreate };
