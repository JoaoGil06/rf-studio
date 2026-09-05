export interface ClientRowViewModel {
  name: string;
  initial: string;
  phoneNumber: string;
  email: string;
  editLabel: string;
  deleteLabel: string;
}

export interface ClientRowProps {
  id: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
