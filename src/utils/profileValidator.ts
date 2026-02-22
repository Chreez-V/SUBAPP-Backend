export function verificarPerfilCompleto(user: any): void {
    // Requisitos mínimos: cédula, fecha de nacimiento y teléfono
    const missing = {
        cedula: !user?.cedula,
        birthDate: !user?.birthDate,
        phone: !user?.phone,
    }

    if (missing.cedula || missing.birthDate || missing.phone) {
        throw {
        statusCode: 400,
        code: 'PROFILE_INCOMPLETE',
        message: 'Debe completar su perfil (cédula, fecha de nacimiento, teléfono) antes de continuar.',
        missingFields: missing,
        }
    }
}
