export default class Sport {
    id: string;
    name: string;
    category: SportCategory;
    slug: string;
    imageUrl: string;
    status: string;

    constructor(id: string, 
        name: string, 
        category: SportCategory, 
        slug: string, 
        imageUrl: string, 
        status: string) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.slug = slug;
        this.imageUrl = imageUrl;
        this.status = status;
    }
}

export enum SportCategory {
    Indoor = 'indoor',
    Outdoor = 'outdoor',
    Water = 'water',
    Winter = 'winter',
    Extreme = 'extreme',
    Other = 'other'
}

export enum SportStatus {
    Active = 'active',
    Inactive = 'inactive'
}