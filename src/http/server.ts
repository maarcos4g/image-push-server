import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { fastifyMultipart } from "@fastify/multipart";

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod";

import swagger from '@fastify/swagger'
import scalar from '@scalar/fastify-api-reference'

import { uploadImage } from "./routes/upload-image.ts";
import { getDownloadURL } from "./routes/get-download-url.ts";
import { errorHandler } from "@/error-handler.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(swagger, {
  openapi: {
    info: {
      title: 'Image Push API',
      description: 'API for uploading and retrieving images',
      version: '1.0.0'
    }
  },
  transform: jsonSchemaTransform
})

app.register(scalar, {
  routePrefix: '/docs',
  configuration: {
    darkMode: true,
  }
})

app.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
})
app.register(fastifyMultipart)

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.get('/health', async (_, reply) => {
  return reply.send({ message: 'OK' })
})

//routes
app.register(uploadImage)
app.register(getDownloadURL)

app.setErrorHandler(errorHandler)

app.listen({
  port: 3333,
  host: '0.0.0.0'
}).then(() => console.log('🔥 HTTP Server Running...'))