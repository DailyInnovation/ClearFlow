export interface Item {
  id: string;
  text: string;
  checked: boolean;
}

export interface Kit {
  id: string;
  name: string;
  items: Item[];
}
