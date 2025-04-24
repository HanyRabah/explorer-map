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
          ...city,
          notes: city._count.notes,
          _count: undefined
        }));

        res.status(200).json(formattedCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ message: 'Failed to fetch cities' });
      }
      break;

    case 'POST':
      // Create a new city
      try {
        const { name, nameArabic, population, area, description, geometry } = req.body;

        // Validate required fields
        if (!name || !geometry) {
          return res.status(400).json({ message: 'Name and geometry are required' });
        }

        const city = await prisma.city.create({
          data: {
            name,
            nameArabic,
            population,
            area,
            description,
            geometry,
          },
        });

        res.status(201).json(city);
      } catch (error) {
        console.error('Error creating city:', error);
        res.status(500).json({ message: 'Failed to create city' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}