# Property Schema

This document describes the active property-related data model in `prisma/schema.prisma`, plus the application input and AI validation schemas.

> `prisma/schema.prisma` is the source of truth. `prisma/client/schema.prisma` is generated, and `prisma/schema.prisma.new` is an older alternative schema.

## Database

Database provider: PostgreSQL. Prisma scalar types used below are `Int`, `Float`, `String`, `Boolean`, `DateTime`, and `Json`.

### `Property`

| Field | Type | Required/default | Notes |
|---|---|---|---|
| `id` | Int | required, primary key, autoincrement | Internal ID |
| `propertyId` | String? | optional, unique | Public/property identifier |
| `types` | PropertyType[] | required, default `[]` | PostgreSQL enum array; multiple property types allowed |
| `purposes` | PropertyPurpose[] | required, default `[]` | PostgreSQL enum array; usually sale or rent |
| `natures` | PropertyNature[] | relation | Residential, commercial, etc. |
| `status` | String | default `pending` | `approved`, `pending`, `rejected`, `warned` |
| `soldStatus` | String | default `unsold` | `soldByUs`, `soldByOther`, `unsold` |
| `isFeatured` | Boolean | default `false` | Featured listing flag |
| `isExclusive` | Boolean | default `false` | Exclusive listing flag |
| `isVerified` | Boolean | default `false` | Verification flag |
| `remarks` | String? | optional | Description/remarks |
| `roadType` | String? | optional | Road type |
| `roadSize` | String? | optional | Road width/size |
| `facingDirection` | String? | optional | Direction property faces |
| `location` | PropertyLocation? | optional relation | One-to-one |
| `price` | Json? | optional | Current normalized price object |
| `detailedPrice` | Json? | optional | Array of price objects |
| `openHouse` | PropertyOpenHouse? | optional relation | One-to-one |
| `features` | PropertyFeatures? | optional relation | One-to-one |
| `media` | Json? | optional | Additional media metadata |
| `mainMedia` | String? | optional | Main image/media URL |
| `amenities` | Json? | optional | Nearby/property amenities |
| `listedById` | Int | required | Foreign key to `User.id` |
| `listedBy` | User | required relation | Listing owner/agent |
| `title` | String | required | Listing title |
| `slug` | String? | optional | URL slug |
| `locationData` | Json? | optional | Legacy/additional location data |
| `created_on` | DateTime | default `now()` | Creation timestamp |
| `updated_at` | DateTime | auto-updated | Last update timestamp |
| `views` | Int | default `0` | View count |
| `shares` | Int | default `0` | Share count |
| `comments` | Comment[] | relation | Property comments |
| `property_likes` | Like[] | relation | User likes |
| `featured_history` | FeaturedInformation[] | relation | Featured status history |
| `collections` | CollectionProperty[] | relation | Saved collections |

### Lookup tables and enums

#### `PropertyType` enum

The former `PropertyType` lookup table has been removed. `Property.types` is now a PostgreSQL enum array:

```prisma
enum PropertyType {
  house
  bungalow
  land
  apartment
  commercial_space
  villa
  penthouse
}

model Property {
  types PropertyType[]
}
```

The database enum uses `commercial_space`; application labels may display this as `commercial space`.





#### `PropertyPurpose` enum

```prisma
enum PropertyPurpose {
  sale
  rent
}

model Property {
  purposes PropertyPurpose[]
}
```

Multiple values may be stored, for example `[sale, rent]`.

### Detail tables

#### `PropertyFeatures`

| Field | Type | Required/default | Notes |
|---|---|---|---|
| `id` | Int | primary key, autoincrement | |
| `propertyId` | Int | required, unique | FK to `Property.id`; cascade delete |
| `property` | Property | required relation | |
| `bedrooms`, `bathrooms`, `kitchens`, `livingRooms` | Int? | optional | Room counts |
| `floorNumber`, `totalFloors` | Int? | optional | Floor information |
| `furnishing` | String? | optional | Unfurnished, Semi-furnished, Full-furnished |
| `builtUpArea` | Float? | optional | Area value |
| `builtUpAreaUnit` | String? | optional | `sqft`, `sqm`, `aana`, `ropani` |
| `parkingAvailable` | Boolean? | optional | |
| `elevator` | Boolean? | optional | |
| `security` | Boolean? | optional | |
| `waterSupply` | Boolean? | optional | |
| `electricity` | Boolean? | optional | |

#### `PropertyLocation`

| Field | Type | Required/default | Notes |
|---|---|---|---|
| `id` | Int | primary key, autoincrement | |
| `propertyId` | Int | required, unique | FK; cascade delete |
| `property` | Property | required relation | |
| `latitude`, `longitude` | Float? | optional | Coordinates |
| `country` | String | default `Nepal` | |
| `province` | String | required | |
| `district` | String | required | |
| `cityVillage` | String | required | |
| `area`, `ward`, `landmark`, `distanceFrom` | String? | optional | Locality and nearby landmark data |

#### `PropertyOpenHouse`

| Field | Type | Required/default | Notes |
|---|---|---|---|
| `id` | Int | primary key, autoincrement | |
| `propertyId` | Int | required, unique | FK; cascade delete |
| `property` | Property | required relation | |
| `markOpenHouse` | Boolean | default `false` | |
| `date` | DateTime? | optional | Open-house date |
| `startTime`, `endTime` | String? | optional | Time strings |
| `latitude`, `longitude` | Float? | optional | Event coordinates |

#### `PropertyImage`

| Field | Type | Required/default | Notes |
|---|---|---|---|
| `id` | Int | primary key, autoincrement | |
| `propertyId` | Int | required | FK; cascade delete |
| `property` | Property | required relation | |
| `url` | String | required | Image URL |
| `imageOf` | String | required | Examples: kitchen, bedroom, livingroom |
| `filename` | String | required | Standardized stored filename |

#### `PropertyVideo`

| Field | Type | Required/default | Notes |
|---|---|---|---|
| `id` | Int | primary key, autoincrement | |
| `propertyId` | Int | required | FK; cascade delete |
| `property` | Property | required relation | |
| `url` | String | required | Video URL |
| `type` | String | required | YouTube, Instagram Reel, Facebook Reel, Shorts, TikTok, etc. |

### Property interaction and organization tables

#### `FeaturedInformation`

`id Int` primary key/autoincrement; `property_id Int` required FK; `property Property` relation; `is_active Boolean` default `true`; `featured_on DateTime` default `now()`; `featured_till DateTime?` optional.

#### `Comment`

`id Int` primary key/autoincrement; `content String` required; `created_at DateTime` default `now()`; `property_id Int` required FK; `property Property` relation; `user_id Int` required FK; `user User` relation.

#### `Like`

`id Int` primary key/autoincrement; `created_at DateTime` default `now()`; `property_id Int` required FK; `property Property` relation; `user_id Int` required FK; `user User` relation. Unique constraint: `[property_id, user_id]`.

#### `CollectionProperty`

`id Int` primary key/autoincrement; `collection_id Int` required FK; `collection Collection` relation; `property_id Int` required FK; `property Property` relation; `added_at DateTime` default `now()`. Unique constraint: `[collection_id, property_id]`. Both relations cascade on delete.

### Supporting tables used by property workflows

#### `PropertyDraft`

`id Int` primary key/autoincrement; `changes Json` required; `doing String` default `creation` (`creation` or `edit`); `created_by Int` FK; `createdBy User` relation; `account_id Int` FK; `account User` relation; `status String` default `draft` (`draft`, `published`, `discarded`); `created_at DateTime` default `now()`; `updated_at DateTime` auto-updated. Indexes: `[account_id, status]`, `[created_by]`.

#### `Requirement`

`id Int` primary key/autoincrement; `userId Int?` optional FK; `user User?` relation; `mode String` default `simple`; `content String?`; `propertyTypes String?`; `purposes String?`; `natures String?`; `facings String?`; `district String?`; `cityVillage String?`; `area String?`; `roadAccess String?`; `minPrice Float?`; `maxPrice Float?`; `pricingUnit String?`; `latitude Float?`; `longitude Float?`; `remarks String?`; `is_public Boolean` default `true`; `status String` default `active`; `created_at DateTime` default `now()`; `updated_at DateTime` auto-updated. Comma-separated fields: `propertyTypes`, `purposes`, `natures`, `facings`.

#### `Location`

`id Int` primary key/autoincrement; `name String`; `type String`; `parentId Int?`; `parent Location?`; `children Location[]`; `details Json?`. Unique constraint: `[name, type, parentId]`; index: `[parentId]`.

## Application input schema

Source: [`lib/services/property.ts`](/Users/neupkishor/Code/namsari/lib/services/property.ts:18).

```ts
type CreatePropertyInput = {
  propertyId?: string;
  types: string[];
  purposes: string[];
  natures: string[];
  title: string;
  slug?: string;
  status?: string;
  soldStatus?: string;
  isFeatured?: boolean;
  isExclusive?: boolean;
  isVerified?: boolean;
  remarks?: string;
  roadType?: string;
  roadSize?: string;
  facingDirection?: string;
  location: {
    latitude?: number; longitude?: number; country?: string;
    province: string; district: string; cityVillage: string;
    area?: string; ward?: string; landmark?: string; distanceFrom?: string;
  };
  locationData?: Record<string, unknown>;
  amenities?: { type: string; name?: string; distance?: string }[];
  price?: PropertyPriceInput;
  detailedPrice?: PropertyPriceInput[];
  pricing?: LegacyPricingInput;
  openHouse?: {
    markOpenHouse?: boolean; date?: Date; startTime?: string; endTime?: string;
    latitude?: number; longitude?: number;
  };
  features?: {
    bedrooms?: number; bathrooms?: number; kitchens?: number; livingRooms?: number;
    floorNumber?: number; totalFloors?: number; furnishing?: string;
    builtUpArea?: number; builtUpAreaUnit?: string;
    parkingAvailable?: boolean; elevator?: boolean; security?: boolean;
    waterSupply?: boolean; electricity?: boolean;
  };
  listedById: number;
  images: { url: string; imageOf: string; filename: string }[];
  videos?: { url: string; type: string }[];
};
```

## Pricing schema

Source: [`lib/pricing.ts`](/Users/neupkishor/Code/namsari/lib/pricing.ts:1).

```ts
type PropertyPriceRate = 'total' | 'perUnit' | 'perMonth' | 'perUnitPerMonth';

type PropertyPriceInput = {
  price: number;
  rate: PropertyPriceRate;
  unit?: string;
  totalUnit?: number;
  totalPrice?: number;
};

type LegacyPricingInput = {
  negotiable?: boolean;
  pricingType?: string;
  unit?: string;
  price: number;
  priceInWords?: string;
  priceNegotiable?: number;
  priceNegotiableInWords?: string;
  rentPrice?: number;
};
```

Default pricing rates:

- Sale house/apartment/villa/etc.: `total`
- Rent house/apartment/villa/etc.: `perMonth`
- Land sale: `perUnit`
- Land rent: `perUnitPerMonth`
- Commercial space: `perUnitPerMonth`

## AI chat validation schema

Source: [`lib/ai/property-chat.ts`](/Users/neupkishor/Code/namsari/lib/ai/property-chat.ts:11). These fields are optional unless explicitly marked by the flow.

- `propertyChatMessageSchema`: `role` = `user | assistant`; `content` = string.
- `propertyPriceSchema`: `price` number, `rate` = `total | perUnit | perMonth | perUnitPerMonth`, `unit` string, `totalUnit` number, `totalPrice` number.
- `propertyLocationSchema`: `country`, `province`, `district`, `cityVillage`, `area`, `ward`, `landmark`, `distanceFrom` strings; `latitude`, `longitude` numbers.
- `propertyFeatureSchema`: bedrooms, bathrooms, kitchens, livingRooms, floorNumber, totalFloors, builtUpArea numbers; furnishing and builtUpAreaUnit strings; parkingAvailable, elevator, security, waterSupply, electricity booleans.
- `propertyOpenHouseSchema`: markOpenHouse boolean; date, startTime, endTime strings; latitude and longitude numbers.
- `propertyChatDraftSchema`: mode `create | edit`; edit/duplicate IDs numbers; title, remarks, status, soldStatus, roadType, roadSize, facingDirection strings; types, purposes, natures arrays; location, price, detailedPrice, openHouse, features, amenities, images.
- `propertyChatInputSchema`: messages, optional draft/defaultRate, optional audio `{ dataUrl, mimeType, durationSeconds <= 60 }`, and optional user context.
- `propertyChatOutputSchema`: `assistantMessage` string; `draft` object; `missingFields` string array; `readyToCreate` boolean; optional `readyToUpdate` boolean.

## Legacy schema differences

`prisma/schema.prisma.new` is not the active schema. It defines `Property.propertyType` and `Property.propertyPurpose` as single strings and uses a separate `PropertyPricing` table with `negotiable`, `pricingType`, `unit`, `price`, `priceInWords`, `priceNegotiable`, `priceNegotiableInWords`, and `rentPrice`. The active schema instead uses `PropertyType[]`, the `PropertyPurpose` enum array, `PropertyNature[]`, and JSON pricing fields on `Property`.
