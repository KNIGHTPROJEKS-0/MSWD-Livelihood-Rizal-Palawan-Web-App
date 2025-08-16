// MSWD Webstudio Types
export interface MSWDComponent {
  id: string;
  type: 'form' | 'card' | 'status' | 'upload';
  props: Record<string, any>;
  children?: MSWDComponent[];
}

export interface MSWDFormField {
  name: string;
  type: 'text' | 'select' | 'file' | 'date' | 'number';
  label: string;
  required: boolean;
  options?: string[];
}

export interface MSWDProgram {
  id: string;
  name: string;
  description: string;
  fields: MSWDFormField[];
}

export interface WebstudioConfig {
  apiUrl: string;
  components: MSWDComponent[];
  programs: MSWDProgram[];
}