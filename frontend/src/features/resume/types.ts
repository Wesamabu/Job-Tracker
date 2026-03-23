export type ResumeCategory = 'general' | 'tech' | 'management' | 'internship' | 'other';

export interface Resume {
    id: string;
    title: string;
    category: ResumeCategory;
    fileName: string;
    fileFormat: 'PDF' | 'DOC' | 'DOCX';
    fileSize: string;
    uploadDate: string;
    tags: string[];
    description?: string;
    isPrimary: boolean;
}
