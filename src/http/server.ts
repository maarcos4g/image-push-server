import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { fastifyMultipart } from "@fastify/multipart";

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod";

import { uploadImage } from "./routes/upload-image.ts";
import { getDownloadURL } from "./routes/get-download-url.ts";
import { errorHandler } from "@/error-handler.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
})
app.register(fastifyMultipart)

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.get('/health', async () => {
  return 'OK!'
})

//routes
app.register(uploadImage)
app.register(getDownloadURL)

app.setErrorHandler(errorHandler)

app.listen({
  port: 3333,
  host: '0.0.0.0'
}).then(() => console.log('🔥 HTTP Server Running...'))