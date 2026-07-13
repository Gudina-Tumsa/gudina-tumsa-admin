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
    fileUrl: string | null;
    coverImageUrl: string;
    fileSize: number;
    pageCount: number;
    downloadCount: number;
    viewCount: number;
    isFeatured: boolean;
    isTodaysSelection: boolean;
    uploadDate: Date;
    uploadedBy: string;
    isActive: boolean;
    metadata: Record<string, unknown>;
    contentType: string;
    price: number;
    payable: boolean;
    audioSummarizationUrl: string | null;
}



export interface BookListResponse {
    data : {
        books: BookData[];
        total: number;
        page?: number;
        limit?: number;
    }
}
