interface IBoardCreate {
  name: string;
}

interface IBoard extends IBoardCreate {
  id: string;
}

export type { IBoard, IBoardCreate };
