import { FastifyReply, FastifyRequest } from "fastify";
import { supabase } from "../../utils/supabase.js";
import { envs } from "../../config/env.config.js";

export class UploadDocumentController {
  static async upload(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: "No se proporcionó ningún archivo" });
    }

    const { id: userId } = request.user as { id: string };

    try {
      const fileExtension = data.filename.split('.').pop();
      const fileName = `subsidios/${userId}-${Date.now()}.${fileExtension}`;
      const bucketName = envs.SUPABASE_BUCKET;

      // 1. Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, await data.toBuffer(), {
          contentType: data.mimetype,
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return {
        success: true,
        message: "Documento subido correctamente",
        url: publicUrl
      };
    } catch (error: any) {
      console.error("Error en upload document:", error);
      return reply.status(500).send({ error: error.message });
    }
  }
}
