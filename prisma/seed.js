import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Check if cities already exist to prevent duplicate seeding
  const existingCities = await prisma.city.findMany({
    select: { name: true }
  });

  if (existingCities.length > 0) {
    console.log(`Database already contains ${existingCities.length} cities. Skipping seed.`);
    return;
  }

  const citiesData = [
    {
      name: 'Cairo',
      nameArabic: 'القاهرة',
      population: 9500000,
      area: 606,
      description: 'Cairo is the capital of Egypt and the largest city in the Arab world. It is located on the Nile River and is known for its ancient history, including the Giza Pyramid Complex and the Great Sphinx.',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [31.2357, 29.9844],
            [31.3557, 29.9844],
            [31.3557, 30.1244],
            [31.2357, 30.1244],
            [31.2357, 29.9844]
          ]
        ]
      }
    },
    {
      name: 'Alexandria',
      nameArabic: 'الإسكندرية',
      population: 5200000,
      area: 2679,
      description: 'Alexandria is the second-largest city in Egypt, located on the Mediterranean coast. It was founded by Alexander the Great and was once home to the Lighthouse of Alexandria, one of the Seven Wonders of the Ancient World.',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [29.8216, 31.1656],
            [30.0816, 31.1656],
            [30.0816, 31.3256],
            [29.8216, 31.3256],
            [29.8216, 31.1656]
          ]
        ]
      }
    },
    {
      name: 'Giza',
      nameArabic: 'الجيزة',
      population: 3628000,
      area: 1579.75,
      description: 'Giza is the third-largest city in Egypt. It is located on the west bank of the Nile, opposite Cairo. Giza is most famous for the Giza Plateau, which includes the iconic Great Pyramid of Giza, the Sphinx, and other ancient Egyptian monuments.',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [31.0800, 29.9600],
            [31.2200, 29.9600],
            [31.2200, 30.0800],
            [31.0800, 30.0800],
            [31.0800, 29.9600]
          ]
        ]
      }
    },
    {
      name: 'Luxor',
      nameArabic: 'الأقصر',
      population: 506000,
      area: 416,
      description: 'Luxor is a city on the east bank of the Nile River in southern Egypt. It\'s known for its ancient monuments, including the Karnak Temple Complex and the Valley of the Kings, a burial site of pharaohs including Tutankhamun.',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [32.6300, 25.6700],
            [32.6700, 25.6700],
            [32.6700, 25.7100],
            [32.6300, 25.7100],
            [32.6300, 25.6700]
          ]
        ]
      }
    },
    {
      name: 'Aswan',
      nameArabic: 'أسوان',
      population: 290000,
      area: 679,
      description: 'Aswan is a city in the south of Egypt, located on the east bank of the Nile. It is known for its beautiful Nile Valley scenery, significant archaeological sites, and its history as the ancient city of Swenett, which was the frontier town of Ancient Egypt facing the south.',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [32.8800, 24.0700],
            [32.9200, 24.0700],
            [32.9200, 24.1100],
            [32.8800, 24.1100],
            [32.8800, 24.0700]
          ]
        ]
      }
    },
    {
      name: 'Sharm El Sheikh',
      nameArabic: 'شرم الشيخ',
      population: 73000,
      area: 480,
      description: 'Sharm El Sheikh is an Egyptian resort town between the desert of the Sinai Peninsula and the Red Sea. It\'s known for its sheltered sandy beaches, clear waters and coral reefs. It\'s a popular diving and snorkeling destination with vibrant marine life.',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [34.3200, 27.8400],
            [34.3600, 27.8400],
            [34.3600, 27.8800],
            [34.3200, 27.8800],
            [34.3200, 27.8400]
          ]
        ]
      }
    }
  ];

  console.log(`Seeding ${citiesData.length} cities...`);
  
  // Insert cities
  for (const cityData of citiesData) {
    const city = await prisma.city.create({
      data: cityData
    });
    console.log(`Created city: ${city.name} (${city.id})`);
    
    // Create some sample notes for each city
    if (city.name === 'Cairo') {
      await prisma.note.createMany({
        data: [
          {
            title: 'Best Museums',
            content: 'The Egyptian Museum and the Grand Egyptian Museum are must-visit attractions in Cairo. They house the world\'s largest collection of Pharaonic antiquities.',
            cityId: city.id
          },
          {
            title: 'Transportation Tips',
            content: 'Cairo Metro is the fastest way to navigate the city and avoid traffic congestion. Taxis are abundant but make sure to agree on fare before starting the journey.',
            cityId: city.id
          }
        ]
      });
    } else if (city.name === 'Alexandria') {
      await prisma.note.createMany({
        data: [
          {
            title: 'Beaches',
            content: 'Montazah Beach and Maamoura Beach are some of the nicest beaches in Alexandria. The sea is particularly beautiful in the early morning.',
            cityId: city.id
          }
        ]
      });
    } else if (city.name === 'Luxor') {
      await prisma.note.createMany({
        data: [
          {
            title: 'Best Time to Visit',
            content: 'October to April is the best time to visit Luxor, as the temperatures are cooler. Summer can be extremely hot with temperatures exceeding 40°C.',
            cityId: city.id
          },
          {
            title: 'Valley of the Kings',
            content: 'Tickets to the Valley of the Kings include entry to three tombs of your choice. Not all tombs are open at the same time, so check in advance which ones you can visit.',
            cityId: city.id
          }
        ]
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });