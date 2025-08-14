import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { getPublicURLFromKeyName } from "@/services/supabase.ts";
import { z } from "zod/v4";
import { db } from "@/db/connection.ts";
import { schema } from "@/db/schema/index.ts";
import { eq } from "drizzle-orm";
import { ClientError } from "../_errors/client-error.ts";
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z)

const GetDownloadURLParamSchema = z.object({
  fileKey: z.uuid().openapi({
    description: 'The unique identifier for the file.',
    example: 'c7c19327-9bec-4b73-aeca-9dd317c9681c'
  }).openapi({
    example: 'c7c19327-9bec-4b73-aeca-9dd317c9681c'
  })
})


export const getDownloadURL: FastifyPluginCallbackZod = (app) => {
  app
    .get(
      '/image/:fileKey',
      {
        schema: {
          summary: 'Get download URL for a file',
          description: 'Retrieves a signed URL for downloading a file by its key.',
          params: GetDownloadURLParamSchema.describe('Parameters for retrieving the download URL'),
          response: {
            301: z.null().describe('Redirects to the download URL'),
          }
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
          throw new ClientError('File not found.')
        }

        const extension = file.contentType.split('/')[1]
        const fileName = `${fileKey}.${extension}`

        const { downloadURL } = await getPublicURLFromKeyName(fileName)

        reply.redirect(downloadURL, 301)
      })
}