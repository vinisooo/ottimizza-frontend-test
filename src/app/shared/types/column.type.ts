interface IColumnCreate {
  name: string;
  position: number;
  boardId: string;
}

interface IColumn extends IColumnCreate {
  id: string;
}

export type { IColumn, IColumnCreate };
