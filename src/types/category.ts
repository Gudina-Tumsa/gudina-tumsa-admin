
export interface CategoryListResponse  {
    data : {
        categories: CategoryData[];
        total: number;
        page?: number;
        limit?: number;
    }

}

export interface CategoryData {
    _id: string;
    name: string;
    nameTranslations: Record<string, string>;
    description: string;
    parentCategory?: string | null;
    icon: string;
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}