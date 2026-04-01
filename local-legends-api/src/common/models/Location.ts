export default class Location {
    id: string;
    googlePlaceId: string;
    name: string;
    description?: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    latitude: number;
    longitude: number;

    constructor(
        id: string, 
        googlePlaceId: string, 
        name: string, 
        streetAddress: string, 
        city: string, 
        state: string,
        zip: string,
        latitude: number,
        longitude: number,
        description?: string
    ) {
        this.id = id;
        this.googlePlaceId = googlePlaceId;
        this.name = name;
        this.streetAddress = streetAddress;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
    }
}