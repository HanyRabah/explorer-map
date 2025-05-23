// pages/api/cities/index.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Get all cities
      try {
        const cities = await prisma.city.findMany({
          orderBy: {
            name: 'asc',
          },
          include: {
            _count: {
              select: { notes: true },
            },
          },
        });

        // Transform data to include note count
        const formattedCities = cities.map(city => ({
          id: city.id,
          name: city.name,
          nameArabic: city.nameArabic,
          geometry: city.geometry,
          notes: city._count.notes,
        }));

        res.status(200).json(formattedCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ message: 'Failed to fetch cities' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}