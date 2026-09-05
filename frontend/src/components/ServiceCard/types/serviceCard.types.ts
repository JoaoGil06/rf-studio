export interface ServiceCardViewModel {
  name: string;
  initial: string;
  metaLabel: string;
  price: string;
  editLabel: string;
  deleteLabel: string;
}

export interface ServiceCardProps {
  id: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
