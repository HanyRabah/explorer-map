import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { id: cityId, noteId } = req.query;

  if (!cityId || !noteId) {
    return res.status(400).json({ message: 'City ID and Note ID are required' });
  }

  switch (method) {
    case 'GET':
      // Get a specific note
      try {
        const note = await prisma.note.findUnique({
          where: { 
            id: noteId,
            cityId,
          },
        });

        if (!note) {
          return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json(note);
      } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ message: 'Failed to fetch note' });
      }
      break;

    case 'PUT':
      // Update a note
      try {
        const { title, content } = req.body;

        // Validate required fields
        if (!title || !content) {
          return res.status(400).json({ message: 'Title and content are required' });
        }

        const updatedNote = await prisma.note.update({
          where: { 
            id: noteId,
          },
          data: {
            title,
            content,
          },
        });

        res.status(200).json(updatedNote);
      } catch (error) {
        console.error('Error updating note:', error);
        
        if (error.code === 'P2025') {
          return res.status(404).json({ message: 'Note not found' });
        }
        
        res.status(500).json({ message: 'Failed to update note' });
      }
      break;

    case 'DELETE':
      // Delete a note
      try {
        const deletedNote = await prisma.note.delete({
          where: { 
            id: noteId,
          },
        });

        res.status(200).json(deletedNote);
      } catch (error) {
        console.error('Error deleting note:', error);
        
        if (error.code === 'P2025') {
          return res.status(404).json({ message: 'Note not found' });
        }
        
        res.status(500).json({ message: 'Failed to delete note' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}