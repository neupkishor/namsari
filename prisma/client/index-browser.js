
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  contact_number: 'contact_number',
  type: 'type',
  bio: 'bio',
  profile_picture: 'profile_picture',
  cover_image: 'cover_image',
  status: 'status',
  moreInfo: 'moreInfo',
  created_on: 'created_on',
  updated_at: 'updated_at',
  agency_id: 'agency_id',
  roleId: 'roleId'
};

exports.Prisma.PropertyDraftScalarFieldEnum = {
  id: 'id',
  changes: 'changes',
  doing: 'doing',
  created_by: 'created_by',
  account_id: 'account_id',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AgencyConfigScalarFieldEnum = {
  id: 'id',
  agencyId: 'agencyId',
  compulsoryFields: 'compulsoryFields',
  defUnits: 'defUnits',
  reviewRequired: 'reviewRequired',
  defaultLocation: 'defaultLocation',
  minPhotoCount: 'minPhotoCount',
  canAgentChangeInfo: 'canAgentChangeInfo',
  canAgentDelete: 'canAgentDelete',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  type: 'type',
  provider: 'provider',
  provider_account_id: 'provider_account_id',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  password_hash: 'password_hash',
  role: 'role'
};

exports.Prisma.UserPermissionScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  actorId: 'actorId',
  permissions: 'permissions',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  role: 'role',
  description: 'description',
  permissions: 'permissions',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  id: 'id',
  resource: 'resource',
  action: 'action'
};

exports.Prisma.RolePermissionMapScalarFieldEnum = {
  id: 'id',
  role_id: 'role_id',
  permission_id: 'permission_id'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  rating: 'rating',
  comment: 'comment',
  author_id: 'author_id',
  receiver_id: 'receiver_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.KYCScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  isPrivate: 'isPrivate',
  status: 'status',
  soldStatus: 'soldStatus',
  isFeatured: 'isFeatured',
  isExclusive: 'isExclusive',
  isVerified: 'isVerified',
  remarks: 'remarks',
  roadType: 'roadType',
  roadSize: 'roadSize',
  facingDirection: 'facingDirection',
  price: 'price',
  detailedPrice: 'detailedPrice',
  media: 'media',
  mainMedia: 'mainMedia',
  amenities: 'amenities',
  listedById: 'listedById',
  title: 'title',
  slug: 'slug',
  locationData: 'locationData',
  created_on: 'created_on',
  updated_at: 'updated_at',
  views: 'views',
  shares: 'shares'
};

exports.Prisma.PropertyTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  propertyCount: 'propertyCount',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyPurposeScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.PropertyNatureScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.PropertyFeaturesScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
  kitchens: 'kitchens',
  livingRooms: 'livingRooms',
  floorNumber: 'floorNumber',
  totalFloors: 'totalFloors',
  furnishing: 'furnishing',
  builtUpArea: 'builtUpArea',
  builtUpAreaUnit: 'builtUpAreaUnit',
  parkingAvailable: 'parkingAvailable',
  elevator: 'elevator',
  security: 'security',
  waterSupply: 'waterSupply',
  electricity: 'electricity'
};

exports.Prisma.PropertyLocationScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  latitude: 'latitude',
  longitude: 'longitude',
  country: 'country',
  province: 'province',
  district: 'district',
  cityVillage: 'cityVillage',
  area: 'area',
  ward: 'ward',
  landmark: 'landmark',
  distanceFrom: 'distanceFrom'
};

exports.Prisma.LocationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  parentId: 'parentId',
  details: 'details'
};

exports.Prisma.PropertyOpenHouseScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  markOpenHouse: 'markOpenHouse',
  date: 'date',
  startTime: 'startTime',
  endTime: 'endTime',
  latitude: 'latitude',
  longitude: 'longitude'
};

exports.Prisma.PropertyImageScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  url: 'url',
  imageOf: 'imageOf',
  filename: 'filename'
};

exports.Prisma.PropertyVideoScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  url: 'url',
  type: 'type'
};

exports.Prisma.MediaScalarFieldEnum = {
  id: 'id',
  uploaderId: 'uploaderId',
  url: 'url',
  path: 'path',
  uploadType: 'uploadType',
  originalName: 'originalName',
  fileName: 'fileName',
  mime: 'mime',
  originalSize: 'originalSize',
  compressedSize: 'compressedSize',
  storedSize: 'storedSize',
  sha256: 'sha256',
  width: 'width',
  height: 'height',
  providerResponse: 'providerResponse',
  folderId: 'folderId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MediaFolderScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  fullPath: 'fullPath',
  parentId: 'parentId',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeaturedInformationScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  is_active: 'is_active',
  featured_on: 'featured_on',
  featured_till: 'featured_till'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  created_at: 'created_at',
  property_id: 'property_id',
  user_id: 'user_id'
};

exports.Prisma.LikeScalarFieldEnum = {
  id: 'id',
  created_at: 'created_at',
  property_id: 'property_id',
  user_id: 'user_id'
};

exports.Prisma.AgencyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  username: 'username',
  profile_picture: 'profile_picture',
  email: 'email',
  phone: 'phone',
  bio: 'bio',
  website: 'website',
  facebook: 'facebook',
  instagram: 'instagram',
  twitter: 'twitter',
  linkedin: 'linkedin',
  is_verified: 'is_verified',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SystemSettingsScalarFieldEnum = {
  id: 'id',
  view_mode: 'view_mode',
  show_like_button: 'show_like_button',
  show_share_button: 'show_share_button',
  show_comment_button: 'show_comment_button',
  show_contact_agent: 'show_contact_agent',
  show_featured_properties: 'show_featured_properties',
  show_sponsored_deals: 'show_sponsored_deals',
  show_property_collection: 'show_property_collection',
  show_explore_categories: 'show_explore_categories',
  show_hero_carousel_ad: 'show_hero_carousel_ad',
  show_feed_ad: 'show_feed_ad',
  homepage_config: 'homepage_config',
  updated_at: 'updated_at'
};

exports.Prisma.AboutContentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  mission: 'mission',
  vision: 'vision',
  standard: 'standard',
  group_info: 'group_info',
  content: 'content',
  updated_at: 'updated_at'
};

exports.Prisma.CollectionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  type: 'type',
  moreInfo: 'moreInfo',
  is_public: 'is_public',
  view_mode: 'view_mode',
  created_at: 'created_at',
  updated_at: 'updated_at',
  user_id: 'user_id'
};

exports.Prisma.CollectionPropertyScalarFieldEnum = {
  id: 'id',
  collection_id: 'collection_id',
  property_id: 'property_id',
  added_at: 'added_at'
};

exports.Prisma.RequirementScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  mode: 'mode',
  content: 'content',
  propertyTypes: 'propertyTypes',
  purposes: 'purposes',
  natures: 'natures',
  facings: 'facings',
  district: 'district',
  cityVillage: 'cityVillage',
  area: 'area',
  roadAccess: 'roadAccess',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  pricingUnit: 'pricingUnit',
  latitude: 'latitude',
  longitude: 'longitude',
  remarks: 'remarks',
  is_public: 'is_public',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SubscriberScalarFieldEnum = {
  id: 'id',
  email: 'email',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SearchTermScalarFieldEnum = {
  id: 'id',
  term: 'term',
  count: 'count',
  last_searched: 'last_searched'
};

exports.Prisma.JobListingScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  department: 'department',
  location: 'location',
  type: 'type',
  description: 'description',
  requirements: 'requirements',
  salary_range: 'salary_range',
  application_steps: 'application_steps',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.JobApplicationScalarFieldEnum = {
  id: 'id',
  application_for_id: 'application_for_id',
  applicant_name: 'applicant_name',
  applicant_email: 'applicant_email',
  applicant_phone: 'applicant_phone',
  resume_url: 'resume_url',
  cover_letter: 'cover_letter',
  moreinformation: 'moreinformation',
  status: 'status',
  created_at: 'created_at'
};

exports.Prisma.SupportArticleScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  category: 'category',
  content: 'content',
  emoji: 'emoji',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.BlogPostScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  content: 'content',
  excerpt: 'excerpt',
  cover_image: 'cover_image',
  category: 'category',
  author: 'author',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.BankScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  icon: 'icon',
  description: 'description',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.BankRateScalarFieldEnum = {
  id: 'id',
  bank_id: 'bank_id',
  interest_from: 'interest_from',
  interest: 'interest',
  interest_to: 'interest_to',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdvertisementScalarFieldEnum = {
  id: 'id',
  title: 'title',
  image: 'image',
  link: 'link',
  isSponsoredRel: 'isSponsoredRel',
  userId: 'userId',
  status: 'status',
  rejectionReason: 'rejectionReason',
  position: 'position',
  budget: 'budget',
  durationDays: 'durationDays',
  targetViews: 'targetViews',
  startDate: 'startDate',
  endDate: 'endDate',
  views: 'views',
  clicks: 'clicks',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdRateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  price: 'price',
  duration: 'duration',
  position: 'position',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdImpressionScalarFieldEnum = {
  id: 'id',
  adId: 'adId',
  viewerId: 'viewerId',
  sessionId: 'sessionId',
  device: 'device',
  userAgent: 'userAgent',
  ipAddress: 'ipAddress',
  created_at: 'created_at'
};

exports.Prisma.AdClickScalarFieldEnum = {
  id: 'id',
  adId: 'adId',
  viewerId: 'viewerId',
  sessionId: 'sessionId',
  userAgent: 'userAgent',
  created_at: 'created_at'
};

exports.Prisma.VisitorScalarFieldEnum = {
  id: 'id',
  session_id: 'session_id',
  page_url: 'page_url',
  user_agent: 'user_agent',
  ip_address: 'ip_address',
  created_at: 'created_at'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires',
  sessionKey: 'sessionKey',
  operatingId: 'operatingId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  lastActive: 'lastActive'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  message: 'message',
  type: 'type',
  actionLink: 'actionLink',
  actionId: 'actionId',
  isRead: 'isRead',
  created_at: 'created_at'
};

exports.Prisma.ActivityLogScalarFieldEnum = {
  id: 'id',
  temp_account_id: 'temp_account_id',
  account_id: 'account_id',
  activity_on: 'activity_on',
  activity_type: 'activity_type',
  description: 'description',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  device_type: 'device_type'
};

exports.Prisma.ErrorLogScalarFieldEnum = {
  id: 'id',
  message: 'message',
  source: 'source',
  page: 'page',
  stack: 'stack',
  log: 'log',
  occurred_at: 'occurred_at',
  created_at: 'created_at',
  userId: 'userId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.AccountType = exports.$Enums.AccountType = {
  user: 'user',
  agent: 'agent',
  agency: 'agency',
  admin: 'admin',
  owner: 'owner',
  advertiser: 'advertiser',
  bank: 'bank'
};

exports.AccountProvider = exports.$Enums.AccountProvider = {
  bank: 'bank',
  agency: 'agency'
};

exports.Prisma.ModelName = {
  User: 'User',
  PropertyDraft: 'PropertyDraft',
  AgencyConfig: 'AgencyConfig',
  Account: 'Account',
  UserPermission: 'UserPermission',
  Role: 'Role',
  RolePermission: 'RolePermission',
  RolePermissionMap: 'RolePermissionMap',
  Review: 'Review',
  KYC: 'KYC',
  Property: 'Property',
  PropertyType: 'PropertyType',
  PropertyPurpose: 'PropertyPurpose',
  PropertyNature: 'PropertyNature',
  PropertyFeatures: 'PropertyFeatures',
  PropertyLocation: 'PropertyLocation',
  Location: 'Location',
  PropertyOpenHouse: 'PropertyOpenHouse',
  PropertyImage: 'PropertyImage',
  PropertyVideo: 'PropertyVideo',
  Media: 'Media',
  MediaFolder: 'MediaFolder',
  FeaturedInformation: 'FeaturedInformation',
  Comment: 'Comment',
  Like: 'Like',
  Agency: 'Agency',
  SystemSettings: 'SystemSettings',
  AboutContent: 'AboutContent',
  Collection: 'Collection',
  CollectionProperty: 'CollectionProperty',
  Requirement: 'Requirement',
  Subscriber: 'Subscriber',
  SearchTerm: 'SearchTerm',
  JobListing: 'JobListing',
  JobApplication: 'JobApplication',
  SupportArticle: 'SupportArticle',
  BlogPost: 'BlogPost',
  Bank: 'Bank',
  BankRate: 'BankRate',
  Advertisement: 'Advertisement',
  AdRate: 'AdRate',
  AdImpression: 'AdImpression',
  AdClick: 'AdClick',
  Visitor: 'Visitor',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  Notification: 'Notification',
  ActivityLog: 'ActivityLog',
  ErrorLog: 'ErrorLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
