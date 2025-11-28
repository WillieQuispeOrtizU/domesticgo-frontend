import { Usuario } from "./usuario"
import { Servicio } from "./servicio"

export interface Resenia {
  idResenia: number
  fechaResenia: Date
  comentarioResenia: string
  calificacionResenia: number
  usuario: Usuario
  servicio: Servicio
}
