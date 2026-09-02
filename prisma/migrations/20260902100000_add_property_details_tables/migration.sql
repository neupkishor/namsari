CREATE TYPE "HouseFurnishing" AS ENUM ('unfurnsihed', 'semifurnished', 'furnished');
CREATE TYPE "ApartmentFurnishing" AS ENUM ('fullFurnished', 'semiFurnished', 'unfurnished');
CREATE TYPE "SpaceFurnishing" AS ENUM ('fullFurnished', 'semiFurnished', 'unfurnished');

CREATE TABLE "property_details_land" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "landArea" DECIMAL(18,10) NOT NULL,
    "dimension" VARCHAR(48) NOT NULL,
    "plotNumber" TEXT NOT NULL,
    "moreDetails" JSONB NOT NULL,
    CONSTRAINT "property_details_land_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_details_land_propertyId_key" UNIQUE ("propertyId"),
    CONSTRAINT "property_details_land_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "property_details_house" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "builtUpArea" DECIMAL(18,10) NOT NULL,
    "bedrooms" SMALLINT NOT NULL,
    "bathrooms" SMALLINT NOT NULL,
    "kitchens" SMALLINT NOT NULL,
    "livingRooms" SMALLINT NOT NULL,
    "diningRooms" SMALLINT NOT NULL,
    "totalRooms" SMALLINT NOT NULL,
    "totalFloors" DECIMAL(18,10) NOT NULL,
    "yearBuilt" TIMESTAMP(3) NOT NULL,
    "furnishing" "HouseFurnishing" NOT NULL,
    "parking" SMALLINT NOT NULL,
    "moreDetails" JSONB NOT NULL,
    CONSTRAINT "property_details_house_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_details_house_propertyId_key" UNIQUE ("propertyId"),
    CONSTRAINT "property_details_house_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "property_details_apartment" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "builtUpArea" DECIMAL(18,10) NOT NULL,
    "bedrooms" SMALLINT NOT NULL,
    "bathrooms" SMALLINT NOT NULL,
    "kitchens" SMALLINT NOT NULL,
    "livingRooms" SMALLINT NOT NULL,
    "diningRooms" SMALLINT NOT NULL,
    "floorNumber" SMALLINT NOT NULL,
    "furnishing" "ApartmentFurnishing" NOT NULL,
    "hasBalcony" BOOLEAN NOT NULL,
    "parking" SMALLINT NOT NULL,
    "yearBuilt" TIMESTAMP(3) NOT NULL,
    "moreDetails" JSONB NOT NULL,
    CONSTRAINT "property_details_apartment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_details_apartment_propertyId_key" UNIQUE ("propertyId"),
    CONSTRAINT "property_details_apartment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "property_details_space" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "spaceType" VARCHAR NOT NULL,
    "totalArea" DECIMAL(18,10) NOT NULL,
    "onFloor" SMALLINT NOT NULL,
    "furnishing" "SpaceFurnishing" NOT NULL,
    "bathrooms" SMALLINT NOT NULL,
    "parking" SMALLINT NOT NULL,
    "moreDetails" JSONB NOT NULL,
    CONSTRAINT "property_details_space_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_details_space_propertyId_key" UNIQUE ("propertyId"),
    CONSTRAINT "property_details_space_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
