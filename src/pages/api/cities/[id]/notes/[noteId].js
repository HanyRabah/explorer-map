// pages/api/cities/[id]/notes/[noteId].js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id: cityId, noteId } = req.query;
  const { method } = req;

  // Validate inputs
  if (!cityId || !noteId) {
    return res.status(400).json({ message: 'City ID and Note ID are required' });
  }

  // Try to parse noteId as an integer (since Prisma expects numeric ID)
  let parsedNoteId;
  try {
    parsedNoteId = parseInt(noteId, 10);
    if (isNaN(parsedNoteId)) {
      return res.status(400).json({ message: 'Invalid Note ID format' });
    }
  } catch (error) {
    return res.status(400).json({ message: 'Invalid Note ID format' });
  }

  // Check if the note exists and belongs to the specified city
  try {
    const note = await prisma.note.findFirst({
      where: {
        id: parsedNoteId,
        cityId: cityId
      }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found for this city' });
    }

    // Process the request based on HTTP method
    switch (method) {
      case 'DELETE':
        try {
          // Delete the note
          await prisma.note.delete({
            where: {
              id: parsedNoteId
            }
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

          return res.status(200).json({ 
            message: 'Note deleted successfully',
            city: {
              id: updatedCity.id,
              notes: updatedCity._count.notes
            }
          });
        } catch (error) {
          console.error('Error deleting note:', error);
          return res.status(500).json({ message: 'Failed to delete note' });
        }

      case 'GET':
        // Return the note
        return res.status(200).json(note);

      case 'PUT':
        // Update the note
        try {
          const { title, content } = req.body;

          // Validate required fields
          if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
          }

          const updatedNote = await prisma.note.update({
            where: {
              id: parsedNoteId
            },
            data: {
              title,
              content
            }
          });

          return res.status(200).json(updatedNote);
        } catch (error) {
          console.error('Error updating note:', error);
          return res.status(500).json({ message: 'Failed to update note' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error processing note request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}