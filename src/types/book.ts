/* eslint-disable  */
// @ts-nocheck

export interface BookData {
    _id: string;
    title: string;
    titleTranslations: Record<string, string>;
    author: string;
    authorTranslations: Record<string, string>;
    description: string;
    descriptionTranslations: Record<string, string>;
    publisher: string;
    publicationYear: number;
    isbn: string;
    category: string;
    tags: string[];
    language: string;
    fileUrl: string;
    coverImageUrl: string;
    fileSize: number;
    pageCount: number;
    downloadCount: number;
    viewCount: number;
    isFeatured: boolean;
    uploadDate: Date;
    uploadedBy: string;
    isActive: boolean;
    metadata: Record<string, unknown>;
    contentType: string;
}



export interface BookListResponse {
    data : {
        books: BookData[];
        total: number;
        page?: number;
        limit?: number;
    }
}
