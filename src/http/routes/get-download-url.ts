import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { getPublicURLFromKeyName } from "@/services/supabase.ts";
import { z } from "zod/v4";
import { db } from "@/db/connection.ts";
import { schema } from "@/db/schema/index.ts";
import { eq } from "drizzle-orm";

export const getDownloadURL: FastifyPluginCallbackZod = (app) => {
  app
    .get(
      '/url/:fileKey',
      {
        schema: {
          params: z.object({
            fileKey: z.uuid()
          })
        }
      },
      async (request, reply) => {
        const { fileKey } = request.params

        const result = await db
          .select()
          .from(schema.files)
          .where(eq(schema.files.key, fileKey))

        const file = result[0]

        if (!file) {
          return reply.status(404).send({ error: 'File not found' })
        }

        const extension = file.contentType.split('/')[1]
        const fileName = `${fileKey}.${extension}`

        const { downloadURL } = await getPublicURLFromKeyName(fileName)

        reply.redirect(downloadURL, 301)
      })
}