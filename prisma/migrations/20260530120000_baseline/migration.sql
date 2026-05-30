-- CreateEnum
CREATE TYPE "account_type" AS ENUM ('user', 'agent', 'agency', 'admin', 'owner', 'advertiser', 'bank');

-- CreateEnum
CREATE TYPE "account_provider" AS ENUM ('bank', 'agency');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "contact_number" TEXT,
    "type" TEXT NOT NULL DEFAULT 'user',
    "bio" TEXT,
    "profile_picture" TEXT,
    "cover_image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "moreInfo" TEXT,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "agency_id" INTEGER,
    "roleId" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "type" "account_type" NOT NULL,
    "provider" "account_provider",
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "password_hash" TEXT,
    "role" INTEGER,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "permissions" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" SERIAL NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission_map" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permission_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "author_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYC" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "propertyId" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "soldStatus" TEXT NOT NULL DEFAULT 'unsold',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "roadType" TEXT,
    "roadSize" TEXT,
    "facingDirection" TEXT,
    "media" JSONB,
    "mainMedia" TEXT,
    "amenities" JSONB,
    "listedById" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "authorizedPersonId" INTEGER,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "propertyCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PropertyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPurpose" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PropertyPurpose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyNature" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PropertyNature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyFeatures" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "kitchens" INTEGER,
    "livingRooms" INTEGER,
    "floorNumber" INTEGER,
    "totalFloors" INTEGER,
    "furnishing" TEXT,
    "builtUpArea" DOUBLE PRECISION,
    "builtUpAreaUnit" TEXT,
    "parkingAvailable" BOOLEAN,
    "elevator" BOOLEAN,
    "security" BOOLEAN,
    "waterSupply" BOOLEAN,
    "electricity" BOOLEAN,

    CONSTRAINT "PropertyFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyLocation" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "country" TEXT NOT NULL DEFAULT 'Nepal',
    "district" TEXT NOT NULL,
    "cityVillage" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "ward" TEXT,
    "landmark" TEXT,
    "distanceFrom" TEXT,

    CONSTRAINT "PropertyLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPricing" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "negotiable" BOOLEAN NOT NULL DEFAULT true,
    "pricingType" TEXT NOT NULL,
    "unit" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "priceInWords" TEXT,
    "priceNegotiable" DOUBLE PRECISION,
    "priceNegotiableInWords" TEXT,
    "rentPrice" DOUBLE PRECISION,

    CONSTRAINT "PropertyPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyOpenHouse" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "markOpenHouse" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "PropertyOpenHouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "imageOf" TEXT NOT NULL,
    "filename" TEXT NOT NULL,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyVideo" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "PropertyVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedInformation" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "featured_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured_till" TIMESTAMP(3),

    CONSTRAINT "FeaturedInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "property_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "property_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profile_picture" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "view_mode" TEXT NOT NULL DEFAULT 'classic',
    "show_like_button" BOOLEAN NOT NULL DEFAULT true,
    "show_share_button" BOOLEAN NOT NULL DEFAULT true,
    "show_comment_button" BOOLEAN NOT NULL DEFAULT true,
    "show_contact_agent" BOOLEAN NOT NULL DEFAULT true,
    "show_featured_properties" BOOLEAN NOT NULL DEFAULT true,
    "show_sponsored_deals" BOOLEAN NOT NULL DEFAULT true,
    "show_property_collection" BOOLEAN NOT NULL DEFAULT true,
    "show_explore_categories" BOOLEAN NOT NULL DEFAULT true,
    "show_hero_carousel_ad" BOOLEAN NOT NULL DEFAULT true,
    "show_feed_ad" BOOLEAN NOT NULL DEFAULT true,
    "homepage_config" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT 'About Namsari',
    "description" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "standard" TEXT,
    "group_info" TEXT,
    "content" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'user_generated',
    "moreInfo" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "view_mode" TEXT NOT NULL DEFAULT 'classic',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionProperty" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "mode" TEXT NOT NULL DEFAULT 'simple',
    "content" TEXT,
    "propertyTypes" TEXT,
    "purposes" TEXT,
    "natures" TEXT,
    "facings" TEXT,
    "district" TEXT,
    "cityVillage" TEXT,
    "area" TEXT,
    "roadAccess" TEXT,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "pricingUnit" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "remarks" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchTerm" (
    "id" SERIAL NOT NULL,
    "term" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "last_searched" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobListing" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "salary_range" TEXT,
    "application_steps" TEXT DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" SERIAL NOT NULL,
    "application_for_id" INTEGER NOT NULL,
    "applicant_name" TEXT NOT NULL,
    "applicant_email" TEXT NOT NULL,
    "applicant_phone" TEXT NOT NULL,
    "resume_url" TEXT,
    "cover_letter" TEXT,
    "moreinformation" TEXT DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportArticle" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "emoji" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "cover_image" TEXT,
    "category" TEXT,
    "author" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankRate" (
    "id" SERIAL NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "interest_from" TIMESTAMP(3) NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "interest_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "isSponsoredRel" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "position" TEXT NOT NULL DEFAULT 'feed',
    "budget" DOUBLE PRECISION,
    "durationDays" INTEGER,
    "targetViews" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdRate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdImpression" (
    "id" SERIAL NOT NULL,
    "adId" INTEGER NOT NULL,
    "viewerId" INTEGER,
    "sessionId" TEXT,
    "device" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdImpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdClick" (
    "id" SERIAL NOT NULL,
    "adId" INTEGER NOT NULL,
    "viewerId" INTEGER,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" SERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "page_url" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "sessionKey" TEXT,
    "operatingId" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastActive" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actionLink" TEXT,
    "actionId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "temp_account_id" TEXT NOT NULL,
    "account_id" INTEGER,
    "activity_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activity_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_type" TEXT,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PropertyToPropertyType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PropertyToPropertyPurpose" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PropertyToPropertyNature" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_type_idx" ON "users"("type");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_ownerId_actorId_key" ON "permissions"("ownerId", "actorId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_key" ON "Role"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_resource_action_key" ON "RolePermission"("resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_map_role_id_permission_id_key" ON "role_permission_map"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "KYC_userId_key" ON "KYC"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_propertyId_key" ON "Property"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyType_name_key" ON "PropertyType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyPurpose_name_key" ON "PropertyPurpose"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyNature_name_key" ON "PropertyNature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyFeatures_propertyId_key" ON "PropertyFeatures"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyLocation_propertyId_key" ON "PropertyLocation"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyPricing_propertyId_key" ON "PropertyPricing"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyOpenHouse_propertyId_key" ON "PropertyOpenHouse"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_property_id_user_id_key" ON "Like"("property_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_username_key" ON "Agency"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionProperty_collection_id_property_id_key" ON "CollectionProperty"("collection_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SearchTerm_term_key" ON "SearchTerm"("term");

-- CreateIndex
CREATE UNIQUE INDEX "JobListing_slug_key" ON "JobListing"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SupportArticle_slug_key" ON "SupportArticle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_slug_key" ON "Bank"("slug");

-- CreateIndex
CREATE INDEX "AdImpression_adId_created_at_idx" ON "AdImpression"("adId", "created_at");

-- CreateIndex
CREATE INDEX "AdClick_adId_created_at_idx" ON "AdClick"("adId", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "_PropertyToPropertyType_AB_unique" ON "_PropertyToPropertyType"("A", "B");

-- CreateIndex
CREATE INDEX "_PropertyToPropertyType_B_index" ON "_PropertyToPropertyType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PropertyToPropertyPurpose_AB_unique" ON "_PropertyToPropertyPurpose"("A", "B");

-- CreateIndex
CREATE INDEX "_PropertyToPropertyPurpose_B_index" ON "_PropertyToPropertyPurpose"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PropertyToPropertyNature_AB_unique" ON "_PropertyToPropertyNature"("A", "B");

-- CreateIndex
CREATE INDEX "_PropertyToPropertyNature_B_index" ON "_PropertyToPropertyNature"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_role_fkey" FOREIGN KEY ("role") REFERENCES "RolePermission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission_map" ADD CONSTRAINT "role_permission_map_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission_map" ADD CONSTRAINT "role_permission_map_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "RolePermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_listedById_fkey" FOREIGN KEY ("listedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_authorizedPersonId_fkey" FOREIGN KEY ("authorizedPersonId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyFeatures" ADD CONSTRAINT "PropertyFeatures_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyLocation" ADD CONSTRAINT "PropertyLocation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPricing" ADD CONSTRAINT "PropertyPricing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyOpenHouse" ADD CONSTRAINT "PropertyOpenHouse_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyVideo" ADD CONSTRAINT "PropertyVideo_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedInformation" ADD CONSTRAINT "FeaturedInformation_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionProperty" ADD CONSTRAINT "CollectionProperty_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionProperty" ADD CONSTRAINT "CollectionProperty_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_application_for_id_fkey" FOREIGN KEY ("application_for_id") REFERENCES "JobListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankRate" ADD CONSTRAINT "BankRate_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdImpression" ADD CONSTRAINT "AdImpression_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdClick" ADD CONSTRAINT "AdClick_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToPropertyType" ADD CONSTRAINT "_PropertyToPropertyType_A_fkey" FOREIGN KEY ("A") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToPropertyType" ADD CONSTRAINT "_PropertyToPropertyType_B_fkey" FOREIGN KEY ("B") REFERENCES "PropertyType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToPropertyPurpose" ADD CONSTRAINT "_PropertyToPropertyPurpose_A_fkey" FOREIGN KEY ("A") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToPropertyPurpose" ADD CONSTRAINT "_PropertyToPropertyPurpose_B_fkey" FOREIGN KEY ("B") REFERENCES "PropertyPurpose"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToPropertyNature" ADD CONSTRAINT "_PropertyToPropertyNature_A_fkey" FOREIGN KEY ("A") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToPropertyNature" ADD CONSTRAINT "_PropertyToPropertyNature_B_fkey" FOREIGN KEY ("B") REFERENCES "PropertyNature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

