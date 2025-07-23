import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { uploadImage as uploadFile } from "@/services/supabase.ts";
import { db } from "@/db/connection.ts";
import { schema } from "@/db/schema/index.ts";
import { randomUUID } from "node:crypto";
import { ClientError } from "../_errors/client-error.ts";

export const uploadImage: FastifyPluginCallbackZod = (app) => {
  app
    .post('/upload', async (request, reply) => {
      const file = await request.file()
      const fileKey = randomUUID()

      if (!file) {
        throw new ClientError('Image file is required')
      }

      await uploadFile(file, fileKey)

      const result = await db
        .insert(schema.files)
        .values({
          name: file.filename,
          contentType: file.mimetype,
          key: fileKey
        })
        .returning()

        if (!result[0]) {
          throw new ClientError('Failed to save file')
        }

      const fileResponse = result[0]

      return reply.status(201).send({ fileKey: fileResponse.key })
    })
}