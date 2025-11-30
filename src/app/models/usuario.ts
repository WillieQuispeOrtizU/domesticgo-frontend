import { Empleo } from "./empleo"
import { Role } from "./role"

export interface Usuario {
  idUsuario: number
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  empleo?: Empleo
  tipoDocumento: string
  numeroDocumento: string
  numeroCelular: string
  fechaNacimiento: string | Date
}
