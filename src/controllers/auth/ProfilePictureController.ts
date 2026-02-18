import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../models/user.js";
import { Driver } from "../../models/driver.js";
import { supabase } from "../../utils/supabase.js";
import { envs } from "../../config/env.config.js";

export class ProfilePictureController {
  static async upload(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: "No se proporcionó ninguna imagen" });
    }

    const { id: userId, role } = request.user as { id: string, role: string };

    try {
      const fileExtension = data.filename.split('.').pop();
      const fileName = `${role}/${userId}-${Date.now()}.${fileExtension}`;
      const bucketName = envs.SUPABASE_BUCKET;

      // 1. Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, await data.toBuffer(), {
          contentType: data.mimetype,
          upsert: true
        });

      if (uploadError) {
        if (uploadError.message.includes("row-level security policy")) {
          console.error("🚨 ERROR DE PERMISOS SUPABASE: Parece que estás usando la 'Anon Key'. Debes usar la 'Service Role Key' en el .env del Backend para subir archivos sin restricciones.");
        }
        throw uploadError;
      }

      // 2. Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // 3. Actualizar MongoDB (User o Driver)
      let updatedUser;
      if (role === 'passenger' || role === 'admin') {
        updatedUser = await User.findByIdAndUpdate(
          userId,
          { profilePictureUrl: publicUrl },
          { new: true }
        ).lean();
      } else if (role === 'driver') {
        updatedUser = await Driver.findByIdAndUpdate(
          userId,
          { profilePictureUrl: publicUrl },
          { new: true }
        ).lean();
      } else {
        throw new Error("Rol no válido");
      }

      return {
        message: "Foto de perfil actualizada",
        url: publicUrl,
        user: updatedUser
      };
    } catch (error: any) {
      console.error("Error en upload profile picture:", error);
      return reply.status(500).send({ error: error.message });
    }
  }
}
