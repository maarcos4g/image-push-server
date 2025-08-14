import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { uploadImage as uploadFile } from "@/services/supabase.ts";
import { db } from "@/db/connection.ts";
import { schema } from "@/db/schema/index.ts";
import { randomUUID } from "node:crypto";
import { ClientError } from "../_errors/client-error.ts";
import z from "zod/v4";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { FastifyPluginCallback } from "fastify";

extendZodWithOpenApi(z);

export const uploadImage: FastifyPluginCallback = (app) => {
  app
    .post('/upload',
      {
        schema: {
          summary: 'Upload an image file',
          description: 'Uploads an image to Supabase Storage and stores its metadata in the database.',
          consumes: ['multipart/form-data'],
          response: {
            201: z.object({
              fileKey: z.uuid().openapi({
                description: 'Unique identifier of the uploaded file',
                example: 'b3c12de2-b691-4d1b-b523-0617ea868c8d'
              })
            })
              .describe('Response when upload and create file.'),
          }
        },
        attachValidation: false,
      },
      async (request, reply) => {
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