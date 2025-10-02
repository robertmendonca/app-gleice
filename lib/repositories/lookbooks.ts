import database from '@/lib/db';
import { createId, jsonArray, parseArray, toISO } from '@/lib/utils';
import type { UserRole } from '@/types/database';

const listAllStatement = database.prepare(
  `SELECT * FROM lookbooks ORDER BY datetime(created_at) DESC`
);

const listByConsultantStatement = database.prepare(
  `SELECT * FROM lookbooks WHERE consultant_id = ? ORDER BY datetime(created_at) DESC`
);

const listByClientStatement = database.prepare(
  `SELECT * FROM lookbooks WHERE client_id = ? ORDER BY datetime(created_at) DESC`
);

const getLookbookStatement = database.prepare(`SELECT * FROM lookbooks WHERE id = ?`);
const listItemsStatement = database.prepare(`SELECT * FROM lookbook_items WHERE lookbook_id = ? ORDER BY position ASC`);

const insertLookbookStatement = database.prepare(
  `INSERT INTO lookbooks (id, consultant_id, client_id, title, description, tags, cover_image, created_at, updated_at)
   VALUES (@id, @consultant_id, @client_id, @title, @description, @tags, @cover_image, @created_at, @updated_at)`
);

const updateLookbookStatement = database.prepare(
  `UPDATE lookbooks SET title = @title, description = @description, tags = @tags, client_id = @client_id,
   cover_image = @cover_image, updated_at = @updated_at WHERE id = @id AND consultant_id = @consultant_id`
);

const deleteLookbookStatement = database.prepare(`DELETE FROM lookbooks WHERE id = ? AND consultant_id = ?`);
const deleteItemsStatement = database.prepare(`DELETE FROM lookbook_items WHERE lookbook_id = ?`);

const insertItemStatement = database.prepare(
  `INSERT INTO lookbook_items (id, lookbook_id, image_url, description, tags, position)
   VALUES (@id, @lookbook_id, @image_url, @description, @tags, @position)`
);

export const lookbooksRepository = {
  listForUser(userId: string, role: UserRole) {
    if (role === 'ADMIN') return listAllStatement.all();
    if (role === 'CONSULTANT') return listByConsultantStatement.all(userId);
    return listByClientStatement.all(userId);
  },

  getById(id: string) {
    const lookbook = getLookbookStatement.get(id);
    if (!lookbook) return null;
    const items = listItemsStatement.all(id).map((item) => ({ ...item, tags: parseArray(item.tags) }));
    return { ...lookbook, tags: parseArray(lookbook.tags), items };
  },

  create(
    consultantId: string,
    data: {
      title: string;
      description?: string;
      clientId?: string;
      tags?: string[];
      coverImage?: string | null;
      items: Array<{ imageUrl: string; description?: string; tags?: string[] }>;
    }
  ) {
    const id = createId();
    const now = toISO();
    const tx = database.transaction(() => {
      insertLookbookStatement.run({
        id,
        consultant_id: consultantId,
        client_id: data.clientId ?? null,
        title: data.title,
        description: data.description ?? null,
        tags: jsonArray(data.tags),
        cover_image: data.coverImage ?? null,
        created_at: now,
        updated_at: now
      });

      data.items.forEach((item, index) => {
        insertItemStatement.run({
          id: createId(),
          lookbook_id: id,
          image_url: item.imageUrl,
          description: item.description ?? null,
          tags: jsonArray(item.tags),
          position: index
        });
      });
    });

    tx();
    return this.getById(id);
  },

  update(
    lookbookId: string,
    consultantId: string,
    data: {
      title: string;
      description?: string;
      clientId?: string;
      tags?: string[];
      coverImage?: string | null;
      items: Array<{ id?: string; imageUrl: string; description?: string; tags?: string[] }>;
    }
  ) {
    const now = toISO();
    const tx = database.transaction(() => {
      updateLookbookStatement.run({
        id: lookbookId,
        consultant_id: consultantId,
        title: data.title,
        description: data.description ?? null,
        tags: jsonArray(data.tags),
        client_id: data.clientId ?? null,
        cover_image: data.coverImage ?? null,
        updated_at: now
      });

      deleteItemsStatement.run(lookbookId);

      data.items.forEach((item, index) => {
        insertItemStatement.run({
          id: item.id ?? createId(),
          lookbook_id: lookbookId,
          image_url: item.imageUrl,
          description: item.description ?? null,
          tags: jsonArray(item.tags),
          position: index
        });
      });
    });

    tx();
    return this.getById(lookbookId);
  },

  delete(lookbookId: string, consultantId: string) {
    const tx = database.transaction(() => {
      deleteItemsStatement.run(lookbookId);
      deleteLookbookStatement.run(lookbookId, consultantId);
    });
    tx();
  }
};
