import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Dynamically import bcryptjs to avoid issues with standard require in some TS setups if not configured
    // But since this is a seed script run by tsx, standard import works if we were using modules.
    const bcrypt = await import('bcryptjs');
    const password = "password123";
    const hashedPassword = await bcrypt.default.hash(password, 10);

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { username: 'neupkishor' },
        update: {
            password: hashedPassword,
            status: 'active',
            account_type: 'admin',
            profile_picture: 'https://cdn.neupgroup.com/namsari/f_697f571bf16e60.87332081.jpg',
        },
        create: {
            username: 'neupkishor',
            name: 'Kishor Neupane',
            email: 'neupkishor@neupgroup.com',
            password: hashedPassword,
            status: 'active',
            account_type: 'admin',
            bio: 'System Administrator',
            contact_number: '9840710507',
            profile_picture: 'https://cdn.neupgroup.com/namsari/f_697f571bf16e60.87332081.jpg',
        },
    });

    console.log("Admin seeded:", admin.username);

    // Create Fake Users (Agents & Owners)
    const usersData = [
        { username: 'rajesh_hamal', name: 'Rajesh Hamal', type: 'agent', bio: 'Top rated agent in Kathmandu.', image: 'https://cdn.neupgroup.com/namsari/f_697f5804881e32.02949645.jpg' },
        { username: 'anmol_kc', name: 'Anmol K.C.', type: 'agent', bio: 'Premium real estate solutions.', image: 'https://cdn.neupgroup.com/namsari/f_697f5853c286a4.56140346.jpg' },
        { username: 'sanjaynepal', name: 'Sanjay Nepal', type: 'agent', bio: 'Direct owner of luxury apartments.', image: 'https://cdn.neupgroup.com/namsari/f_697f587a575fb5.38497944.jpeg' },
        { username: 'pokhara_realty', name: 'Pokhara Realty', type: 'agency', bio: 'Best deals in Pokhara.', image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { username: 'chitwan_land', name: 'Hari Bansha', type: 'agent', bio: 'Land specialist in Chitwan.', image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
    ];

    const users = [];
    for (const u of usersData) {
        const user = await prisma.user.upsert({
            where: { username: u.username },
            update: {
                password: hashedPassword,
                profile_picture: u.image
            },
            create: {
                username: u.username,
                name: u.name,
                email: `${u.username}@example.com`,
                password: hashedPassword,
                account_type: u.type,
                bio: u.bio,
                contact_number: '9840000000',
                status: 'active',
                profile_picture: u.image
            }
        });
        users.push(user);
    }
    console.log(`Seeded ${users.length} fake users.`);

    // Create Requirements
    await prisma.requirement.createMany({
        data: [
            { userId: users[0].id, mode: 'simple', content: 'Looking for 4BHK House in Bhaisepati, budget 5Cr.' },
            { userId: users[2].id, mode: 'detailed', propertyTypes: 'Land', district: 'Kathmandu', maxPrice: 50000000, remarks: 'Urgent requirement for commercial land.' }
        ]
    });

    // Create Collections
    // Create Collections (Upsert to avoid duplicates)
    const collection = await prisma.collection.upsert({
        where: { slug: 'luxury-villas-kathmandu' },
        update: {},
        create: {
            name: 'Luxury Villas',
            slug: 'luxury-villas-kathmandu',
            type: 'system_generated',
            is_public: true,
            user: { connect: { id: admin.id } }
        }
    });

    // Create Properties
    const propertyTypes = ['House', 'Land', 'Apartment', 'Commercial'];
    const locations = ['Bhaisepati', 'Budhanilkantha', 'Baneshwor', 'Jhamsikhel', 'Lazimpat', 'Pokhara Lakeside', 'Chitwan Sauraha'];

    // Helper to get random item
    const rnd = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

    // Property Titles Template
    const titles = [
        'Beautiful House for Sale', 'Commercial Land on Main Road', 'Luxury Apartment Ready to Move',
        'Traditional Bungalow with Garden', 'Office Space in Prime Location', 'Agricultural Land for Sale',
        'Modern Villa with Pool', 'Cheap Land for Investment'
    ];

    for (let i = 0; i < 20; i++) {
        const owner = users[i % users.length];
        const location = rnd(locations);
        const typeStr = rnd(propertyTypes);
        const title = `${typeStr} in ${location} - ${titles[i % titles.length]}`; // Use deterministic title index
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check if property exists to avoid duplicates
        const existingProperty = await prisma.property.findFirst({
            where: { slug: slug }
        });

        if (existingProperty) continue;

        const price = 5000000 + Math.floor(Math.random() * 95000000); // 50L to 10Cr

        const prop = await prisma.property.create({
            data: {
                title: title,
                slug: slug,
                listedById: owner.id,
                ownerId: owner.id,
                status: 'approved',
                // priceInWords removed from root Property model
                isFeatured: i % 5 === 0, // Every 5th property is featured

                // Relations (Simplified creation logic, ideally create types first but Prisma allows connect/create logic or we just skip strict checks if types valid)
                // For valid seeding we need to connect to existing Type/Purpose/Nature to avoid duplicates or creating new ones strictly. 
                // Let's assume we create just the property fields for now or do simple writes.

                // Using nested writes for required relations to keep it simple if they don't exist
                types: {
                    connectOrCreate: { where: { name: typeStr.toLowerCase() }, create: { name: typeStr.toLowerCase() } }
                },
                purposes: {
                    connectOrCreate: { where: { name: i % 2 === 0 ? 'sale' : 'rent' }, create: { name: i % 2 === 0 ? 'sale' : 'rent' } }
                },
                natures: {
                    connectOrCreate: { where: { name: 'residential' }, create: { name: 'residential' } }
                },

                location: {
                    create: {
                        district: 'Kathmandu',
                        cityVillage: 'Kathmandu',
                        area: location,
                    }
                },
                pricing: {
                    create: {
                        price: price,
                        pricingType: 'flat',
                        negotiable: true,
                    }
                },
                features: {
                    create: {
                        bedrooms: Math.floor(Math.random() * 5) + 1,
                        bathrooms: Math.floor(Math.random() * 4) + 1,
                        floorNumber: Math.floor(Math.random() * 3) + 1,
                        furnishing: i % 2 === 0 ? 'Full-furnished' : 'Semi-furnished'
                    }
                },
                images: {
                    create: [
                        { url: 'https://images.unsplash.com/photo-1600596542815-60c37c65b567?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', imageOf: 'exterior', filename: `ext-${slug}` },
                        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', imageOf: 'livingroom', filename: `liv-${slug}` }
                    ]
                }
            }
        });

        // Add some to collection
        if (i < 5) {
            // Upsert collection item
            const existingItem = await prisma.collectionProperty.findFirst({
                where: {
                    collection_id: collection.id,
                    property_id: prop.id
                }
            });

            if (!existingItem) {
                await prisma.collectionProperty.create({
                    data: {
                        collection_id: collection.id,
                        property_id: prop.id
                    }
                });
            }
        }
    }

    console.log("Seeded properties.");
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
