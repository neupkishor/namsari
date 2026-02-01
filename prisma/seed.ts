
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Common Data
const TYPES = ['House', 'Land', 'Apartment', 'Office Space', 'Shop Space']
const PURPOSES = ['Sale', 'Rent']
const NATURES = ['Residential', 'Commercial', 'Agricultural']

const NEPAL_CITIES = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Biratnagar', 'Dharan', 'Butwal']
const NEPAL_DISTRICTS = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kaski', 'Chitwan/Narayani', 'Morang', 'Sunsari', 'Rupandehi']

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Upsert Reference Data
    console.log('Creating Reference Data...')
    const dbTypes = await Promise.all(TYPES.map(name =>
        prisma.propertyType.upsert({ where: { name }, update: {}, create: { name } })
    ))
    const dbPurposes = await Promise.all(PURPOSES.map(name =>
        prisma.propertyPurpose.upsert({ where: { name }, update: {}, create: { name } })
    ))
    const dbNatures = await Promise.all(NATURES.map(name =>
        prisma.propertyNature.upsert({ where: { name }, update: {}, create: { name } })
    ))

    // 2. Create Users (200)
    console.log('Creating 200 Users...')
    const users = []
    for (let i = 0; i < 200; i++) {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const username = faker.internet.username({ firstName, lastName }) + Math.floor(Math.random() * 1000)

        // Check if distinct (simple retry logic or just append index to ensure uniqueness)
        // Using upsert would be safer but createMany is faster if no collisions. 
        // We'll iterate and create individually to capture IDs easily or just fetch all later.

        const user = await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                username: username,
                // No email field in User model
                // User model in schema provided earlier: username, name, contact_number, account_type, bio, profile_picture. 
                // KYC has email. User itself doesn't seem to have email in the provided ViewFile of line 1-334 (User model lines 13-34).
                // It has username @unique.
                contact_number: faker.phone.number(),
                account_type: Math.random() > 0.8 ? 'agency' : 'individual',
                bio: faker.person.bio(),
                profile_picture: faker.image.avatar(),
            }
        }).catch(e => {
            // Ignore unique constraint violations if unlucky
            console.warn(`Skipped user creation due to error: ${e.message.split('\n')[0]}`)
            return null;
        })

        if (user) users.push(user)
    }

    // Refetch all users to be safe or just use the array
    const allUserIds = users.map(u => u.id)

    if (allUserIds.length === 0) {
        console.error("No users created. Aborting.")
        return;
    }

    // 3. Create Properties (200)
    console.log('Creating 200 Properties...')
    const propertyIds = []

    for (let i = 0; i < 200; i++) {
        const ownerId = getRandomItem(allUserIds)
        const type = getRandomItem(dbTypes)
        const purpose = getRandomItem(dbPurposes)
        const nature = getRandomItem(dbNatures)

        // Helpers
        const isLand = type.name === 'Land'
        const isRent = purpose.name === 'Rent'
        const city = getRandomItem(NEPAL_CITIES)
        const district = NEPAL_DISTRICTS[NEPAL_CITIES.indexOf(city)]

        const price = isRent
            ? parseFloat(faker.commerce.price({ min: 10000, max: 200000 }))
            : parseFloat(faker.commerce.price({ min: 5000000, max: 100000000 }))

        const property = await prisma.property.create({
            data: {
                title: `${type.name} for ${purpose.name} in ${city}`,
                slug: faker.helpers.slugify(`${type.name} for ${purpose.name} in ${city} ${faker.string.alphanumeric(5)}`).toLowerCase(),

                // Ownership
                listedBy: { connect: { id: ownerId } },
                owner: { connect: { id: ownerId } },

                // Relations
                types: { connect: { id: type.id } },
                purposes: { connect: { id: purpose.id } },
                natures: { connect: { id: nature.id } },

                // Meta
                status: 'approved', // make them visible
                isFeatured: Math.random() > 0.9,
                views: faker.number.int({ min: 0, max: 5000 }),

                // Pricing
                pricing: {
                    create: {
                        price: price,
                        priceInWords: "Amount in words placeholder",
                        pricingType: isLand ? 'perUnit' : 'flat',
                        unit: isLand ? 'Aana' : undefined,
                        negotiable: true,
                        rentPrice: isRent ? price : null
                    }
                },

                // Location
                location: {
                    create: {
                        cityVillage: city,
                        district: district,
                        area: faker.location.street(),
                        latitude: faker.location.latitude({ min: 26, max: 30 }), // Roughly Nepal lat/long
                        longitude: faker.location.longitude({ min: 80, max: 88 })
                    }
                },

                // Features (randomized)
                features: {
                    create: {
                        bedrooms: isLand ? null : faker.number.int({ min: 1, max: 8 }),
                        bathrooms: isLand ? null : faker.number.int({ min: 1, max: 6 }),
                        builtUpArea: faker.number.float({ min: 500, max: 5000 }),
                        builtUpAreaUnit: 'sqft',
                        parkingAvailable: Math.random() > 0.5,
                        electricity: true,
                        waterSupply: true
                    }
                },

                // Random Images (Unsplash placeholders)
                images: {
                    create: [
                        {
                            url: `https://images.unsplash.com/photo-${faker.number.int({ min: 1000000000, max: 9999999999 })}?auto=format&fit=crop&w=800&q=80`, // Fake but valid format URL
                            // Better to use actual property keywords for unsplash source if possible, but faker image url is easier
                            // Let's use hardcoded nice property images from unsplash to avoid broken links
                            // Actually, let's use a small set of reliable images to ensure they load
                            filename: 'seed-image-1',
                            imageOf: 'Exterior'
                        }
                    ]
                }
            }
        })

        // Add realistic images
        // We update with real looking urls
        const imageUrls = [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3'
        ];
        const randomImg = getRandomItem(imageUrls) + '?auto=format&fit=crop&w=800&q=80';

        await prisma.propertyImage.updateMany({
            where: { propertyId: property.id },
            data: { url: randomImg }
        })

        propertyIds.push(property.id)
    }

    // 4. Create Collections (50)
    console.log('Creating 50 Collections...')
    for (let i = 0; i < 50; i++) {
        const ownerId = getRandomItem(allUserIds)
        const isSystem = Math.random() > 0.7

        // If system, add rules
        const moreInfo = isSystem ? JSON.stringify({
            minPrice: 1000000,
            maxPrice: 50000000,
            category: 'House',
            priceUnit: 'total'
        }) : null

        const collection = await prisma.collection.create({
            data: {
                name: isSystem ? `Smart: ${faker.word.adjective()} Homes` : `${faker.person.firstName()}'s Favorites`,
                description: faker.lorem.sentence(),
                is_public: true,
                type: isSystem ? 'system_generated' : 'user_generated',
                moreInfo: moreInfo,
                user: { connect: { id: ownerId } }
            }
        })

        // If manual (user_generated), add some properties
        if (!isSystem) {
            const numProps = faker.number.int({ min: 1, max: 10 })
            const shuffledProps = propertyIds.sort(() => 0.5 - Math.random()).slice(0, numProps)

            for (const pid of shuffledProps) {
                await prisma.collectionProperty.create({
                    data: {
                        collection_id: collection.id,
                        property_id: pid
                    }
                })
            }
        }
    }

    console.log('✅ Seeding completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
