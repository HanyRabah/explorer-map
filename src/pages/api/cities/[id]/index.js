// pages/api/cities/[id]/index.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'City ID is required' });
  }

  switch (method) {
    case 'GET':
      // Get a specific city
      try {
        const city = await prisma.city.findUnique({
          where: { id },
          include: {
            _count: {
              select: { notes: true },
            },
          },
        });

        if (!city) {
          return res.status(404).json({ message: 'City not found' });
        }

        // Transform data to include note count
        const formattedCity = {
          id: city.id,
          name: city.name,
          nameArabic: city.nameArabic,
          geometry: city.geometry,
          notes: city._count.notes,
        };

        res.status(200).json(formattedCity);
      } catch (error) {
        console.error('Error fetching city:', error);
        res.status(500).json({ message: 'Failed to fetch city' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}