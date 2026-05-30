-- CreateTable
CREATE TABLE "PropertyFeatures" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "propertyId" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "kitchens" INTEGER,
    "livingRooms" INTEGER,
    "floorNumber" INTEGER,
    "totalFloors" INTEGER,
    "furnishing" TEXT,
    "builtUpArea" REAL,
    "builtUpAreaUnit" TEXT,
    "parkingAvailable" BOOLEAN,
    "elevator" BOOLEAN,
    "security" BOOLEAN,
    "waterSupply" BOOLEAN,
    "electricity" BOOLEAN,
    CONSTRAINT "PropertyFeatures_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyFeatures_propertyId_key" ON "PropertyFeatures"("propertyId");
