// pages/api/cities/[id]/notes/index.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { id: cityId } = req.query;

  if (!cityId) {
    return res.status(400).json({ message: 'City ID is required' });
  }

  // Check if the city exists
  try {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
  } catch (error) {
    console.error('Error checking city existence:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

  switch (method) {
    case 'GET':
      // Get all notes for a city
      try {
        const notes = await prisma.note.findMany({
          where: { cityId },
          orderBy: { createdAt: 'desc' },
        });

        res.status(200).json(notes);
      } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: 'Failed to fetch notes' });
      }
      break;

    case 'POST':
      // Create a new note for a city
      try {
        const { title, content } = req.body;

        // Validate required fields
        if (!title || !content) {
          return res.status(400).json({ message: 'Title and content are required' });
        }

        const note = await prisma.note.create({
          data: {
            title,
            content,
            cityId,
          },
        });

        // Update the city's note count in the response
        const updatedCity = await prisma.city.findUnique({
          where: { id: cityId },
          include: {
            _count: {
              select: { notes: true },
            },
          },
        });

        res.status(201).json({
          ...note,
          city: {
            id: updatedCity.id,
            notes: updatedCity._count.notes
          }
        });
      } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ message: 'Failed to create note' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}