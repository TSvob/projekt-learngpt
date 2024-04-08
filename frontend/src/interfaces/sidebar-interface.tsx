export interface SidebarProps {
  templates: Array<{ id: string; template_name: string }>;
  setActiveTemplateId: (id: string) => void;
  onOpenModal: () => void;
}