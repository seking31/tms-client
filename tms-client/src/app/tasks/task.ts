export interface Task {
  _id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  projectId?: string | number;
  dateCreated?: string;
  dateModified?: string;
}

export type AddTaskDTO = Omit<
  Task,
  '_id' | 'projectId' | 'dateCreated' | 'dateModified'
>;
